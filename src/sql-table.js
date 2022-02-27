const {Walker} = require('joi-traverse');

const jsonToCreateSQL = (tableName, ob, variant)=>{
    let dialect = {};
    switch((variant || 'mysql').toLowerCase()){
        case 'mysql':
            dialect.serial = 'AUTO_INCREMENT';
            break;
        case 'postgres':
            dialect.serial = 'SERIAL';
            break;
        default : throw new Error('unrecognized variant: '+ variant);
    }
    let fields = Object.keys(ob).map((key)=>{
        let type = 'VARCHAR(255)';
        let qualifiers = '';
        if(ob[key].date) type = 'DATETIME';
        return "\n"+`    ${key} ${type}${qualifiers?' '+qualifiers:''}`;
    });
    let sql = `CREATE TABLE IF NOT EXISTS ${tableName}(${fields.join(',')}\n)`;
    return sql;
};

let stringsNames = ['pattern', 'email'];

const Data = Walker.extend({
    table : function(name, type){
        let results = this.traverse(Math.random()+'');
        let incoming = (type || '').toLowerCase().split(':');
        let format = incoming[0];
        let variant = incoming[1];
        switch(format){
            case 'json': return results;
            case 'sql': return jsonToCreateSQL(name, results, variant);
            default : throw new Error('unrecognized type: '+ type);
        }
        return this.traverse(Math.random()+'');
    },
    createNode : function(options){
        return new Data(options);
    },
    map : function(value, generator){
        /*if(Array.isArray(value)){ //we need to make entries in an array
            let numObjects = generator.randomInt(1, 20, generator)-1;
            let results = [];
            for(let lcv =0; lcv < numObjects; lcv++){
                value.push(this.subschema.traverse(generator));
            }
        }*/
        return value;
    },
    make : function(schema, generator, fieldName){
        let results = {};
        for(let lcv =0; lcv < schema['_rules'].length; lcv++){
            if(schema['_rules'][lcv].name){
                if(stringsNames.indexOf(schema['_rules'][lcv].name) !== -1){
                    results.string = true;
                }
            }
            if(schema['_rules'][lcv].name === 'pattern' && schema['_rules'][lcv].args.regex){

            }
            if(schema['_rules'][lcv].name === 'max' && schema['_rules'][lcv].args.date){
                results.date = true;
            }
            if(schema['_rules'][lcv].name === 'min' && schema['_rules'][lcv].args.date){
                results.date = true;
            }
        }
        if(schema.type === 'date'){
            results.date = true;
        }
        if(fieldName){

        }
        return results;
    }
});

module.exports = Data;
