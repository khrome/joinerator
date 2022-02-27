JOInerator
==========

Use [Joi](https://joi.dev/) configurations as the primary record for your data.

The goal of this library is to, without anything more than a joi configuration:

- generate infinite [data](https://en.wikipedia.org/wiki/Synthetic_data)
- generate [table definitions](https://en.wikipedia.org/wiki/Table_(database))
- generate [DB migrations](https://en.wikipedia.org/wiki/Schema_migration)
- generate a document-centric [CRUD API](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete)


It started as a simple data generator, but I realized the potential to use a single source of truth to both avoid replication within a project and make the work surface much simpler, as well as guarantee consistent validation throughout the application.


Joinerator.FakeData
---------------

```javascript
    const Joinerator = require('joinerator');
    let definition = new Joinerator.FakeData(joiSchema);
    let generatedData = definition.create('my-seed-value');
    //generatedData contains the data we created
```


Joinerator.SQLTable
-------------------

```javascript
    const Joinerator = require('joinerator');
    let definition = new Joinerator.SQLTable(joiSchema);
    let sql = definition.table('my-table-name', 'sql');
    //sql contains the staements we created
```

Joinerator.API
--------------
To bind a specific URL to an already existing express instance(`expressInstance`):

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
Alternatively, given a directory structure:
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


Roadmap
-------
- [x] validate your data
- [x] generate infinite, validatable, sample data
- [x] generate table definitions
- [ ] generate DB migrations
- [ ] guarantee an always valid datastore
- [ ] crud backend with `expand` verb and pluggable sources, caches and streams
- [ ] client library (auto-loading data from store)
- [ ] JSON+comments compatible schema format (JSOSN)
- [ ] support deep JSON in relational DBs
- [ ] reference-free usage*

* - using proxies to replicate infinite data space in async fns

Testing
-------

```bash
./node_modules/mocha/bin/mocha
```
