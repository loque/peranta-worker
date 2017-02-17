'use strict'

import Client from 'peranta/client'

function objIsWorker(obj)
{
    return obj !== undefined
        && typeof obj === 'object'
        && typeof obj.terminate === 'function'
        && typeof obj.postMessage === 'function'
}

function Transport(worker)
{
    if (objIsWorker(worker) === false) throw new TypeError('Transport.constructor() expects to receive a worker')

    this.receivers = {}
    this.raw = worker

    this.raw.onmessage = event =>
    {
        const message = event.data

        if (!Array.isArray(message))
        {
            if (process.env.NODE_ENV !== 'production')
            {
                console.info(`message from server is not array`, message)
            }

            return
        }

        const channel = message.shift()
        const res = message[0]

        if (this.receivers.hasOwnProperty(channel))
        {
            this.receivers[channel].callback(event, res)
        }
    }

    return this
}

Transport.prototype.on = function on(channel, callback)
{
    this.receivers[channel] = { channel, callback }
}

Transport.prototype.emit = function emit(channel, req)
{
    const reqCopy = JSON.parse(JSON.stringify(req))
    this.raw.postMessage([channel, reqCopy])
}

function create(worker)
{
    return new Client(new Transport(worker))
}

export default { create }
