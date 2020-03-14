
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

  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user
  });
  // save method is added by mongoose
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
  Product.findById(prodId)
    .then(product => {
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDescription;
      product.imageUrl = updatedImageUrl;
      return product.save();
    })
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
  //method provided by mongoose
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
    .find()
    // magic methods whatever
    // .select('title price -_id')
    // .populate('userId', 'name')
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
  //mongoose provided magic method
  Product.findByIdAndRemove(prodId)
    .then(() => {
      console.log("DELETED PRODUCT");
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log(err);
    });

}
