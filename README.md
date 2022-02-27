JOInerator
==========

Use [Joi](https://joi.dev/) configurations as the primary record for your data.

The goal of this library is to:

- validate your data
- generate infinite, validatable, sample data
- generate table definitions
- generate DB migrations
- guarantee an always valid datastore

It started as a simple data generator, but I realized the potential to use a single source of truth to both avoid replication within a project and make the work surface much simpler, as well as guarantee consistent validation throughout the application.


Programmatic Usage
------------------

```javascript
    const Joinerator = require('joinerator');
    let definition = new Joinerator.Data(joiSchema);
    let generatedData = definition.create('my-seed-value');
    //generatedData contains the data we created
```


API Attachment
--------------
```javascript
    const Joinerator = require('joinerator');
    let definition = new Joinerator.Data(joiSchema);
    definition.attach({
        app : expressInstance,
        path : '/url/path/'
    });
    expressInstance.listen(port);
    //now requests to `/url/path/` generate data
```

API Usage
---------
Given a directory structure:
```bash
└── v1
   ├── error.spec.js
   ├── resultSet.spec.js
   ├── transaction.spec.js
   └── user.spec.js
```

`error.spec.js` and `resultSet.spec.js` are special files which tell the API how to wrap result sets and how to return errors.

`transaction.spec.js` and `user.spec.js` are just Joi configurations which will be generated via `/v1/user/list`,  `/v1/user/:id`, `/v1/transaction/list` and `/v1/transaction/:id`

```javascript
const Joinerator = require('joinerator');
new Joinerator.API({
    app: expressInstance,
    directory: '/directory/to/scan'
}, ()=>{
    //dir has been scanned, instance augmented
    expressInstance.listen(port);
});
```

There aren't many options, everything is currently JSON and incoming validation isn't quite ready yet. Otherwise, go crazy.


Testing
-------

```bash
./node_modules/mocha/bin/mocha
```
