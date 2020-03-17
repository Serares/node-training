const express = require('express');

const authController = require('../controllers/auth');
// this is the middleware that helps with validation
const { check, body } = require('express-validator/check');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.post('/login',
    [body('email')
        .isEmail()
        .withMessage('Please enter a valid email address.')
        .custom((value, { req }) => {
            return User.findOne({ email: value })
                .then(userDoc => {
                    if (!userDoc) {
                        return Promise.reject("Can't find this email")
                    }
                })
        }),
    body('password', "Invalid password")
        .isLength({ min: 5 })
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim()
    ], authController.postLogin);

router.post('/signup', [
    //you can add the checks in an array
    check('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .custom((value, { req }) => {
            // if (value === 'test@test.com') {
            //   throw new Error('This email address if forbidden.');
            // }
            // return true;

            // this is how we can send a async error message from validation
            // we have to return this 
            return User.findOne({ email: value })
                .then(userDocument => {
                    if (userDocument) {
                        return Promise.reject('Email already exists');
                    }
                })
        }),
    //body checks only in the body of the request
    body(
        'password',
        //adding this message as a default .withMessage
        'Please enter a password with only numbers and text and at least 5 characters.'
    )
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim(),
    body('confirmPassword')
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords have to match!');
            }
            return true;
        })
], authController.postSignup);

router.get('/signup', authController.getSignup);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;
