export default function getImagePreviewUrl(blob) {
  if (blob.preview) {
    return Promise.resolve(blob.preview);
  }

  const fileReader = new FileReader();

  return new Promise(resolve => {
    fileReader.onloadend = function onLoadEnd(event) {
      resolve(event.target.result);
    };

    fileReader.readAsDataURL(blob);
  });
}
