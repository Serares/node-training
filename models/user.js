const database = require('../util/database').getDb;
const mongodb = require('mongodb');

class User {
    constructor(username, email, cart, id) {
        this.name = username;
        this.email = email;
        this.cart = cart;
        this._id = id;
    }

    save() {
        const db = database();
        return db.collection('users')
            .insertOne(this)
            .then(res => {
                console.log('User added');
            })
            .catch(err => {
                console.log(err);
            })
    }

    addToCart(product) {
        console.log("Product", product);
        const cartProductIndex = this.cart.items.findIndex(cp => {
            // aici product._id returneaza ca un string care nu este string;
            return cp.productId.toString() === product._id.toString();
        });
        let newQuantity = 1;
        const updatedCartItems = [...this.cart.items];

        if (cartProductIndex >= 0) {
            newQuantity = this.cart.items[cartProductIndex].quantity + 1;
            updatedCartItems[cartProductIndex].quantity = newQuantity;
        } else {
            updatedCartItems.push({ productId: new mongodb.ObjectID(product._id), quantity: newQuantity });
        }

        const updatedCart = { items: updatedCartItems };

        const db = database();
        return db.collection('users')
            .updateOne({ _id: new mongodb.ObjectID(this._id) }, { $set: { cart: updatedCart } })
    }

    getCart() {
        const db = database();
        const productIds = this.cart.items.map(i => { return i.productId });
        // $in takes an array if ids and returns a cursor that has references to all the products
        return db.collection('products')
            .find({ _id: { $in: productIds } })
            //convert them to js array
            .toArray()
            .then(products => {
                return products.map(p => {
                    return {
                        ...p, quantity: this.cart.items.find(i => {
                            return i.productId.toString() === p._id.toString();
                        }).quantity
                    };
                });
            });
    }

    deleteItem(productId) {
        const updatedCartItems = this.cart.items.filter(item => { return item.productId.toString() !== productId.toString() });

        const db = database();
        return db.collection('users')
            .updateOne(
                { _id: new mongodb.ObjectID(this._id) },
                { $set: { cart: { items: updatedCartItems } } })

    }

    addOrder() {

        const db = database();
        // need to return the result of the addOrder
        return this.getCart()
            .then(products => {
                const order = {
                    items: products,
                    user: {
                        _id: new mongodb.ObjectID(this._id),
                        name: this.name
                    }
                }
                return db.collection('orders')
                    .insertOne(order)
            })
            .then(result => {
                // successfull inserting the order and cleaning the existing user cart
                this.cart = { items: [] };
                return db
                    .collection('users')
                    .updateOne(
                        { _id: new mongodb.ObjectID(this._id) },
                        { $set: { cart: { items: [] } } }
                    )
            })
            .catch(err => {
                console.log(err);
            });
    }

    getOrders() {
        const db = database();
        return db.collection('orders').find({'user._id': new mongodb.ObjectID(this._id)})
        .toArray();
    }

    static findById(userId) {
        const db = database();
        return db.collection('users')
            .find({ _id: new mongodb.ObjectID(userId) })
            .next()
            .then(user => {
                console.log(user);
                return user;
            })
            .catch(err => {
                console.log(err);
            })
    }
}

module.exports = User;
