const rand = require('seed-random');
const faker = require('faker');
const RandExp = require('randexp');
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

const makeNewValue = (schema, rand) => {
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
        if(schema['_rules'][lcv].name === 'max'){
            max = schema['_rules'][lcv].args.date;
        }
    }
    if(schema.type === 'date'){
        return faker.date.between(
            (min || eightyYearsAgo),
            (max || new Date())
        );
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
                return makeNewValue(this.schema, generator)
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

module.exports = {
    Data: Data
}
