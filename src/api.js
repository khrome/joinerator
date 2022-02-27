const fs = require('fs');
const path = require('path');
const arrays = require('async-arrays');
const Data = require('./fake-data');

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

module.exports = API;
