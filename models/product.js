const fs = require('fs');
const path = require('path');
let p = path.join(path.dirname(process.mainModule.filename), 'data', 'products.json');

const getProductsFromFile = (cb) => {
    
    fs.readFile(p, (err, fileContent) => {
        if (err) {
            return cb([])
        };
        return cb(JSON.parse(fileContent));
    })
}

module.exports = class Product {
    constructor(title) {
        this.title = title;
        this.p;
    }

    save() {
        // create a data folder in the root folder and store a json file
        getProductsFromFile(products => {
            products.push(this);
            fs.writeFile(p, JSON.stringify(products), err => {
                console.log(err);
            })
        });
    }

    static fetchAll(cb) {
        // static so it can be called directly on the class 
        getProductsFromFile(cb);
    }
}
