'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _client = require('peranta/client');

var _client2 = _interopRequireDefault(_client);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function objIsWorker(obj) {
    return obj !== undefined && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && typeof obj.terminate === 'function' && typeof obj.postMessage === 'function';
}

function Transport(worker) {
    var _this = this;

    if (objIsWorker(worker) === false) throw new TypeError('Transport.constructor() expects to receive a worker');

    this.receivers = {};
    this.raw = worker;

    this.raw.onmessage = function (event) {
        var message = event.data;

        if (!Array.isArray(message)) {
            if (process.env.NODE_ENV !== 'production') {
                console.info('message from server is not array', message);
            }

            return;
        }

        var channel = message.shift();
        var res = message[0];

        if (_this.receivers.hasOwnProperty(channel)) {
            _this.receivers[channel].callback(event, res);
        }
    };

    return this;
}

Transport.prototype.on = function on(channel, callback) {
    this.receivers[channel] = { channel: channel, callback: callback };
};

Transport.prototype.emit = function emit(channel, req) {
    var reqCopy = JSON.parse(JSON.stringify(req));
    this.raw.postMessage([channel, reqCopy]);
};

function create(worker) {
    return new _client2.default(new Transport(worker));
}

exports.default = { create: create };