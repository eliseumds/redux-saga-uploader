/* eslint no-constant-condition: 0 */
import { delay, eventChannel, CANCEL, END } from 'redux-saga';
import { call, cancel, fork, take, put, select } from 'redux-saga/effects';
import {
  ADD_OBJECTS,
  UPLOAD_OBJECT,
  REMOVE_OBJECT,
  FINISH_UPLOAD,
  CANCEL_UPLOAD,
  RETRY_UPLOAD,
  UPDATE_UPLOAD_ERROR,
  UPLOAD_ALL,
  REMOVE_ALL,
  CANCEL_ALL,
  RETRY_ALL,

  startUpload,
  finishUpload,
  retryUpload,
  startRetry,
  updateUploadProgress,
  updateUploadError,
  removeObject,
  cancelUpload
} from './actions';

function getUploader(state, uploaderId) {
  return state.reduxUploader[uploaderId];
}

function progress(uploadHandle) {
  return eventChannel(emitter => {
    function callback(event) {
      if (event.percent) {
        emitter(event.percent);
      }

      if (event.percent === 100) {
        emitter(END);
      }
    }

    uploadHandle.on('progress', callback);

    return () => {
      uploadHandle.off('progress', callback);
    };
  });
}

function* watchProgress(uploaderId, objectId, channel) {
  while (true) {
    const percent = yield take(channel);

    yield put(updateUploadProgress(uploaderId, objectId, percent));
  }
}

function* uploadObject(uploadHandler, uploaderId, object) {
  const uploaderConfig = yield select(getUploader, uploaderId);
  const uploadHandle = uploadHandler.uploadFile(object, uploaderConfig);

  uploadHandle.promise[CANCEL] = () => uploadHandle.abort();

  const progressChannel = yield call(progress, uploadHandle);

  yield fork(watchProgress, uploaderId, object.id, progressChannel);
  yield put(startUpload(uploaderId, object.id));

  try {
    const response = yield uploadHandle.promise;

    yield put(finishUpload(uploaderId, object.id, response.body || {}));
  } catch (err) {
    yield put(updateUploadError(uploaderId, object.id, err));
  }
}

function* makeRequest(uploadHandler, uploaderId, object) {
  const uploadTask = yield fork(uploadObject, uploadHandler, uploaderId, object);

  while (true) {
    const { payload } = yield take([
      REMOVE_OBJECT,
      CANCEL_UPLOAD,
      FINISH_UPLOAD,
      UPDATE_UPLOAD_ERROR
    ]);
    const isSameId = payload.objectId === object.id;

    if (isSameId && uploadTask.isRunning()) {
      yield cancel(uploadTask);
      break;
    }
  }
}

function* makeRetry(uploaderId, objectId) {
  const uploader = yield select(getUploader, uploaderId);
  const object = uploader.objects.find(obj => obj.id === objectId);

  if (uploader.autoRetry && object.retriesLeft > 0) {
    // fire the first retry immediately
    const isFirstRetry = uploader.autoRetry.maxAttemps === object.retriesLeft;

    yield put(startRetry(uploaderId, objectId));

    if (!isFirstRetry && uploader.autoRetry.interval) {
      yield delay(uploader.autoRetry.interval);
    }

    yield put(retryUpload(uploaderId, objectId));
  }
}

function* watchAddObjects(uploadHandler) {
  while (true) {
    const { meta, payload } = yield take(ADD_OBJECTS);
    const uploader = yield select(getUploader, meta.id);

    if (uploader.autoUpload) {
      yield payload.objects.map(object => fork(makeRequest, uploadHandler, meta.id, object)); // eslint-disable-line
    }
  }
}


function* watchUpdateUploadError() {
  while (true) {
    const { meta, payload } = yield take(UPDATE_UPLOAD_ERROR);

    yield fork(makeRetry, meta.id, payload.objectId);
  }
}

function* watchUploadObject(uploadHandler) {
  while (true) {
    const { meta, payload } = yield take([UPLOAD_OBJECT, RETRY_UPLOAD]);
    const uploader = yield select(getUploader, meta.id);
    const object = uploader.objects.find(obj => obj.id === payload.objectId);

    yield fork(makeRequest, uploadHandler, meta.id, object);
  }
}

function* watchUploadAll(uploadHandler) {
  while (true) {
    const { meta } = yield take(UPLOAD_ALL);
    const uploader = yield select(getUploader, meta.id);

    yield uploader.objects
      .filter(object => !object.isUploading && !object.isUploaded)
      .map(object => fork(makeRequest, uploadHandler, meta.id, object)); // eslint-disable-line
  }
}

function* watchRemoveAll() {
  while (true) {
    const { meta } = yield take(REMOVE_ALL);
    const uploader = yield select(getUploader, meta.id);

    yield uploader.objects.map(object => put(removeObject(meta.id, object.id))); // eslint-disable-line
  }
}

function* watchCancelAll() {
  while (true) {
    const { meta } = yield take(CANCEL_ALL);
    const uploader = yield select(getUploader, meta.id);

    yield uploader.objects.map(object => put(cancelUpload(meta.id, object.id))); // eslint-disable-line
  }
}

function* watchRetryAll() {
  while (true) {
    const { meta } = yield take(RETRY_ALL);
    const uploader = yield select(getUploader, meta.id);

    yield uploader.objects
      .filter(object => !object.isUploading && !object.isUploaded)
      .map(object => put(retryUpload(meta.id, object.id))); // eslint-disable-line
  }
}

export default function* rootSagas(uploadHandler) {
  yield fork(watchAddObjects, uploadHandler);
  yield fork(watchUploadObject, uploadHandler);
  yield fork(watchUpdateUploadError, uploadHandler);
  yield fork(watchUploadAll, uploadHandler);
  yield fork(watchRemoveAll, uploadHandler);
  yield fork(watchCancelAll, uploadHandler);
  yield fork(watchRetryAll, uploadHandler);
}
