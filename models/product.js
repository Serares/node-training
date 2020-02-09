const products = [];

module.exports = class Product{
    constructor(title){
        this.title = title;
    }

    save(){
        products.push(this);
    }

    static fetchAll(){
        // static so it can be called directly on the class 
        return products;
    }
}
