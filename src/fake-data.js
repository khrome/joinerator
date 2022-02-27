
const {Walker} = require('joi-traverse');
const faker = require('../augmented-faker');
const fs = require('fs');
const path = require('path');
const arrays = require('async-arrays');
const RandExp = require('randexp');
const fakerFields = faker.functionIndex();

let eightyYearsAgo = new Date();
eightyYearsAgo.setFullYear(eightyYearsAgo.getFullYear()-80);

const Data = Walker.extend({
    create : function(seed){
        return this.traverse(seed);
    },
    createNode : function(options){
        return new Data(options);
    },
    map : function(value, generator){
        if(Array.isArray(value)){ //we need to make entries in an array
            let numObjects = generator.randomInt(1, 20, generator)-1;
            let results = [];
            for(let lcv =0; lcv < numObjects; lcv++){
                value.push(this.subschema.traverse(generator));
            }
        }
        return value;
    },
    make : function(schema, generator, fieldName){
        let rnd = generator.randomInt(0, 1000000, generator);
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
    },
    attach : function(opts){ //endpoint, app, definition, input
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
    }
});

module.exports = Data;
