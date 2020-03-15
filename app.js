const path = require('path');
const pass = require('./config/db_pass').mongoPass;

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const MongoURI = `mongodb+srv://rares:${pass()}@cluster0-xyshh.mongodb.net/shop?retryWrites=true&w=majority`;
const User = require('./models/user');


const errorController = require('./controllers/error');


const app = express();
const store = new MongoDBStore({
  uri: MongoURI,
  collection: 'sessions'
});

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'some secret',
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: { httpOnly: true }
}));

//we need to add this middleware
app.use((req, res, next) => {
  //if there is no authentication then just ignore this middleware return next()
  if (!req.session.user) {
    return next()
  }
  // if there is a user in session then get it's ID and add it in req.user so we can use it's mongoose object with all methods
  User.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose.connect(MongoURI)
  .then(res => {
    app.listen(3000);
  })
  .catch(err => console.log(err));