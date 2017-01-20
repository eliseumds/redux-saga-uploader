import {
  CANCEL_UPLOAD,
  START_UPLOAD,
  FINISH_UPLOAD,
  UPDATE_UPLOAD_PROGRESS,
  UPDATE_UPLOAD_ERROR,
  START_RETRY,
  SET_OBJECT_ATTRIBUTES
} from './actions';

export default function objectReducer(uploaderState, object, action) {
  const { type, payload } = action;

  switch (type) {
    case CANCEL_UPLOAD:
      if (object.isUploaded) {
        return object;
      }

      return {
        ...object,
        isUploading: false,
        isUploaded: false,
        isRetrying: false,
        progress: 0,
        error: null
      };
    case START_RETRY:
      return {
        ...object,
        isRetrying: true,
        retriesLeft: object.retriesLeft - 1
      };
    case START_UPLOAD:
      return {
        ...object,
        isUploading: true,
        progress: 0
      };
    case FINISH_UPLOAD:
      return {
        ...object,
        isUploaded: true,
        isUploading: false,
        isRetrying: false,
        progress: 100,
        error: null,
        uploadResponse: payload.response
      };
    case UPDATE_UPLOAD_PROGRESS:
      return {
        ...object,
        progress: payload.progress
      };
    case UPDATE_UPLOAD_ERROR:
      return {
        ...object,
        error: payload.error,
        isUploading: false,
        isRetrying: false
      };
    case SET_OBJECT_ATTRIBUTES:
      return {
        ...object,
        ...payload.attributes
      };
    default:
      return object;
  }
}
