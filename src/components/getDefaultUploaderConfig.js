export default function getDefaultUploaderConfig() {
  return {
    validation: {
      acceptFiles: 'image/*',
      maxFileSize: 500 * 1024, // 500KB
      itemsLimit: 3,
      acceptDuplicates: false
    },
    imageScaling: {
      maxHeight: 2048,
      maxWidth: 2048,
    },
    getHeaders() {
      return {};
    },
    // handler: 's3',
    handlerConfig: {
      getFileName(object, props) {
        return `tmp/${props.collection}/${object.id}`;
      },
      bucket: process.env.UPLOADS_BUCKET,
      region: process.env.AWS_REGION,
      signature: {
        endpoint: '/s3?v4=true'
      },
      accessKey: process.env.AWS_ACCESS_KEY_ID,
    }
  };
}
