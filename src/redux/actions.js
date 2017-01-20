export const INITIALIZE = 'shared/uploader/INITIALIZE';
export const DESTROY = 'shared/uploader/DESTROY';
export const UPLOAD_ALL = 'shared/uploader/UPLOAD_ALL';
export const REMOVE_ALL = 'shared/uploader/REMOVE_ALL';
export const CANCEL_ALL = 'shared/uploader/CANCEL_ALL';
export const RETRY_ALL = 'shared/uploader/RETRY_ALL';
export const UPLOAD_OBJECT = 'shared/uploader/UPLOAD_OBJECT';
export const START_UPLOAD = 'shared/uploader/START_UPLOAD';
export const START_RETRY = 'shared/uploader/START_RETRY';
export const FINISH_UPLOAD = 'shared/uploader/FINISH_UPLOAD';
export const REMOVE_OBJECT = 'shared/uploader/REMOVE_OBJECT';
export const CANCEL_UPLOAD = 'shared/uploader/CANCEL_UPLOAD';
export const RETRY_UPLOAD = 'shared/uploader/RETRY_UPLOAD';
export const CROP = 'shared/uploader/CROP';
export const SCALE = 'shared/uploader/SCALE';
export const ADD_OBJECTS = 'shared/uploader/ADD_OBJECTS';
export const UPDATE_VALIDATION_ERROR = 'shared/uploader/UPDATE_VALIDATION_ERROR';
export const UPDATE_UPLOAD_PROGRESS = 'shared/uploader/UPDATE_UPLOAD_PROGRESS';
export const UPDATE_UPLOAD_ERROR = 'shared/uploader/UPDATE_UPLOAD_ERROR';
export const SET_OBJECT_ATTRIBUTES = 'shared/uploader/SET_OBJECT_ATTRIBUTES';
export const SWAP_OBJECTS_BY_INDEX = 'shared/uploader/SWAP_OBJECTS_BY_INDEX';
export const MOVE_OBJECT_BY_INDEX = 'shared/uploader/MOVE_OBJECT_BY_INDEX';

export function initialize(id, props) {
  return { type: INITIALIZE, meta: { id }, payload: props };
}

export function destroy(id) {
  return { type: DESTROY, meta: { id } };
}

export function addObjects(id, objects) {
  return { type: ADD_OBJECTS, meta: { id }, payload: { objects } };
}

export function uploadAll(id) {
  return { type: UPLOAD_ALL, meta: { id } };
}

export function removeAll(id) {
  return { type: REMOVE_ALL, meta: { id } };
}

export function cancelAll(id) {
  return { type: CANCEL_ALL, meta: { id } };
}

export function retryAll(id) {
  return { type: RETRY_ALL, meta: { id } };
}

export function uploadObject(id, objectId) {
  return { type: UPLOAD_OBJECT, meta: { id }, payload: { objectId } };
}

export function removeObject(id, objectId) {
  return { type: REMOVE_OBJECT, meta: { id }, payload: { objectId } };
}

export function cancelUpload(id, objectId) {
  return { type: CANCEL_UPLOAD, meta: { id }, payload: { objectId } };
}

export function startRetry(id, objectId) {
  return { type: START_RETRY, meta: { id }, payload: { objectId } };
}

export function retryUpload(id, objectId) {
  return { type: RETRY_UPLOAD, meta: { id }, payload: { objectId } };
}

export function startUpload(id, objectId) {
  return { type: START_UPLOAD, meta: { id }, payload: { objectId } };
}

export function finishUpload(id, objectId, response) {
  return { type: FINISH_UPLOAD, meta: { id }, payload: { objectId, response } };
}

export function updateUploadProgress(id, objectId, progress) {
  return { type: UPDATE_UPLOAD_PROGRESS, meta: { id }, payload: { objectId, progress } };
}

export function updateUploadError(id, objectId, error) {
  return { type: UPDATE_UPLOAD_ERROR, meta: { id }, payload: { objectId, error } };
}

export function setObjectAttributes(id, objectId, attributes) {
  return { type: SET_OBJECT_ATTRIBUTES, meta: { id }, payload: { objectId, attributes } };
}

export function updateValidationError(id, error) {
  return { type: UPDATE_VALIDATION_ERROR, meta: { id }, payload: { error } };
}

export function swapObjectsByIndex(id, firstIndex, secondIndex) {
  return { type: SWAP_OBJECTS_BY_INDEX, meta: { id }, payload: { firstIndex, secondIndex } };
}

export function moveObjectByIndex(id, oldIndex, newIndex) {
  return { type: MOVE_OBJECT_BY_INDEX, meta: { id }, payload: { oldIndex, newIndex } };
}
