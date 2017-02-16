'use strict'

const expect = require('chai').expect
const Client = require('../src/client')

describe('Client', function()
{
    it('should throw if no worker was sent', function()
    {
        expect(function(){ const client = Client.create() }).to.throw(`Transport.constructor() expects to receive a worker`)
    })
})
