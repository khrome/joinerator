const faker = require('faker');

let eightyYearsAgo = new Date();
eightyYearsAgo.setFullYear(eightyYearsAgo.getFullYear()-80);

faker.name.birthday = ()=>{
    let thirteenYearsAgo = new Date();
    let eightyYearsAgo = new Date();
    thirteenYearsAgo.setFullYear(thirteenYearsAgo.getFullYear()-13);
    eightyYearsAgo.setFullYear(eightyYearsAgo.getFullYear()-80);
    return faker.date.between(eightyYearsAgo, thirteenYearsAgo);
}

faker.functionIndex = ()=>{
    const joinAllKeys = (namespaces)=>{
        let results = [];
        namespaces.forEach((namespace)=>{
            results = results.concat(
                Object.keys(faker[namespace]).map((field)=> namespace+'.'+field)
            );
        });
        return results;
    }
    const masterlist = joinAllKeys([
        'address', 'company', 'random', 'finance', 'name', 'commerce', 'internet',
        'system', 'vehicle'
    ]);
    let fakerFields = {};
    masterlist.forEach((field)=>{
        fakerFields[field.split('.').pop()] = field;
    });
    return fakerFields;
}

module.exports = faker;
