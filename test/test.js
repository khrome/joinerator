const should = require('chai').should();
const Joi = require('joi');
const joist = require('../joi-st');
const express = require('express');
const request = require('postman-request');

const simpleSchema = Joi.object().keys({
    email: Joi.string().email().required(),
    phone: Joi.string().regex(/^\d{3}-\d{3}-\d{4}$/).required(),
    birthday: Joi.date().max('1-1-2004').iso()
});

const resultsSchema = Joi.object().keys({
    results: Joi.array().items(Joi.object().keys({
        email: Joi.string().email().required(),
        phone: Joi.string().regex(/^\d{3}-\d{3}-\d{4}$/).required(),
        birthday: Joi.date().max('1-1-2004').iso()
    }))
});

describe('Joinerator', ()=>{
    describe('can use a joi definition', ()=>{
        it('to generate simple objects', (done)=>{
            let definition = new joist.Data(simpleSchema);
            aSeedGenerated = definition.create('A');
            bSeedGenerated = definition.create('B');
            aSeedGenerated.should.not.deep.equal(bSeedGenerated);
            aValidated = simpleSchema.validate(aSeedGenerated);
            bValidated = simpleSchema.validate(bSeedGenerated);
            should.not.exist(aValidated.error);
            should.not.exist(bValidated.error);
            aValidated.value.should.deep.equal(aSeedGenerated);
            bValidated.value.should.deep.equal(bSeedGenerated);
            done();
        });

        it('with arrays', (done)=>{
            let definition = new joist.Data(resultsSchema);
            aSeedGenerated = definition.create('A');
            should.exist(aSeedGenerated.results);
            Array.isArray(aSeedGenerated.results).should.equal(true);
            let validated = resultsSchema.validate(aSeedGenerated);
            should.not.exist(validated.error);
            validated.value.should.deep.equal(aSeedGenerated);
            aSeedGenerated.results.forEach((item)=>{
                let aValidated = simpleSchema.validate(item);
                should.not.exist(aValidated.error);
                aValidated.value.should.deep.equal(item);
            });
            done();
        });

        it('as an endpoint', (done)=>{
            let app = express();
            let definition = new joist.Data(resultsSchema);
            definition.attach({
                app  : app,
                path : '/test/'
            });
            let server = app.listen(3000, ()=>{
                request.post('http://localhost:3000/test/', (err, res, body)=>{
                    let response = null;
                    try{
                        response = JSON.parse(body.toString());
                    }catch(ex){
                        should.not.exist(ex);
                    }
                    let validated = resultsSchema.validate(response);
                    should.not.exist(validated.error);
                    validated.value.results = validated.value.results.map((item)=>{
                        item.birthday = item.birthday.toISOString()
                        return item;
                    });
                    validated.value.should.deep.equal(response);
                    server.close(()=>{
                        done();
                    })
                })
            });
        });
    });
});
