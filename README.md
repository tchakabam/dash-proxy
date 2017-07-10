# DASH_proxy: A media gateway for MPEG-DASH

Experimental project to digest MPEG-DASH fragmented MP4 init/media-fragment (moof/moov) data through an HTTP proxy.

Applies eventual modifications to the ISO file data structure. This can generally allow to distribute statically stored content to clients/players with various needs and apply on-the-fly metadata adaptations based on a commonly static mezzanine format.

This is totally experimental, non production stuff, which currently only fulfills our specific purpose. Don't expect anything in general here, except if this is exactly what you need.

In a specific case we needed to `skip` the SmoothStreaming/PlayReady specific `uuid` boxes in a stream in order to play it via certain MPEG-DASH players not expecting i.e crashing upon finding this box.

Thanks to the `codem-isoboxer` project, who make a great ISO file parser: https://github.com/madebyhiro/codem-isoboxer

## Setup

First of all, get dependencies:

```
npm install
```

## Start proxy server

Runs a server that will act as a proxy (CAUTION: only HTTP!):

```
npm run server
```

## Test suite

Runs some tests based on `mocha`:

```
npm test
```

## Logs

To disable logs, set `const DEBUG = false` in `./src/log.js`.




