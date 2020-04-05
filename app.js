const path = require('path');
const pass = require('./config/db_pass').mongoPass;
const fs = require('fs');
const https = require('https');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csurf = require('csurf');
const flash = require('connect-flash');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

//globally avail in the node app 'process'
const MongoURI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0-xyshh.mongodb.net/${process.env.MONGO_DB}`;

const User = require('./models/user');
const multer = require('multer');

const errorController = require('./controllers/error');

const app = express();
// setting the communication with database and session
const store = new MongoDBStore({
  uri: MongoURI,
  collection: 'sessions'
});
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getTime() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  console.log(file);
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const csrfProtection = csurf();
// const privateKey = fs.readFileSync('server.key');
// const certificate = fs.readFileSync('server.cert');

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' })

app.use(morgan('combined', {stream: accessLogStream}));
// helmet is used to set secure headers
// overall protect the app in production
app.use(helmet());
// used to compress front end assets css js
app.use(compression());

app.use(bodyParser.urlencoded({ extended: false }));
// configurare multer ca sa parseze imagini
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter, onError: function (err, next) { console.log(err); next() } }).single('image')
);
app.use(express.static(path.join(__dirname, 'public')));
//adding the serving of static images
app.use('/images', express.static(path.join(__dirname, 'images')));
//configuration for session and cookies
app.use(session({
  secret: 'MySecret',
  resave: false,
  saveUninitialized: false,
  store: store
}));

//passing csurf object as a middleware for express to use
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  // all rendered views get thoes variables
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});


//we need to add this middleware
app.use((req, res, next) => {
  //if there is no authentication then just ignore this middleware return next()
  if (!req.session.user) {
    return next()
  }
  // if there is a user in session then get it's ID and add it in req.user so we can use it's mongoose object with all methods
  User.findById(req.session.user._id)
    .then(user => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});


app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);
app.get('/500', errorController.get500);

app.use((error, req, res, next) => {
  console.log(error);
  // res.status(error.httpStatusCode).render(...);
  // res.redirect('/500');
  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500',
    isAuthenticated: false
  });

});

mongoose.connect(MongoURI)
  .then(res => {
    app.listen(process.env.PORT || 3000);
    // https.createServer({key: privateKey, cert: certificate},app).listen(process.env.PORT || 3000);
  })
  .catch(err => console.log(err));
