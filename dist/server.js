'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _server = require('peranta/server');

var _server2 = _interopRequireDefault(_server);

var _router = require('peranta/router');

var _router2 = _interopRequireDefault(_router);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getContext() {
    if ((typeof WorkerGlobalScope === 'undefined' ? 'undefined' : _typeof(WorkerGlobalScope)) !== undefined && self instanceof WorkerGlobalScope) {
        return self;
    }

    return window;
}

function Transport(ctx) {
    var _this = this;

    this.receivers = {};
    this.raw = ctx;

    this.raw.onmessage = function (event) {
        var message = event.data;

        if (!Array.isArray(message)) {
            if (process.env.NODE_ENV !== 'production') {
                console.info('message from client is not array', message);
            }
            return;
        }

        var channel = message.shift();
        var req = message[0];

        if (_this.receivers.hasOwnProperty(channel)) {
            event.sender = { send: _this.send.bind(_this) };
            _this.receivers[channel].callback(event, req);
        } else if (process.env.NODE_ENV !== 'production') {
            console.info('channel "' + channel + '" has no receiver attached');
        }
    };

    return this;
}

Transport.prototype.on = function on(channel, callback) {
    this.receivers[channel] = { channel: channel, callback: callback };
};

Transport.prototype.send = function send(channel, res) {
    var resCopy = JSON.parse(JSON.stringify(res));
    this.raw.postMessage([channel, resCopy]);
};

function create() {
    return new _server2.default(new Transport(getContext()), new _router2.default());
}

exports.default = { create: create };