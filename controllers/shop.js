const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
  Product.findAll()
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
  Product.findByPk(prodId)
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

  Product.findAll()
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
  req.user.getCart()
    .then(cart => {
      return cart.getProducts()
        .then(products => {
          res.render('shop/cart', {
            path: '/cart',
            pageTitle: 'Your Cart',
            products: products
          })
        })
        .catch(err => { console.log(err) });
    })
    .catch(err => {
      console.log("Can't get cart",err);
    })
  /*
  Cart.getCart(cart => {
    Product.fetchAll(products => {
      const cartProducts = [];
      // gaseste toate produseele care se afla in cart.json
      for (product of products) {
        const cartProductData = cart.products.find(prod => prod.id === product.id);
        if (cartProductData) {
          cartProducts.push({ productData: product, qty: cartProductData.qty });
        }
      }
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: cartProducts
      })

    })

  })
*/

};

exports.postDeleteItem = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId, product => {
    Cart.deleteProduct(prodId, product.price);
    res.redirect('/cart');
  })
}

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  let fetchedCart;
  req.user
  .getCart()
  .then(cart=>{
    fetchedCart= cart;
    return cart.getProducts({where: {id: prodId} });
  })
  .then(products=>{
    let product;
    if(products.length > 0){
      product = products[0];
    }
    let newQuantity = 1;
    if(product){
      // get quantity and change it
    }
    return Product.findByPk(prodId)
    .then(product=>{
      // magic method added by sequelize addProduct();
      return fetchedCart.addProduct(product, { through: {quantity: newQuantity} });
    })
    .catch();
     
  })
  .catch(err=> console.log(err));
}

exports.getOrders = (req, res, next) => {
  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Your Orders'
  });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
