const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products'
      });
    })
    .catch(err => {
      console.log(err);
    });

};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.id;
  // sequelize method to get single data;
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        path: '/products',
        product: product,
        pageTitle: product.title
      });
    })
    .catch(err => {
      console.log(err);
    })

}

exports.getIndex = (req, res, next) => {

  Product.fetchAll()
    // destructuring the data from the DB
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      })
    })
    .catch(err => {
      console.log(err);
    });

};

exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then(products => {
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      })
    })
    .catch(err => { console.log(err) });
};

exports.postDeleteItem = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
  .deleteItem(prodId)
    .then(result=>{
      res.status(300).redirect('/cart');
    })
    .catch(err=>console.log(err))
}

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      req.user.addToCart(product);
      res.status(300).redirect('/cart');
    })
    .catch(err => console.log(err))
}

exports.postOrder = (req, res, next) => {
  let fetchedCart;
  req.user
  .addOrder()
  .then(result=>{
    res.status(300).redirect('/orders')
  })
  .catch(err=>{console.log(err)});
} 

exports.getOrders = (req, res, next) => {
  // concept of eager loading
  req.user.getOrders()
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders:orders
      });
    })
    .catch(err => {
      console.log(err);
    })

};

// exports.getCheckout = (req, res, next) => {
//   res.render('shop/checkout', {
//     path: '/checkout',
//     pageTitle: 'Checkout'
//   });
// };
