const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

class Product {

  constructor(title, price, imageUrl, description, id, userId) {
    this.title = title;
    this.price = price;
    this.imageUrl = imageUrl;
    this.description = description;
    //self explanatory
    this._id = id ? new mongodb.ObjectID(id) : null;
    this.userId = userId;
  }

  save() {
    // connect to the db;
    const db = getDb();
    let dbOperation;

    if (this._id) {
      //updated product
      dbOperation = db.collection('products')
        .updateOne({ _id: this._id }, { $set: this });
    } else {
      // insert it
      dbOperation = db
        .collection('products')
        .insertOne(this)
    }

    return dbOperation
      .then(result => {
        console.log(result);
      })
      .catch(err => {
        console.log(err);
      });
  }

  static fetchAll() {
    const db = getDb();
    // gets all products with find and returns a cursor ( its an object returned by mongo)
    return db.collection('products')
      .find()
      .toArray()
      .then(products => {
        console.log(products);
        return products;
      })
      .catch(err => {
        console.log(err);
      });
  }

  static findById(prodId) {
    const db = getDb();
    //returns a cursor object
    return db.collection('products')
      // this is how mongo searches through documents by id
      .find({ _id: new mongodb.ObjectID(prodId) })
      .next()
      .then(product => {
        console.log(product)
        return product;
      })
      .catch(err => console.log(err))
  }

  static deleteById(prodId) {
    const db = getDb();
    return db.collection('products')
      .deleteOne({ _id: new mongodb.ObjectID(prodId) })
      .then(() => {
        console.log("Deleted")
      })
      .catch(err => console.log(err));
  }

}

module.exports = Product;
