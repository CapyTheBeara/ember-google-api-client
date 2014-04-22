import { handleGapiResponse } from 'egc/lib/egc/utils';

var boundary = 'foo_bar_baz',
    delimiter = "\r\n--" + boundary + "\r\n",
    closeDelimeter = "\r\n--" + boundary + "--";

function createRequestBody(file) {
  var specFile = Em.copy(file);
  delete specFile.content;

  return delimiter +
         'Content-Type: application/json\r\n\r\n' +
         JSON.stringify(specFile) +
         delimiter +
         'Content-Type: ' + file.mimeType + '\r\n\r\n' +
         file.content +
         closeDelimeter;
}

function uploadFile(file, opts) {
  var version = 'v2', uploadPath, params;

  if (!file) { throw new Error('A file resource is required.'); }
  if (opts && opts.version) { version = opts.version; }
  uploadPath = '/upload/drive/' + version + '/files';

  params = {
    path: uploadPath,
    method: 'POST',
    params: { uploadType: 'multipart' },
    headers: {
      'Content-Type': 'multipart/related; boundary="' + boundary + '"'
    }
  };

  if (opts) {
    if (opts.uploadType) { params.params.uploadType = opts.uploadType; }
    if (opts.contentType) { params.headers['Content-Type'] = opts.contentType; }
    if (opts.contentLength) { params.headers['Content-Length'] = opts.contentLength; }
    if (opts.uploadType === 'media') {
      if (file.mimeType) {
        params.headers['Content-Type'] = file.mimeType;
      }

      if (file.content) {
        params.body = file.content;
        params.headers['Content-Length'] = file.content.length;
      }
    }
  }

  if (file.id) {
    params.path += '/' + file.id;
    params.method = 'PUT';
  }

  if (params.params.uploadType === 'multipart') {
    params.body = createRequestBody(file);
  }

  return new Em.RSVP.Promise(function(resolve, reject) {
    gapi.client.request(params)
               .execute(handleGapiResponse(resolve, reject, (opts && opts.DEBUG)));
  });
};

export default uploadFile;
