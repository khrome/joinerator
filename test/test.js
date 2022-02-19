const should = require('chai').should();
const Joi = require('joi');
const joist = require('../joi-st');

const simpleSchema = Joi.object().keys({
    email: Joi.string().email().required(),
    phone: Joi.string().regex(/^\d{3}-\d{3}-\d{4}$/).required(),
    birthday: Joi.date().max('1-1-2004').iso()
});

describe('joist', ()=>{
    describe('can use a joi definition', ()=>{
        it('to parse', ()=>{
            let definition = new joist.Data(simpleSchema);
            console.log('A', definition.create('A'));
            console.log('B', definition.create('B'));
        });
    });
});
