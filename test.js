var should = require('should');
var fs = require('fs');
var path = require('path');

const { URL } = require('url');

var Mp4BufferProxy = require('./src/mp4-buffer-proxy');

var TEST_SEGMENTS = [
  'test-data/hybrid-segments/init.video.mp4',
  'test-data/hybrid-segments/media-0.mp4'
];

function toArrayBuffer(buf) {
    var ab = new ArrayBuffer(buf.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
    }
    return ab;
}

function readArrayBufferFromFile(relativePath, arrayBufferCallback) {
  var absPath = path.join(__dirname, relativePath);
  console.log('reading file:', absPath);
  fs.readFile(absPath, (err, data) => {
    if (err) throw err;
    arrayBufferCallback(toArrayBuffer(data));
  });
}

function writeArrayBufferToFile(relativePath, arrayBuffer, successCallback) {
  var absPath = path.join(__dirname, relativePath);
  console.log('writing file:', absPath);
  fs.writeFile(absPath, Buffer.from(arrayBuffer), {
      flag: 'w' 
    }, (err) => {
      if (err) throw err;
      successCallback();
  });
}

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

describe('Mp4BufferProxy', function() {
  it('should process a segment', function(done) {
    var path = TEST_SEGMENTS[0];
    readArrayBufferFromFile(path, (arrayBuffer) => {
        Mp4BufferProxy.digest(arrayBuffer, function(arrayBufferOutput) {

          // TODO: do some validation of output here

          writeArrayBufferToFile(path + '.out', arrayBufferOutput, () => {
            done();
          });
        });
    });
  });

  it('should process an init segment (moov)', function(done) {
    var path = TEST_SEGMENTS[0];
    readArrayBufferFromFile(path, (arrayBuffer) => {
        Mp4BufferProxy.digest(arrayBuffer, function(arrayBufferOutput) {

          // TODO: do some validation of output here

          writeArrayBufferToFile(path + '.out', arrayBufferOutput, () => {
            done();
          });
        });
    });
  });

  it('should process an media fragment segment (moof)', function(done) {
    var path = TEST_SEGMENTS[1];
    readArrayBufferFromFile(path, (arrayBuffer) => {
        Mp4BufferProxy.digest(arrayBuffer, function(arrayBufferOutput) {

          // TODO: do some validation of output here

          writeArrayBufferToFile(path + '.out', arrayBufferOutput, () => {
            done();
          });
        });
    });
  });
});
