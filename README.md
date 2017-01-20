# Getting started with `redux-saga-uploader`

This library was created to facilitate the development of file uploaders. It basically consists of four building blocks:

1. A Redux reducer with actions to update your uploader state (server-side support as well!)
2. A Redux saga that will take care of side-effects (firing the upload request, retries, cancellation, auto-starts and more). It basically abstract the hardest parts of it with a beautiful generators-based code
3. An uploader handler that will send the files to a server (many options available)
4. The UI component with buttons (add file, remove, cancel, upload, etc), dropzone, file previews and whatever else your application requires. This is where *redux-saga-uploader* shines

## Step 1: install the Redux reducer

```js
import { reducer as uploaderReducer } from 'redux-saga-uploader';

combineReducers({
  // ...your other reducers here
  uploader: uploaderReducer // attention: the key name must be "uploader"
});
```

## Step 2: install the Redux saga

If `redux-saga` is new to you, first [let us try to convice you about its benefits](somelink.com). It's a very powerful tool that every React developer should use.

First of all, you have to choose which upload handler your application
needs. We provide a few built-in options:

* MultipartFormHandler: the most basic option. Pick this one if your server can
handle this kind of request (example: [multer for NodeJS](https://github.com/expressjs/multer))
* S3Handler: upload files directly to an Amazon S3 bucket (needs extra server configuration to [sign the request](somelink.com))
* DropboxHandler: upload files to [Dropbox](www.dropbox.com)
* CloudinaryHandler: upload files to [Cloudinary](www.cloudinary.com)
* ImgixHandler: upload files to [imgix](www.imgix.com)
* FileIoHandler: upload files to the simple and helpful file sharing service www.file.io
* No option for your use case? Check out the [handler documentation](somelink.com) to know how to build your own

Cloudinary and imgix offer image storage, compression, fast delivery via CDN and transformations (resizing, cropping, filters and more), so they are great options if you want to save time.

Support for advanced features like chunked and resumable uploads will depend on which handler you choose. Check a detailed table [here](somelink.com).

Now you have to install the saga:

```js
import { sagas as uploadSagas } from 'redux-saga-uploader';
// Because we want the library defaults to be smaller as possible, the handlers
// reside in a separate directory
import MultipartFormHandler from 'redux-saga-uploader/handlers/MultipartFormHandler';

export default function* rootSaga() {
  // ...your other sagas
  yield fork(uploaderSagas, MultipartFormHandler);
}
```

## Step 3: create the uploader component

Decorate your component with `reduxSagaUploader()`:

```js
import React, { Component } from 'react';
import { reduxSagaUploader } from 'redux-saga-uploader';

@reduxSagaUploader({
  // see section 4 for the full list configuration options
  id: 'myUploader1'
})
class MyUploader extends Component {
  render() {
    // see section 5 below to know how to build the UI
  }
}
```

## Step 4: configure your uploader

These are the properties you can pass to the `reduxSagaUploader(...)`:

| Key                          | Type              | Default value | Description                                                                                                                               |   |
|------------------------------|-------------------|---------------|-------------------------------------------------------------------------------------------------------------------------------------------|---|
| id (required)                | String            |               | An unique uploader instance identifier. You can also pass it when you render the decorator component: `<MyUploader id={someDynamicId} />` |   |
| mode                         | String            | `"single"`    | Choose between ["single", "multiple"]                                                                                                     |   |
| autoUpload                   | Boolean           | `false`       |                                                                                                                                           |   |
| autoRetry                    | Object or `false` |               |                                                                                                                                           |   |
| autoRetry.interval           | Number            | 3000          | Interval, in milliseconds, between each retry (first one is immediate)                                                                    |   |
| autoRetry.maxAttemps         | Number            | 3             |                                                                                                                                           |   |
| validation                   | Object            |               | File validation rules                                                                                                                     |   |
| validation.acceptsFile       | String            |               | See W3Schools on the (accept attribute](http://www.w3schools.com/tags/att_input_accept.asp). By default it accepts any kind of file.      |   |
| validation.itemsLimit        | Number            | `Infinity`    | The maximum number of files your uploader will handle                                                                                     |   |
| validation.maxFileSize       | Number            | `Infinity`    | The maximum file size in bytes                                                                                                            |   |
| validation.acceptsDuplicates | Boolean           | `false`       | If set, the uploader will invalidate duplicated files (`name` and `size` are used in the comparison)                                      |   |
| handlerConfig                | Object            |               | The configuration passed to the handler you chose ([full list of handlers](somelink.com))                                                 |   |

When rendering your uploader, every prop you pass to it will override your decorator configuration. There's also an additional prop `onUpload` so that you can use your uploader inside a form or send the IDs to your server, for example:

```js
<MySingleFileUploader onUpload={object => myFileInput.change(object.id)} />

// `onUpload` is called for each file in a multi uploader
<MyMultiFileUploader onUpload={object => myFiles.push(object.id)} />
```

# Step 5: build the UI

The final and most exciting step!

`redux-saga-uploader` tries to be as simple as possible but flexible at the same time.
That's why our API is powerful, concise and does not get in your way. By the way, if you don't want to lose time, our [built-in UI components](somelink.com) are here for you. But if you need a customized component, here's a list of props your decorated component gets:

| Property            | Type          | Default value | Description                                                                                                                                                                 |
|---------------------|---------------|---------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| id                  | String        |               | Uploader instance ID                                                                                                                                                        |
| objects             | Array<Object> | []            | See object properties on the table below                                                                                                                                    |
| error               | Object        |               | Usually validation-related errors                                                                                                                                           |
| error.reason        | String        |               | The following error reason constants can be imported from `redux-saga-uploader`: `TOO_MANY_FILES`, `FILE_SIZE_EXCEEDED`, `INVALID_FILE_TYPE`, `DUPLICATED_FILE`             |
| selectFiles         | Function      |               | `(files: Array<File>)`                                                                                                                                                      |
| uploadAll           | Function      |               |                                                                                                                                                                             |
| removeAll           | Function      |               |                                                                                                                                                                             |
| cancelAll           | Function      |               |                                                                                                                                                                             |
| retryAll            | Function      |               |                                                                                                                                                                             |
| uploadObject        | Function      |               | `(objectId: String)`                                                                                                                                                        |
| removeObject        | Function      |               | `(objectId: String)`                                                                                                                                                        |
| cancelUpload        | Function      |               | `(objectId: String)`                                                                                                                                                        |
| retryUpload         | Function      |               | `(objectId: String)`                                                                                                                                                        |
| setObjectAttributes | Function      |               | `(objectId: String, attributes: Object)`. This is a very powerful action to be used with caution                                                                            |
| swapObjectsByIndex  | Function      |               | `(objectId: String, firstIndex: Number, secondIndex: Number)`. A helper function for objects reordering                                                                     |
| moveObjectByIndex   | Function      |               | `(objectId: String, oldIndex: Number, secondIndex: Number)`. A helper function that will move the object to the desired index and push all the following items to the front |

### Object properties

| Property    | Type    | Default value | Description                                                          |
|-------------|---------|---------------|----------------------------------------------------------------------|
| id          | String  |               | An unique object identifier (UUID by default)                        |
| file        | File    |               |                                                                      |
| name        | String  |               | The original file name                                               |
| mimeType    | String  |               |                                                                      |
| fileSize    | Number  |               | File size in bytes                                                   |
| isUploaded  | Boolean |               |                                                                      |
| isUploading | Boolean |               |                                                                      |
| isRetrying  | Boolean |               |                                                                      |
| retriesLeft | Number  |               |                                                                      |
| error       | any     |               | Upload error description. Return type depends on the handler you use |
| progress    | Number  |               | A percentage indicator (from 0 to 100)                               |

## Still have issues?

Before creating an issue, please check the following resources:

1. Our [troubleshooting guide](somelink.com)
2. [StackOverflow questions](somelink.com)
3. [GitHub issues](somelink.com)

If you didn't find a solution, then please read our [Contribution Guide](somelink.com) to know how to report a bug or propose an improvement.

## Enjoy, contribute and spread the word :)

Talk to your colleagues about it, share the library with your friends, test it in your new mobile device and/or browser, file bug reports, suggest new features, develop handlers, build pre-defined UI components, and also come and drink a cup of coffee with us at ProductReview.com.au in Sydney.
