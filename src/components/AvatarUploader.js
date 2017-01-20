import React, { PureComponent } from 'react';
import { Button, Modal } from 'react-bootstrap';
import ImageCropper from 'shared/components/upload/ImageCropper';
import { reduxUploader } from './redux-uploader';
import getImagePreviewUrl from './redux-uploader/utils/getImagePreviewUrl';
import getDefaultUploaderConfig from './getDefaultUploaderConfig';

@reduxUploader({
  ...getDefaultUploaderConfig(),
  id: 'avatarUploader1',
  mode: 'single',
  autoUpload: true,
  cropConfig: {
    ratio: 800 / 400,
    background: '#fff',
    enableRotation: false,
    viewport: {
      padding: 20,
      width: 400,
      height: 400,
      radius: '50%'
    },
  },
})
export default class AvatarUploader extends PureComponent {
  getObject() {
    return this.props.objects[0];
  }

  renderImage() {
    const { autoUpload, cropConfig, setObjectAttributes, removeObject, uploadObject } = this.props;
    const object = this.getObject();

    if (!object) {
      return <img src="http://www.thebakerymadewithlove.com/wp-content/uploads/2014/08/placeholder.png" height={48} />;
    }

    const { id, cdnUrl, previewUrl, isCropped, file } = object;

    return (
      <span>
        {Boolean(!isCropped && cropConfig) && (
          <Modal show onHide={() => {}}>
            <Modal.Header>
              <Modal.Title>
                Crop your image
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <ImageCropper
                src={previewUrl}
                resultType="blob"
                onCancel={() => removeObject(id)}
                onCrop={(newBlob) => {
                  // TODO: re-generate the dataurl whenever "file" changes in reduxUploader.js
                  getImagePreviewUrl(newBlob).then(dataUrl => {
                    const now = new Date();

                    newBlob.lastModified = +now;
                    newBlob.lastModifiedDate = now;
                    newBlob.name = file.name;

                    setObjectAttributes(id, {
                      isCropped: true,
                      previewUrl: dataUrl,
                      file: newBlob
                    });

                    if (autoUpload) {
                      uploadObject(id);
                    }
                  });
                }}
              />
            </Modal.Body>
          </Modal>
        )}
        <img src={previewUrl || cdnUrl} height={48} />
      </span>
    );
  }

  renderButtons() {
    const object = this.getObject();

    if (!object || object.isUploaded) {
      return null;
    }

    const { autoUpload, autoRetry, removeObject, uploadObject, cancelUpload, retryUpload } = this.props;
    const { isUploading, isRetrying, error, retriesLeft } = object;

    const removeButton = !autoUpload && (
      <Button bsStyle="danger" onClick={() => removeObject(object.id)}>
        Remove
      </Button>
    );
    const retryButton = Boolean(!autoRetry && error && retriesLeft > 0) && (
      <Button bsStyle="primary" disabled={isRetrying} onClick={() => retryUpload(object.id)}>
        Retry
      </Button>
    );
    const cancelButton = isUploading && (
      <Button bsStyle="warning" onClick={() => cancelUpload(object.id)}>
        Cancel
      </Button>
    );
    const uploadButton = !autoUpload && !isUploading && (
      <Button bsStyle="primary" disabled={isUploading} onClick={() => uploadObject(object.id)}>
        Upload
      </Button>
    );

    return (
      <span>
        {error && <div className="alert alert-danger">{JSON.stringify(error.stack)}</div>}
        {retryButton}
        {uploadButton}
        {cancelButton}
        {removeButton}
      </span>
    );
  }

  render() {
    const { validation, selectFiles } = this.props;

    return (
      <div>
        <h1>Avatar uploader</h1>
        <div className="media mb-4">
          <div className="media-left">
            {this.renderImage()}
          </div>
          <div className="media-body">
            <input
              type="file"
              accept={validation.acceptFiles}
              onChange={event => {
                selectFiles(event.currentTarget.files);
                event.currentTarget.value = '';
              }}
            />
            {this.renderButtons()}
          </div>
        </div>
      </div>
    );
  }
}
