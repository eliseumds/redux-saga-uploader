import React, { Component, PropTypes } from 'react';
import uuid from 'uuid';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actions from 'shared/redux/modules/uploader/actions';
import getMimeTypeFromFile from './utils/getMimeTypeFromFile';
import getImagePreviewUrl from './utils/getImagePreviewUrl';
import accept from 'attr-accept';
import formatFileSize from 'filesize';

const UPLOADER_ACTIONS = [
  'initialize',
  'destroy',
  'addObjects',
  'uploadAll',
  'removeAll',
  'cancelAll',
  'retryAll',
  'cancelUpload',
  'retryUpload',
  'uploadObject',
  'removeObject',
  'setObjectAttributes',
  'updateValidationError',
  'swapObjectsByIndex',
  'moveObjectByIndex'
];

const DEFAULT_CONFIG = {
  mode: 'single',
  autoUpload: false,
  autoRetry: {
    interval: 3 * 1000,
    maxAttemps: 3
  },
  validation: {},
  getObjectMeta() {
    return {};
  }
};

export default function reduxUploader(config) {
  return function reduxUploaderDecorator(WrappedComponent) {
    @connect(
      (state, props) => {
        const uploaderState = state.reduxUploader[props.id] || {};

        return {
          objects: uploaderState.objects || props.initialObjects || [],
          globalProgress: uploaderState.globalProgress,
          error: uploaderState.error
        };
      },
      (dispatch, props) => {
        const boundActions = {};

        UPLOADER_ACTIONS.forEach(actionName => {
          boundActions[actionName] = actions[actionName].bind(null, props.id);
        });

        return bindActionCreators(boundActions, dispatch);
      }
    )
    class ConnectedUploader extends Component {
      static propTypes = {
        id: PropTypes.string.isRequired,
        mode: PropTypes.oneOf(['single', 'multiple']).isRequired,
        initialObjects: PropTypes.arrayOf(PropTypes.object)
      };
      static childContextTypes = {
        _reduxUploader: PropTypes.object.isRequired
      };

      getChildContext() {
        return {
          _reduxUploader: {
            ...this.props
          }
        };
      }

      componentWillMount() {
        this.init();
      }

      componentWillUnmount() {
        this.props.destroy();
      }

      init() {
        const { isInitialized, initialize } = this.props;
        // only store simple values in Redux (exclude functions and custom class instances)
        const initializeProps = {};

        Object.keys(this.props).forEach(propKey => {
          const val = this.props[propKey];
          const isComplexObject = !Array.isArray(val) && typeof val === 'object' && toString.call(val) !== '[object Object]';

          if (!isComplexObject && typeof val !== 'function') {
            initializeProps[propKey] = val;
          }
        });

        if (!isInitialized) {
          initialize(initializeProps);
        }
      }

      parseFilesAsync(filesList) {
        const { getObjectMeta, autoRetry } = this.props;

        return Promise.all(filesList.map(file => {
          return getMimeTypeFromFile(file).then(mimeType => {
            const object = {
              file,
              mimeType,
              name: file.name,
              fileSize: file.size,
              id: uuid.v4(),
              extension: file.name.split('.').pop(),
              isUploaded: false,
              isUploading: false,
              retriesLeft: autoRetry ? (autoRetry.maxAttemps || 3) : Infinity,
              error: null,
              progress: 0
            };

            object.meta = getObjectMeta(object, this.props);

            if (mimeType.startsWith('image')) {
              return getImagePreviewUrl(file).then(previewUrl => {
                object.previewUrl = previewUrl;

                return object;
              });
            }

            return object;
          });
        }));
      }

      selectFiles(files) {
        const { addObjects, updateValidationError } = this.props;
        const filesList = [...files];
        const filesListValidationError = this.validateFilesList(filesList);

        if (filesListValidationError) {
          updateValidationError(filesListValidationError);
        } else {
          this.parseFilesAsync(filesList).then(objects => {
            addObjects(objects);
          });
        }
      }

      validateFilesList(files) {
        const { mode, validation, objects } = this.props;
        const currentObjectsLength = objects.length;

        if (mode === 'single' && files.length > 1) {
          return 'Too many files. Max is 1';
        }

        if (
          mode === 'multiple' &&
          validation.itemsLimit &&
          (currentObjectsLength + files.length) > validation.itemsLimit
        ) {
          return `Too many files. Max is ${validation.itemsLimit}`;
        }

        for (let idx = 0; idx < files.length; idx++) {
          const file = files[idx];
          const error = this.validateFile(file);

          if (error) {
            return error;
          }
        }

        return null;
      }

      validateFile(file) {
        const {
          objects,
          validation: { acceptDuplicates, acceptFiles, maxFileSize }
        } = this.props;

        if (acceptFiles && !accept(file, acceptFiles)) {
          return `File ${file.name} is not valid. Accepted: ${acceptFiles}`;
        }

        if (maxFileSize && file.size > maxFileSize) {
          return `File ${file.name} must not be larger than ${formatFileSize(maxFileSize)}`;
        }

        if (!acceptDuplicates) {
          const duplicatedObject = objects.find(obj => {
            if (obj.file) {
              const doNamesMatch = obj.name === file.name;
              let doSizesMatch = true;

              if (typeof obj.file.size === 'number' && typeof file.size === 'number') {
                doSizesMatch = obj.file.size === file.size;
              }

              return doNamesMatch && doSizesMatch;
            }

            return false;
          });

          if (duplicatedObject) {
            return `File ${duplicatedObject.name} is already selected. Duplicates are not allowed.`;
          }
        }

        return null;
      }

      render() {
        const otherProps = {
          selectFiles: this.selectFiles.bind(this)
        };

        return <WrappedComponent {...this.props} {...otherProps} />;
      }
    }

    ConnectedUploader.WrappedComponent = WrappedComponent;

    class DecoratedUploader extends Component {
      render() {
        const props = {
          ...DEFAULT_CONFIG,
          ...config,
          ...this.props
        };

        return <ConnectedUploader {...props} />;
      }
    }

    return DecoratedUploader;
  };
}
