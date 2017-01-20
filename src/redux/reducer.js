import omit from 'lodash/omit';
import {
  INITIALIZE,
  DESTROY,
  ADD_OBJECTS,
  REMOVE_OBJECT,
  CANCEL_UPLOAD,
  START_UPLOAD,
  FINISH_UPLOAD,
  UPDATE_UPLOAD_PROGRESS,
  UPDATE_UPLOAD_ERROR,
  START_RETRY,
  SET_OBJECT_ATTRIBUTES,
  UPDATE_VALIDATION_ERROR,
  SWAP_OBJECTS_BY_INDEX,
  MOVE_OBJECT_BY_INDEX
} from './actions';
import objectReducer from './objectReducer';

// type UploaderObject = {
//   id: String,
//   file?: File,
//   name: String,
//   mimeType?: String,
//   fileSize?: Number,
//   fileType?: 'image' | 'unknown',
//   isUploaded: Boolean,
//   isUploading?: Boolean,
//   isRetrying?: Boolean,
//   retriesLeft: Number,
//   error?: any,
//   progress?: Number
// };

function swapObjectsByIndex(objects, firstIndex, secondIndex) {
  const first = objects[firstIndex];
  const second = objects[secondIndex];

  return objects.map((obj, idx) => {
    if (idx === firstIndex) {
      return second;
    }

    if (idx === secondIndex) {
      return first;
    }

    return obj;
  });
}

function moveObjectByIndex(objects, oldIndex, newIndex) {
  const object = objects[oldIndex];
  const newObjects = objects.filter((obj, idx) => idx !== oldIndex);

  newObjects.splice(newIndex, 0, object);

  return newObjects;
}

const INITIAL_STATE = {};

export default function reducer(state = INITIAL_STATE, action) {
  const { type, meta, payload } = action;

  switch (type) {
    case INITIALIZE:
      return {
        ...state,
        [meta.id]: {
          objects: [],
          ...payload
        }
      };
    case DESTROY:
      return omit(state, meta.id);
    case ADD_OBJECTS:
      return {
        ...state,
        [meta.id]: {
          ...state[meta.id],
          objects: state[meta.id].mode === 'single' ?
            payload.objects :
            state[meta.id].objects.concat(payload.objects),
          error: null
        }
      };
    case REMOVE_OBJECT:
      return {
        ...state,
        [meta.id]: {
          ...state[meta.id],
          objects: state[meta.id].objects.filter(obj => obj.id !== payload.objectId)
        }
      };
    case UPDATE_VALIDATION_ERROR:
      return {
        ...state,
        [meta.id]: {
          ...state[meta.id],
          error: payload.error
        }
      };
    case SWAP_OBJECTS_BY_INDEX:
      return {
        ...state,
        [meta.id]: {
          ...state[meta.id],
          objects: swapObjectsByIndex(state[meta.id].objects, payload.firstIndex, payload.secondInex)
        }
      };
    case MOVE_OBJECT_BY_INDEX:
      return {
        ...state,
        [meta.id]: {
          ...state[meta.id],
          objects: moveObjectByIndex(state[meta.id].objects, payload.oldIndex, payload.newIndex)
        }
      };
    case CANCEL_UPLOAD:
    case START_RETRY:
    case START_UPLOAD:
    case FINISH_UPLOAD:
    case UPDATE_UPLOAD_PROGRESS:
    case UPDATE_UPLOAD_ERROR:
    case SET_OBJECT_ATTRIBUTES:
      return {
        ...state,
        [meta.id]: {
          ...state[meta.id],
          objects: state[meta.id].objects.map(obj => {
            if (obj.id === payload.objectId) {
              return objectReducer(state[meta.id], obj, action);
            }

            return obj;
          })
        }
      };
    default:
      return state;
  }
}
