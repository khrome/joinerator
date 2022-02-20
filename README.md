JOInerator
==========

Turn [Joi](https://joi.dev/) configurations into deterministic sample data APIs with little to no effort.

The results are deterministic (the same inputs always produce the same outputs), but not coherent (various fields may not make sense (IE: a zipcode in one location, an area code from another, etc.)).

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

There aren't many options, everything is currently JSON and incoming validation isn't quite ready yet. Otherwise, go crazy.


Testing
-------

```bash
./node_modules/mocha/bin/mocha
```
