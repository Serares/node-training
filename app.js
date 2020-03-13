const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req,res,next)=>{
    User.findByPk(1)
    .then(user=>{
        // adding a sequelize object to the request
        // so we can use sequelize methods on it like destroy()
        req.user = user;
        next();
    })
    .catch()
    ;
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

// make a relation between these tables
Product.belongsTo(User, {constraints: true, onDelete: "CASCADE"});
// optional to do this but it's more clear
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, {through: CartItem});
Product.belongsToMany(Cart , {through: CartItem});

// have to call this at the end of the app to sync all the models
// force:true used to overrite the tables
sequelize
// .sync({force:true})
.sync()
.then(result=>{
    //this is done so that there is always a user available in the table
    return User.findByPk(1);
    app.listen(3000);
})
.then(user=>{
    if(!user){
        return User.create({name:"Max", email: "dummy@email.com"})
    }
    return user;
})
.then(user=>{
    // console.log(user);
    return user.createCart();
    
})
.then(cart=>{
    app.listen(3000);
})
.catch(err=>{
    console.log(err);
});


