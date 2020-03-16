const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const sendGridTransport = require('nodemailer-sendgrid-transport');
const sendGridAPI = require('../config/db_pass').sendGridApi();
const User = require('../models/user');

const transporter = nodemailer.createTransport(
  sendGridTransport({
    auth: {
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
  let message = req.flash('message');

  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    //get the key set when redirected this is sent as an array so might check if the array is empty or not
    errorMessage: message
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message
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
        req.flash('message', 'Invalid email or password.');
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
        req.flash(
          'error',
          'E-Mail exists already, please pick a different one.'
        );
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

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message
  });
};


exports.postReset = (req, res, next) => {
  // here we create a token that is going to be storred in the users object in the DB
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    //sending the email from the reset password form
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          req.flash('error', 'No account with that email found.');
          return res.redirect('/reset');
        }
        //if the user is found we add the token and expiration date
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then(result => {
        res.redirect('/');
        //sending the email with the token
        // transporter.sendMail({
        //   to: req.body.email,
        //   from: 'shop@node-complete.com',
        //   subject: 'Password reset',
        //   html: `
        //     <p>You requested a password reset</p>
        //     <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
        //   `
        // });
      })
      .catch(err => {
        console.log(err);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  //1h expiration date meaning if you use the token after 1h it wont be available
  //finding a user that has the token
  // resetTokenExpiration: { $gt: Date.now() } this is how to check if the tokenExpiration $greaterThan Date.now()
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then(user => {
      let message = req.flash('error');
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token
      });
    })
    .catch(err => {
      console.log(err);
    });
};


exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;
  // here we get the new password and update the user with a new hased one
  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId
  })
    .then(user => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(result => {
      req.flash('message', 'Your password has been changed');
      res.redirect('/login');
    })
    .catch(err => {
      console.log(err);
    });
};