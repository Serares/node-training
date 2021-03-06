const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password:{
    type:String,
    required:true
  },
  resetToken:String,
  resetTokenExpiration: Date,
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        quantity: { type: Number, required: true }
      }
    ]
  }
});

userSchema.methods.addToCart = function(product) {
  const cartProductIndex = this.cart.items.findIndex(cp => {
    return cp.productId.toString() === product._id.toString();
  });
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
      //if the product is already in cart then increment the quantity
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity
    });
  }
  const updatedCart = {
    items: updatedCartItems
  };
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.removeFromCart = function(productId) {
  const updatedCartItems = this.cart.items.filter(item => {
    return item._id.toString() !== productId.toString();
  });
  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.clearCart = function() {
  this.cart = { items: [] };
  return this.save();
};

module.exports = mongoose.model('User', userSchema);


// const database = require('../util/database').getDb;
// const mongodb = require('mongodb');

// class User {
//     constructor(username, email, cart, id) {
//         this.name = username;
//         this.email = email;
//         this.cart = cart;
//         this._id = id;
//     }

//     save() {
//         const db = database();
//         return db.collection('users')
//             .insertOne(this)
//             .then(res => {
//                 console.log('User added');
//             })
//             .catch(err => {
//                 console.log(err);
//             })
//     }

//     addToCart(product) {
//         console.log("Product", product);
//         const cartProductIndex = this.cart.items.findIndex(cp => {
//             // aici product._id returneaza ca un string care nu este string;
//             return cp.productId.toString() === product._id.toString();
//         });
//         let newQuantity = 1;
//         const updatedCartItems = [...this.cart.items];

//         if (cartProductIndex >= 0) {
//             newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//             updatedCartItems[cartProductIndex].quantity = newQuantity;
//         } else {
//             updatedCartItems.push({ productId: new mongodb.ObjectID(product._id), quantity: newQuantity });
//         }

//         const updatedCart = { items: updatedCartItems };

//         const db = database();
//         return db.collection('users')
//             .updateOne({ _id: new mongodb.ObjectID(this._id) }, { $set: { cart: updatedCart } })
//     }

//     getCart() {
//         const db = database();
//         const productIds = this.cart.items.map(i => { return i.productId });
//         // $in takes an array if ids and returns a cursor that has references to all the products
//         return db.collection('products')
//             .find({ _id: { $in: productIds } })
//             //convert them to js array
//             .toArray()
//             .then(products => {
//                 return products.map(p => {
//                     return {
//                         ...p, quantity: this.cart.items.find(i => {
//                             return i.productId.toString() === p._id.toString();
//                         }).quantity
//                     };
//                 });
//             });
//     }

//     deleteItem(productId) {
//         const updatedCartItems = this.cart.items.filter(item => { return item.productId.toString() !== productId.toString() });

//         const db = database();
//         return db.collection('users')
//             .updateOne(
//                 { _id: new mongodb.ObjectID(this._id) },
//                 { $set: { cart: { items: updatedCartItems } } })

//     }

//     addOrder() {

//         const db = database();
//         // need to return the result of the addOrder
//         return this.getCart()
//             .then(products => {
//                 const order = {
//                     items: products,
//                     user: {
//                         _id: new mongodb.ObjectID(this._id),
//                         name: this.name
//                     }
//                 }
//                 return db.collection('orders')
//                     .insertOne(order)
//             })
//             .then(result => {
//                 // successfull inserting the order and cleaning the existing user cart
//                 this.cart = { items: [] };
//                 return db
//                     .collection('users')
//                     .updateOne(
//                         { _id: new mongodb.ObjectID(this._id) },
//                         { $set: { cart: { items: [] } } }
//                     )
//             })
//             .catch(err => {
//                 console.log(err);
//             });
//     }

//     getOrders() {
//         const db = database();
//         return db.collection('orders').find({'user._id': new mongodb.ObjectID(this._id)})
//         .toArray();
//     }

//     static findById(userId) {
//         const db = database();
//         return db.collection('users')
//             .find({ _id: new mongodb.ObjectID(userId) })
//             .next()
//             .then(user => {
//                 console.log(user);
//                 return user;
//             })
//             .catch(err => {
//                 console.log(err);
//             })
//     }
// }

// module.exports = User;
