import superagent from 'superagent';
import moment from 'moment';
import EventEmitter from 'eventemitter3';

function requestToPromise(req) {
  return new Promise((resolve, reject) => {
    req.end((err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

const POLICY_FIELDS_ORDER = [
  'acl',
  'bucket',
  'success_action_status',
  'key',
  'Content-Type',
  'x-amz-algorithm',
  'x-amz-credential',
  'x-amz-date',
  'x-amz-meta-originalFileName'
];

function policyToConditionsArray(policy) {
  return POLICY_FIELDS_ORDER.map(key => {
    return {
      [key]: policy[key]
    };
  });
}

function generatePolicy(object, uploaderConfig) {
  // FIX: We don't actually need moment
  const { handlerConfig: { accessKey, region, bucket, getFileName } } = uploaderConfig;
  const now = moment();
  const shortDate = now.format('YYYYMMDD');
  const longDate = now.format('YYYYMMDDTHHMMss\\Z');

  return {
    acl: 'private',
    bucket,
    success_action_status: '200',
    key: getFileName ? getFileName(object, uploaderConfig) : object.name,
    'Content-Type': object.mimeType,
    'x-amz-algorithm': 'AWS4-HMAC-SHA256',
    'x-amz-credential': `${accessKey}/${shortDate}/${region}/s3/aws4_request`,
    'x-amz-date': longDate,
    'x-amz-meta-originalFileName': object.name
  };
}

function generateFormData(object, uploaderConfig, policy, signature) {
  const formData = new FormData();

  POLICY_FIELDS_ORDER.forEach(key => {
    formData.append(key, policy[key]);
  });

  formData.append('policy', signature.policy);
  formData.append('x-amz-signature', signature.signature);
  formData.append('file', object.file);

  return formData;
}

function getSignatureAsync(policy, uploaderConfig) {
  const expirationDate = moment().add(5, 'minutes').toISOString();
  const policyConditionsArray = policyToConditionsArray(policy);

  return superagent
    .post(uploaderConfig.handlerConfig.signature.endpoint)
    .send({
      expiration: expirationDate,
      conditions: policyConditionsArray
    });
}

function uploadFileAsync(url, formData) {
  return superagent
    .post(url)
    .send(formData);
}

function uploadFile(object, uploaderConfig) {
  const { handlerConfig: { region, bucket} } = uploaderConfig;
  const policy = generatePolicy(object, uploaderConfig);
  const em = new EventEmitter();
  let req = getSignatureAsync(policy, uploaderConfig);

  return {
    on: em.addListener.bind(em),
    off: em.removeListener.bind(em),
    abort: function abort() {
      req.abort();
    },
    promise: requestToPromise(req).then(signatureResponse => {
      const formData = generateFormData(object, uploaderConfig, policy, signatureResponse.body);
      req = uploadFileAsync(
        `https://${bucket}.s3-${region}.amazonaws.com/`,
        formData
      );

      req.on('progress', event => em.emit('progress', event));

      return requestToPromise(req);
    })
  };
}

export default {
  uploadFile,
};
