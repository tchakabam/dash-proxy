const ISOBoxer = require('codem-isoboxer');
const log = require('./log');
const toArrayBuffer = require('./to-array-buffer');

const FREE_TYPE = ['s', 'k', 'i', 'p'];

var patchUuidBoxToSkip = function(uuidBox, uuidBoxOffsetAbsolute, arrayBufferOut) {
    var freeType = FREE_TYPE;
    var uuidBoxView = new DataView(
      arrayBufferOut,
      uuidBoxOffsetAbsolute, 
      uuidBox.size
    );

    var uuidBoxSize = uuidBoxView.getUint32(0);

    log('Size:', uuidBoxSize);

    log('Patching initial data ...');

    for (var i = 0; i < freeType.length; i++) {
      var type = uuidBoxView.getUint8(freeType.length + i);
      log(type, String.fromCharCode(type), '->', freeType[i]);
      uuidBoxView.setUint8(freeType.length + i, freeType[i].charCodeAt())
    }
}

var digestSampleDescriptionEntry = function(sampleDescriptionEntry, arrayBufferOut) {
    var sampleConfigDataView;
    var sampleConfigOffset;
    var sampleConfigSize;
    var sampleConfigBuffer;
    var parsedSampleConfig;
    var uuidBox;
    var uuidBoxView;
    var uuidBoxOffsetAbsolute;
    var uuidBoxSize;

    sampleConfigDataView = sampleDescriptionEntry.config;
    if (!sampleConfigDataView) {
      console.warn('No config data in sample description entry found!');
      return;
    }

    sampleConfigOffset = sampleConfigDataView.byteOffset;
    sampleConfigSize = sampleConfigDataView.byteLength;

    log('Found sample config at buffer bytes offset:', sampleConfigOffset);

    sampleConfigBuffer = sampleConfigDataView.buffer.slice(
        sampleConfigOffset,
        sampleConfigOffset 
        + sampleConfigSize
    );

    parsedSampleConfig = ISOBoxer.parseBuffer(sampleConfigBuffer);

    uuidBox = parsedSampleConfig.fetch('uuid');
    if (!uuidBox) {
      log('No `uuid` box in sample config found. All good.');
      return;
    }

    log('Found `uuid` box at config bytes offset:', uuidBox.offset());

    uuidBoxOffsetAbsolute = sampleConfigOffset + uuidBox.offset();

    log('UUID box position in stream:', uuidBoxOffsetAbsolute);

    patchUuidBoxToSkip(uuidBox, uuidBoxOffsetAbsolute, arrayBufferOut);
};

var digestTrackFragment = function(parsedBuffer, arrayBufferOut) {
    var uuidBox = parsedBuffer.fetch('uuid');
    log('found uuid');

    patchUuidBoxToSkip(uuidBox, uuidBox.offset(), arrayBufferOut);
}

var Mp4BufferProxy = {
  digest: function(arrayBuffer, doneCallback) {

      var stsdOffset;
      var parsedBuffer;
      var sampleDescriptionContainer;
      var trackFragment;
      var arrayBufferOut = arrayBuffer.slice();

      log('Parsing MP4 bytes:', arrayBuffer.byteLength);

      parsedBuffer = ISOBoxer.parseBuffer(arrayBuffer);

      sampleDescriptionContainer = parsedBuffer.fetch('stsd');
      trackFragment = parsedBuffer.fetch('traf');

      if (sampleDescriptionContainer) {
        stsdOffset = sampleDescriptionContainer.offset();

        log('`stsd` offset:', sampleDescriptionContainer.offset());

        if (!sampleDescriptionContainer.entries 
          || sampleDescriptionContainer.entries.length === 0) {
          console.warn('No sample description entries found!');
          return;
        }

        sampleDescriptionContainer.entries.forEach((sampleDescriptionEntry) => {
            digestSampleDescriptionEntry(sampleDescriptionEntry, arrayBufferOut);
        });

      } else if (trackFragment) {
        log('traf box found');
        digestTrackFragment(parsedBuffer, arrayBufferOut);
      } else {
        console.warn('No `stsd` or `traf` box found');
      }

      doneCallback(arrayBufferOut);
  }
};

module.exports = Mp4BufferProxy;