var hasSend = require('./method/hasSend');
var isBinary = require('./method/isBinary');
var isLocal = require('./method/isLocal');
var sendFile = require('./method/sendFile');
var fullUrl = require('./method/fullUrl');

function reqSet(filed, val) {
    if (2 == arguments.length) {
        if (Array.isArray(val)) val = val.map(String);
        else val = String(val);
        this.header[(field + '').toLowerCase()] = val;
    } else {
        for (const key in field) {
            this.header[(key + '').toLowerCase()] = field[key];
        }
    }
};

function extendRequest(req) {
    req.set = reqSet.bind(req);
    Object.defineProperties(req, {
        host: {
            get: function () {
                const proxy = this.app.proxy;
                let host = proxy && this.get('X-Forwarded-Host');
                host = host || this.get('Host');
                if (!host) return '';
                return host.split(/\s*,\s*/)[0];
            },
            set: function (host) {
                const proxy = this.app.proxy;
                if (proxy) {
                    this.header['X-Forwarded-Host'] = host;
                } else {
                    this.header['host'] = host;
                }
                return host;
            },
            enumerable: true,
            configurable: true
        }
    });

    Object.defineProperties(req, {
        protocol: {
            get: function () {
                if(this._protocol) return this._protocol;
                const proxy = this.app.proxy;
                if (this.socket.encrypted) return 'https';
                if (!proxy) return 'http';
                const proto = this.get('X-Forwarded-Proto') || 'http';
                return proto.split(/\s*,\s*/)[0];
            },
            set: function (protocol) {
                if(protocol.indexOf('https') >= 0) {
                    this._protocol = 'https';
                }
                else if(protocol.indexOf('http') > 0) {
                    this._protocol = 'http';
                }
                return this._protocol;
            },
            enumerable: true,
            configurable: true
        }
    });
}


module.exports = function () {
    var proxy = this;
    return async function (ctx, next) {
        ctx.logger = proxy.logger;
        ctx.logger.debug('middleware:log start');
        ctx.proxy = proxy;
        ctx.hasSend = hasSend.bind(ctx);
        ctx.isBinary = isBinary.bind(ctx);
        ctx.isLocal = isLocal.bind(ctx);
        ctx.sendFile = sendFile.bind(ctx);
        ctx.fullUrl = fullUrl.bind(ctx);
        ctx.request.fullUrl = ctx.fullUrl;
        extendRequest(ctx.request);

        proxy.trigger('start', ctx);
        var start = new Date;
        try {
            await next();
        } catch (e) {
            console.log(e);
        }
        var ms = new Date - start;
        ctx.set('X-Response-Time', ms + 'ms');
        // console.log('finish:', ctx.response.status);
        if (typeof ctx.response.status == 'undefined' && !ctx.response.body) {
            ctx.response.status = 404;
            ctx.response.body = 'not found';
        }
        proxy.trigger('end', ctx);
        ctx.logger.debug('middleware:log end');
    };
}