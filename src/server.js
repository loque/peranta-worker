'use strict'

const Server = require('peranta/server')
const Router = require('peranta/router')

function getContext()
{
    if (typeof WorkerGlobalScope !== undefined && self instanceof WorkerGlobalScope)
    {
        return self
    }

    return window
}

function Transport(ctx)
{
    this.receivers = {}
    this.raw = ctx

    this.raw.onmessage = event =>
    {
        let message = event.data

        if (!Array.isArray(message))
        {
            if (process.env.NODE_ENV !== 'production')
            {
                console.info(`message from client is not array`, message)
            }
            return
        }

        const channel = message.shift()
        const req = message[0]

        if (this.receivers.hasOwnProperty(channel))
        {
            event.sender = { send: this.send.bind(this) }
            this.receivers[channel].callback(event, req)
        }
        else
        {
            if (process.env.NODE_ENV !== 'production')
            {
                console.info(`channel "${channel}" has no receiver attached`)
            }
        }
    }

    return this
}

Transport.prototype.on = function on(channel, callback)
{
    this.receivers[channel] = { channel, callback }
}

Transport.prototype.send = function send(channel, res)
{
    let resCopy = JSON.parse(JSON.stringify(res))
    this.raw.postMessage([channel, resCopy])
}

function create()
{
    return new Server(new Transport(getContext()), new Router())
}

module.exports = { create }
