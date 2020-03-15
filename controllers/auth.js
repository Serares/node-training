const User = require('../models/user');

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
    isAuthenticated: req.session.isLoggedIn
  });
};

exports.postLogin = (req, res, next) => {
  User.findById('5e6d351aefb2580738d40b5e')
    .then(user => {
      console.log('User found');
      // here we are adding the auth with the user object so it can be used in other controllers
      req.session.isLoggedIn = true;
      req.session.user = user;
      req.session.save((err)=>{
        // to make sure session exists when redirecting
        console.log(err);
        res.redirect('/');
      })
    })
    .catch(err => console.log(err));
  //asa setezi un session
  // req.session.isLoggedIn = true;
};

exports.postLogout = (req,res,next)=>{

  req.session.destroy((err)=>{
    // deleting the session from mongodb and cookie from browser
    console.log(err);
    res.redirect('/');
  })

}
