
const express = require('express');

const { body } = require('express-validator/check');

const adminController = require('../controllers/admin');
//using is 
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

router.get('/edit-product/:id', isAuth, adminController.getEditProduct);

// /admin/add-product => POST
//making more validations in here and sanitization with .trim()
router.post(
    '/add-product',
    [
      body('title')
        .isString()
        .isLength({ min: 3 })
        .trim(),
      body('price').isFloat()
    ],
    isAuth,
    adminController.postAddProduct
  );

router.post('/edit-product', [
    body('title')
        .isString()
        .isLength({ min: 3 })
        .trim(),
    body('price').isFloat(),
    body('description')
        .isLength({ min: 5, max: 400 })
        .trim()
], isAuth, adminController.postEditProduct);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;
