const fs = require('fs');
const path = require('path');

module.exports = class Product {
    constructor(title) {
        this.title = title;
    }

    save() {
        // create a data folder in the root folder and store a json file
        const p = path.join(path.dirname(process.mainModule.filename), 'data', 'products.json');
    }

    static fetchAll() {
        // static so it can be called directly on the class 
        return products;
    }
}
