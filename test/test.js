const should = require('chai').should();
const {joi} = require('joi-traverse');
const joinerator = require('../joinerator');
const express = require('express');
const path = require('path');
const request = require('postman-request');

const simpleSchema = joi.object().keys({
    email: joi.string().email().required(),
    phone: joi.string().regex(/^\d{3}-\d{3}-\d{4}$/).required(),
    birthday: joi.date().max('1-1-2004').iso()
});

const simpleSQL = `CREATE TABLE IF NOT EXISTS simple_table(
    email VARCHAR(255),
    phone VARCHAR(255),
    birthday DATETIME
)`;

const resultsSchema = joi.object().keys({
    results: joi.array().items(joi.object().keys({
        email: joi.string().email().required(),
        phone: joi.string().regex(/^\d{3}-\d{3}-\d{4}$/).required(),
        birthday: joi.date().max('1-1-2004').iso()
    }))
});

const fetchReturnsList = (url, done)=>{
    request.post(url, (err, res, body)=>{
        let response = null;
        try{
            response = JSON.parse(body.toString());
        }catch(ex){
            should.not.exist(ex);
        }
        //todo: validate list
        done()
    })
}

const fetchReturnsObject = (url, done)=>{
    request.post(url, (err, res, body)=>{
        let response = null;
        try{
            response = JSON.parse(body.toString());
        }catch(ex){
            should.not.exist(ex);
        }
        //todo: validate object
        done()
    })
}

describe('Joinerator', ()=>{
    describe('can generate data', ()=>{
        it('to generate simple objects', (done)=>{
            let definition = new joinerator.FakeData(simpleSchema);
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
            let definition = new joinerator.FakeData(resultsSchema);
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
            let definition = new joinerator.FakeData(resultsSchema);
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

        it('as an API', (done)=>{
            let app = express();
            new joinerator.API({
                app  : app,
                directory : path.join(__dirname, 'api')
            }, ()=>{
                let domain = 'http://localhost:3000';
                let server = app.listen(3000, ()=>{
                    fetchReturnsList(domain+'/v1/user/list', ()=>{
                        fetchReturnsList(domain+'/v1/transaction/list', ()=>{
                            fetchReturnsObject(domain+'/v1/user/A', ()=>{
                                fetchReturnsObject(domain+'/v1/transaction/A', ()=>{
                                    server.close(()=>{
                                        done();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });

    });

    describe('can generate SQL Table definitions', ()=>{
        it('to generate simple objects', (done)=>{
            let definition = new joinerator.SQLTable(simpleSchema);
            let tableDefinition = definition.table('simple_table', 'sql');
            tableDefinition.should.equal(simpleSQL);
            done();
        });

        it.skip('with arrays', (done)=>{
            let definition = new joinerator.FakeData(resultsSchema);
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
