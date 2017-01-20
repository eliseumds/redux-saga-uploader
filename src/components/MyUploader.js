import React, { PureComponent } from 'react';
import { ButtonGroup, Button } from 'react-bootstrap';
import Dropzone from 'react-dropzone';
import { reduxUploader } from './redux-uploader';
import getDefaultUploaderConfig from './getDefaultUploaderConfig';
import Icon from 'react-fontawesome';
import classNames from 'classnames/bind';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import styles from './MyUploader.scss';

const cx = classNames.bind(styles);

@reduxUploader({
  ...getDefaultUploaderConfig(),
  id: 'myUploader1',
  mode: 'multiple',
  validation: {
    itemsLimit: 5,
    maxFileSize: 1024 * 1024
  },
  autoUpload: false,
  autoRetry: false,
})
export default class MyUploader extends PureComponent {
  handleOpenDropzone = (event) => {
    event.preventDefault();

    if (this.props.objects.length > 0) {
      this.dropzone.open();
    }
  };

  handleSortEnd = ({ oldIndex, newIndex }) => {
    const { moveObjectByIndex } = this.props;

    if (oldIndex !== newIndex) {
      moveObjectByIndex(oldIndex, newIndex);
    }
  };

  render() {
    const {
      validation,
      error,
      objects,

      selectFiles,
      uploadAll,
      removeAll,
      cancelAll,
      retryAll
    } = this.props;
    const hasObjects = objects.length > 0;
    const hasFilesToUpload = objects.some(object => {
      return !object.isUploaded && !object.isUploading;
    });
    const hasObjectsBeingUploaded = objects.some(object => {
      return object.isUploading;
    });
    const hasObjectsToRetry = objects.some(object => {
      return object.error && !object.isRetrying && object.retriesLeft > 0;
    });

    return (
      <div className={cx({ hasObjects })}>
        <h1>Multiple files uploader</h1>
        <Dropzone
          ref={dropzone => this.dropzone = dropzone}
          onDrop={(acceptedFiles, rejectedFiles) => {
            const files = acceptedFiles.concat(rejectedFiles);

            selectFiles(files);
          }}
          className={styles.dropzone}
          activeClassName={styles.activeDropzone}
          rejectClassName={styles.rejectDropzone}
          accept={validation.acceptFiles}
          maxSize={validation.maxFileSize}
          disableClick={hasObjects}
        >
          <div className={styles.dropzoneLabel}>
            <Button bsStyle="primary" onClick={this.handleOpenDropzone}>
              <Icon name="cloud-upload" /> Choose files to upload
            </Button>
            <div>or drop your files here</div>
          </div>
          {error && <div className="my-1 alert alert-danger">{error}</div>}
          {hasObjects && (
            <ButtonGroup className="my-1">
              {hasFilesToUpload && (
                <Button bsStyle="primary" onClick={() => uploadAll()}>
                  <Icon name="upload" /> Upload all
                </Button>
              )}
              {hasObjectsToRetry && (
                <Button bsStyle="primary" onClick={() => retryAll()}>
                <Icon name="upload" /> Upload all
              </Button>
              )}
              {hasObjectsBeingUploaded && (
                <Button bsStyle="warning" onClick={() => cancelAll()}>
                  <Icon name="ban" /> Cancel all
                </Button>
              )}
              <Button bsStyle="secondary" onClick={() => removeAll()}>
                <Icon name="trash" /> Remove all
              </Button>
            </ButtonGroup>
          )}
          {objects && (
            <MyThumbnails
              items={objects}
              uploader={this.props}
              onSortEnd={this.handleSortEnd}
              useDragHandle
              axis="xy"
              lockToContainerEdges
            />
          )}
        </Dropzone>
      </div>
    );
  }
}

const DragHandle = SortableHandle(() => <Button bsStyle="secondary"><Icon name="bars" /></Button>); // eslint-disable-line

@SortableElement
class MyThumbnail extends PureComponent {
  render() {
    const { object, uploader } = this.props;
    const { autoUpload, autoRetry, retryUpload, removeObject, cancelUpload, uploadObject } = uploader;
    const { name, previewUrl, error, isRetrying, retriesLeft, cdnUrl, mimeType, progress, isUploaded, isUploading } = object;
    const isImage = mimeType ?
      mimeType.startsWith('image') :
      (name || cdnUrl).match(/\.(jpe?g|gif|png|gif|svg)$/);

    const retryButton = Boolean(!autoRetry && error && retriesLeft > 0) && (
      <Button bsStyle="primary" disabled={isRetrying} onClick={() => retryUpload(object.id)}>
        <Icon name="repeat" />
      </Button>
    );
    const removeButton = !autoUpload && (
      <Button bsStyle="secondary" onClick={() => removeObject(object.id)}>
        <Icon name="trash" />
      </Button>
    );
    const cancelButton = isUploading && (
      <Button bsStyle="warning" onClick={() => cancelUpload(object.id)}>
        <Icon name="ban" />
      </Button>
    );
    const uploadButton = !isUploaded && !error && !autoUpload && !isUploading && (
      <Button bsStyle="primary" disabled={isUploading} onClick={() => uploadObject(object.id)}>
        <Icon name="upload" />
      </Button>
    );

    return (
      <div className="col-md-3">
        <div className={cx({ isUploaded, isUploading, hasError: !!error, thumbnail: true })}>
          {error && <div>ERROR!</div>}
          {isImage ?
            <img className={styles.thumbnailImg} src={previewUrl || cdnUrl} /> :
            <div>Icon {mimeType}</div>
          }
          <div className={styles.imageName}>
            {isUploading ?
              <MyProgress value={progress} /> :
              <div className="text-truncate">{name}</div>
            }
          </div>
          <ButtonGroup>
            {retryButton}
            {uploadButton}
            {cancelButton}
            {removeButton}
            <DragHandle />
          </ButtonGroup>
        </div>
      </div>
    );
  }
}

@SortableContainer
class MyThumbnails extends PureComponent {
  render() {
    const { items, uploader } = this.props;

    return (
      <div className="row">
        {items.map((object, idx) => (
          <MyThumbnail
            key={object.id}
            object={object}
            index={idx}
            uploader={uploader}
          />
        ))}
      </div>
    );
  }
}

function MyProgress({ value }) {
  return (
    <div className={styles.progressWrapper}>
      <div className={styles.progress} style={{ width: `${value}%` }} />
    </div>
  );
}
