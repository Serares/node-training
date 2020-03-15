const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendGridTransport = require('nodemailer-sendgrid-transport');
const sendGridAPI = require('../config/db_pass').sendGridApi();
const User = require('../models/user');

const transporter = nodemailer.createTransport(
  sendGridTransport({
    auth:{
      api_key: sendGridAPI
    }
  })
);

exports.getLogin = (req, res, next) => {
  //   const isLoggedIn = req
  //     .get('Cookie')
  //     .split(';')[1]
  //     .trim()
  //     .split('=')[1] === 'true';
  //asa citesti un session
  console.log(req.session.isLoggedIn);
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    //get the key set when redirected
    errorMessage: req.flash('error')
  });
};

exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  // check after email
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        //redirect with a message using flash
        req.flash('error', 'Invalid email or password.');
        return res.redirect('/login');
      }
      //use bcrypt to decrypt the password found in the db
      // bcrypt .compare() goes to then if pass matches or not
      // in catch only for an error
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            // here we are adding the auth with the user object so it can be used in other controllers
            return req.session.save(err => {
              console.log(err);
              res.redirect('/');
            });
          }
          res.redirect('/login');
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login');
        });
    })
    .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  //search a user for the same email
  User.findOne({ email: email })
    .then(userDoc => {
      if (userDoc) {
        // if a user with the same email existrs then redirect to signup
        return res.redirect('/signup');
      }
      //encrypting the password with bcrypt package and this returns a promise
      return bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
          // here the user is created with the hased password
          const user = new User({
            email: email,
            password: hashedPassword,
            cart: { items: [] }
          });
          return user.save();
        })
        .then(result => {
          res.redirect('/login');
          return transporter.sendMail({
            to: email,
            from: 'shop@node-whatever.com',
            subject: 'Signup succeded!',
            html: '<h1>Salutare</h1>'
          })
        });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {

  req.session.destroy((err) => {
    // deleting the session from mongodb and cookie from browser
    console.log(err);
    res.redirect('/');
  })

}
