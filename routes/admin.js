const path = require('path');

const express = require('express');

// const rootDir = require('../util/path');

const router = express.Router();

const productsController = require('../controllers/products');



// /admin/add-product => GET
router.get('/add-product', productsController.getAddProduct);

// /admin/add-product => POST
router.post('/add-product', productsController.postAddProducts);

module.exports = router;
