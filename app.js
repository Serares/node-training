const path = require('path');
const pass = require('./config/db_pass').mongoPass;

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csurf = require('csurf');
const flash = require('connect-flash');
const MongoURI = `mongodb+srv://rares:${pass()}@cluster0-xyshh.mongodb.net/shop`;
const User = require('./models/user');


const errorController = require('./controllers/error');

const app = express();
// setting the communication with database and session
const store = new MongoDBStore({
  uri: MongoURI,
  collection: 'sessions'
});
const csrfProtection = csurf();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
//configuration for session and cookies
app.use(session({
  secret: 'some secret',
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: { httpOnly: true }
}));

//passing csurf object as a middleware for express to use
app.use(csrfProtection);
app.use(flash());

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
});

app.use((req, res, next) => {
  // all rednerd views get thoes variables
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
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