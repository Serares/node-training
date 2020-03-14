const path = require('path');
const pass = require('./config/db_pass').mongoPass;

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use((req,res,next)=>{
    User.findById('5e6d351aefb2580738d40b5e')
    .then(user=>{
        console.log('User found');
        req.user = user
        next()
    })
    .catch(err=>console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose.connect(`mongodb+srv://rares:${pass()}@cluster0-xyshh.mongodb.net/shop?retryWrites=true&w=majority`)
.then(result => {
    User.findOne().then(user => {
      if (!user) {
        const user = new User({
          name: 'Rares',
          email: 'test@email.com',
          cart: {
            items: []
          }
        });
        user.save();
      }
    });
    app.listen(3000);
  })
.catch(err=>console.log(err));