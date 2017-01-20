function getMimeTypeFromHeader(header) {
  // TODO: add more mime types
  switch (header) {
    case '89504e47':
      return 'image/png';
    case '47494638':
      return 'image/gif';
    case 'ffd8ffe0':
    case 'ffd8ffe1':
    case 'ffd8ffe2':
      return 'image/jpeg';
    default:
      return undefined;
  }
}

export default function getMimeTypeAsync(blob) {
  const fileReader = new FileReader();

  return new Promise(resolve => {
    fileReader.onloadend = function onLoadEnd(event) {
      const arr = (new Uint8Array(event.target.result)).subarray(0, 4);
      let header = '';

      for (let idx = 0; idx < arr.length; idx++) {
        header += arr[idx].toString(16);
      }

      resolve(getMimeTypeFromHeader(header) || blob.type);
    };

    fileReader.readAsArrayBuffer(blob);
  });
}
