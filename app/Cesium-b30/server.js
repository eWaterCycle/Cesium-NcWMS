(function() {
    "use strict";
    /*global console,require,__dirname*/
    /*jshint es3:false*/

    var express = require('express');
    var compression = require('compression');
    var url = require('url');
    var request = require('request');

    var yargs = require('yargs').options({
        'port' : {
            'default' : 8081,
            'description' : 'Port to listen on.'
        },
        'public' : {
            'type' : 'boolean',
            'description' : 'Run a public server that listens on all interfaces.'
        },
        'upstream-proxy' : {
            'description' : 'A standard proxy server that will be used to retrieve data.  Specify a URL including port, e.g. "http://proxy:8000".'
        },
        'bypass-upstream-proxy-hosts' : {
            'description' : 'A comma separated list of hosts that will bypass the specified upstream_proxy, e.g. "lanhost1,lanhost2"'
        },
        'help' : {
            'alias' : 'h',
            'type' : 'boolean',
            'description' : 'Show this help.'
        }
    });
    var argv = yargs.argv;

    if (argv.help) {
        return yargs.showHelp();
    }

    // eventually this mime type configuration will need to change
    // https://github.com/visionmedia/send/commit/d2cb54658ce65948b0ed6e5fb5de69d022bef941
    var mime = express.static.mime;
    mime.define({
        'application/json' : ['czml', 'json', 'geojson'],
        'text/plain' : ['glsl']
    });

    var app = express();
    app.use(compression());
    app.use(express.static(__dirname));

    function getRemoteUrlFromParam(req) {
        var remoteUrl = req.params[0];
        if (remoteUrl) {
            // add http:// to the URL if no protocol is present
            if (!/^https?:\/\//.test(remoteUrl)) {
                remoteUrl = 'http://' + remoteUrl;
            }
            remoteUrl = url.parse(remoteUrl);
            // copy query string
            remoteUrl.search = url.parse(req.url).search;
        }
        return remoteUrl;
    }

    var dontProxyHeaderRegex = /^(?:Host|Proxy-Connection|Connection|Keep-Alive|Transfer-Encoding|TE|Trailer|Proxy-Authorization|Proxy-Authenticate|Upgrade)$/i;

    function filterHeaders(req, headers) {
        var result = {};
        // filter out headers that are listed in the regex above
        Object.keys(headers).forEach(function(name) {
            if (!dontProxyHeaderRegex.test(name)) {
                result[name] = headers[name];
            }
        });
        return result;
    }

    var upstreamProxy = argv['upstream-proxy'];
    var bypassUpstreamProxyHosts = {};
    if (argv['bypass-upstream-proxy-hosts']) {
        argv['bypass-upstream-proxy-hosts'].split(',').forEach(function(host) {
            bypassUpstreamProxyHosts[host.toLowerCase()] = true;
        });
    }

    app.get('/proxy/*', function(req, res, next) {
        // look for request like http://localhost:8080/proxy/http://example.com/file?query=1
        var remoteUrl = getRemoteUrlFromParam(req);
        if (!remoteUrl) {
            // look for request like http://localhost:8080/proxy/?http%3A%2F%2Fexample.com%2Ffile%3Fquery%3D1
            remoteUrl = Object.keys(req.query)[0];
            if (remoteUrl) {
                remoteUrl = url.parse(remoteUrl);
            }
        }

        if (!remoteUrl) {
            return res.send(400, 'No url specified.');
        }

        if (!remoteUrl.protocol) {
            remoteUrl.protocol = 'http:';
        }

        var proxy;
        if (upstreamProxy && !(remoteUrl.host in bypassUpstreamProxyHosts)) {
            proxy = upstreamProxy;
        }

        // encoding : null means "body" passed to the callback will be raw bytes

        request.get({
            url : url.format(remoteUrl),
            headers : filterHeaders(req, req.headers),
            encoding : null,
            proxy : proxy
        }, function(error, response, body) {
            var code = 500;

            if (response) {
                code = response.statusCode;
                res.header(filterHeaders(req, response.headers));
            }

            res.send(code, body);
        });
    });

    app.listen(argv.port, argv.public ? undefined : 'localhost');

    console.log('Cesium development server running.  Connect to http://localhost:%d.', argv.port);
})();