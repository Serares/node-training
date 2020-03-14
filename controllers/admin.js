
const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;

  const product = new Product(title, price, imageUrl, description, null , req.user._id);

  product.save()
    .then(result => {
      console.log("Created product");
      res.status(303).redirect('/admin/products');
    })
    .catch(err => {
      console.log(err);
    });

};

exports.postEditProduct = (req, res, next) => {

  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDescription = req.body.description;

  // need to create a mongodb ObjectID to updated the data
  const product = new Product(
    updatedTitle,
    updatedPrice,
    updatedImageUrl,
    updatedDescription,
    prodId);

  product.save()
    .then(data => {
      console.log("UPDATED PRODUCT");
      res.status(301).redirect('/admin/products');
    })
    .catch(err => { console.log(err) })
}

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }

  const prodId = req.params.id;
  Product.findById(prodId)
    .then(prod => {
      if (!prod) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: prod
      });
    })
    .catch(err => {
      console.log(err);
    })

};

exports.getProducts = (req, res, next) => {
  Product
    .fetchAll()
    .then(prods => {
      res.render('admin/products', {
        prods: prods,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.deleteById(prodId)
    .then(() => {
      console.log("DELETED PRODUCT");
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log(err);
    });

}
