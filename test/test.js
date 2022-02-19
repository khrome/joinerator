const should = require('chai').should();
const Joi = require('joi');
const joist = require('../joi-st');

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

describe('joist', ()=>{
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
    });
});
