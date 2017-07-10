/* Copyright 2017 Stephan Hesse <tchakabam@gmail.com> */

const http = require('http');
const URL = require('url');

const log = require('./log');
const Mp4BufferProxy = require('./mp4-buffer-proxy');
const toArrayBuffer = require('./to-array-buffer');

const DEFAULT_PORT = 4000;

var port = DEFAULT_PORT;

var server = http.createServer(function(request, response) {

    var requestUrl = URL.parse(request.url);

    log('requested href:', requestUrl.href);
    log('headers:', request.headers);

    var headers = request.headers;

    // https://nodejs.org/dist/latest-v6.x/docs/api/http.html#http_http_request_options_callback
    var fwdRequest = http.request({
      protocol: 'http:',
      host: headers.host,
      port: 80,
      method: 'GET',
      path: requestUrl.path,
      headers: {}
    }, (fwdResponse) => {

        var fwdResponseData;
        var fwdResponseChunks = [];

        response.writeHead(fwdResponse.statusCode, fwdResponse.headers);

        log('Forward response headers received:', fwdResponse.headers);

        fwdResponse.on('data', (chunk) => {
            log('received bytes:', chunk.length);
            fwdResponseChunks.push(chunk);
        });

        fwdResponse.on('end', () => {

          fwdResponseData = Buffer.concat(fwdResponseChunks);

          log ('forwarding response bytes:', fwdResponseData.length);

          if (fwdResponse.headers['content-type'] 
            && fwdResponse.headers['content-type'].endsWith('/mp4')) {

              log('MP4 payload detected');

              Mp4BufferProxy.digest(toArrayBuffer(fwdResponseData), (arrayBufferOut) => {
                  response.write(Buffer.from(arrayBufferOut));
                  console.log('No more data in forward response, closing backward response');
                  response.end();
              });

          } else {
              response.write(fwdResponseData);
              console.log('No more data in forward response, closing backward response');
              response.end();
          }
        });
    });

    // forwards the request
    fwdRequest.end();
});

server.listen(port);

log("DASH_proxy Server listening at port", port);