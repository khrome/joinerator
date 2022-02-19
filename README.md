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


API Usage
---------
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


Testing
-------

```bash
./node_modules/mocha/bin/mocha
```
