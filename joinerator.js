const rand = require('seed-random');
const faker = require('faker');
const RandExp = require('randexp');
const fs = require('fs');
const path = require('path');
const arrays = require('async-arrays');
//augment faker
faker.name.birthday = ()=>{
    let thirteenYearsAgo = new Date();
    let eightyYearsAgo = new Date();
    thirteenYearsAgo.setFullYear(thirteenYearsAgo.getFullYear()-13);
    eightyYearsAgo.setFullYear(eightyYearsAgo.getFullYear()-80);
    return faker.date.between(eightyYearsAgo, thirteenYearsAgo);
}

const joinAllKeys = (namespaces)=>{
    let results = [];
    namespaces.forEach((namespace)=>{
        results = results.concat(
            Object.keys(faker[namespace])
                .map((field)=> namespace+'.'+field)
        );
    });
    return results;
}
const masterlist = joinAllKeys([
    'address',
    'company',
    'random',
    'finance',
    'name',
    'commerce',
    'internet',
    'system',
    'vehicle'
]);
let fakerFields = {};
masterlist.forEach((field)=>{
    fakerFields[field.split('.').pop()] = field;
});

let eightyYearsAgo = new Date();
eightyYearsAgo.setFullYear(eightyYearsAgo.getFullYear()-80);

let randomInt = (from, to, fractionalGenerator) =>{
    let diff = to - from;
    let val = Math.floor(from + fractionalGenerator()*diff);
    return val;
}

const makeNewValue = (schema, rand, fieldName) => {
    let rnd = randomInt(0, 1000000, rand);
    faker.seed(rnd);
    let max = null;
    let min = null;
    for(let lcv =0; lcv < schema['_rules'].length; lcv++){
        if(fakerFields[schema['_rules'][lcv].name]){
            let location = fakerFields[schema['_rules'][lcv].name];
            location = location.split('.');
            return faker[location[0]][location[1]]();
        }
        if(schema['_rules'][lcv].name === 'pattern'){
            return new RandExp(schema['_rules'][lcv].args.regex).gen();
        }
        if(schema['_rules'][lcv].name === 'max' && schema['_rules'][lcv].args.date){
            max = schema['_rules'][lcv].args.date;
        }
        if(schema['_rules'][lcv].name === 'min' && schema['_rules'][lcv].args.date){
            min = schema['_rules'][lcv].args.date;
        }
    }
    if(schema.type === 'date'){
        return faker.date.between(
            (min || eightyYearsAgo),
            (max || new Date())
        );
    }
    if(fieldName && fakerFields[fieldName]){
        let location = fakerFields[fieldName];
        location = location.split('.');
        return faker[location[0]][location[1]]();
    }
}

const Random = {
    seed : function(seed){
        return rand(seed)
    },
    numSeed : (str) => str
                .split('')
                .map((a) => a.charCodeAt(0))
                .reduce((a, b) => a + b)
 };

const makeGenerator = (seed) => {
    return Random.seed(Random.numSeed(seed));
}

let Data = function(definition){
    if(definition['$_root']){
        //definition['_ids']['_byKey']
    }
    //todo: arrays
    if(definition.type == 'object' && definition['_ids']){
        this.children = {};
        definition['_ids']['_byKey'].forEach((value, key)=>{
            this.children[key] = new Data(value.schema);
            this.children[key].fieldName = key;
        });
    }else{
        if(
            definition &&
            definition['$_terms'] &&
            definition['$_terms']['_inclusions'] &&
            definition['$_terms']['_inclusions'][0]
        ){
            let subschema = definition['$_terms']['_inclusions'][0];
            this.subschema = new Data(subschema);
        }else{
            this.schema = definition;
        }
    }
}

Data.prototype.create = function(seed){
    let generator = (typeof seed === 'string')?makeGenerator(seed):seed;
    RandExp.prototype.randInt = (from, to)=>{
        return randomInt(from, to, generator);
    }
    if(this.subschema){
        let numObjects = randomInt(1, 20, generator);
        let results = [];
        for(let lcv =0; lcv < numObjects; lcv++){
            results.push(this.subschema.create(generator));
        }
        return results;
    }else{
        if(this.schema){
            if(this.schema.type === 'array'){
                let numObjects = randomInt(1, 20, generator);
                let results = [];
                for(let lcv =0; lcv < numObjects; lcv++){
                    results.push(this.subschema.create(generator));
                }
                return results;
            }else{
                return makeNewValue(this.schema, generator, this.fieldName)
            }
        }
    }

    if(this.children){
        let results = {};
        Object.keys(this.children).forEach((key)=>{
            results[key] = this.children[key].create(generator);
        });
        return results;
    }
};

Data.prototype.attach = function(opts){ //endpoint, app, definition, input
    let options = opts || {};
    if(!options.app) throw new Error('.attach() requires an app be passed');
    options.app[options.method?options.method.toLowerCase():'post'](
        (options.path || '/'),
        (req, res)=>{
            if(options.input){

            }else{
                res.send(JSON.stringify(this.create('just_a_test')));
            }
        }
    )
};

let API = function(opts, cb){
    let options = opts || {};
    if(!options.app) throw new Error('.attach() requires an app be passed');
    if(!options.directory) throw new Error('.attach() requires a directory to be passed');
    this.options = options;
    this.scan(options.directory, cb || (()=>{}));
};

API.prototype.scan = function(directory, cb){
    fs.readdir(directory, (err, result)=>{
        if(err || (!result) || !result.length) return cb();
        let resultSpec = null;
        let errorSpec = null;
        let specs = [];
        arrays.forEachEmission(result, (item, index, done)=>{
            let itemPath = path.join(directory, item);
            fs.stat(itemPath, (err, stat)=>{
                if(stat.isDirectory()){
                    this.scan(itemPath, ()=>{
                        done();
                    })
                }else{
                    if(item === 'resultSet.spec.js'){
                        resultSpec = require(itemPath);
                        return done();
                    }
                    if(item === 'error.spec.js'){
                        errorSpec = require(itemPath);
                        return done();
                    }
                    if(item.indexOf('.spec.js')){
                        specs.push({
                            spec: item,
                            path: directory
                        });
                        return done();
                    }
                    //nothing to do`
                    done();
                }
            });
        }, ()=>{
            if(this.options.app){
                specs.forEach((item)=>{
                    let name = item.spec.split('.').shift();
                    let localPath = directory.substring(this.options.directory.length);
                    let listPath = localPath+'/'+name+'/list';
                    let individualPath = localPath+'/'+name+'/:id';
                    this.options.app[
                        this.options.method?this.options.method.toLowerCase():'post'
                    ](
                        listPath,
                        (req, res)=>{
                            let spec = require(path.join(item.path, item.spec));
                            let definition = new Data(resultSpec(spec));
                            definition.fieldName = name;
                            if(false){

                            }else{
                                res.send(JSON.stringify(definition.create('just_a_test')));
                            }
                        }
                    );
                    this.options.app[
                        this.options.method?this.options.method.toLowerCase():'post'
                    ](
                        individualPath,
                        (req, res)=>{
                            let spec = require(path.join(item.path, item.spec))
                            let definition = new Data(spec)
                            if(false){

                            }else{
                                res.send(JSON.stringify(definition.create(req.params.id)));
                            }
                        }
                    );
                });
                cb();
            }else{
                cb();
            }
        })
    });
};

module.exports = {
    Data: Data,
    API: API
}
