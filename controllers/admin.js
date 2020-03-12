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
  // some magic method by sequelize so there is no need to add the UserId to the product created
  req.user.createProduct({
    title: title,
    price: price,
    imageUrl: imageUrl,
    description: description
  })
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
  Product.findByPk(prodId)
  .then(product=>{
    product.title = updatedTitle;
    product.description = updatedDescription;
    product.price = updatedPrice;
    product.imageUrl = updatedImageUrl;
    // method from sequelize
    // returns a promise
    return product.save();
  })
  .then(data=>{
    console.log("UPDATED PRODUCT");
    res.status(301).redirect('/admin/products');
  })
  .catch(err=>{console.log(err)})
}

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  console.log(editMode);
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.id;
  // sequelize methods beeing used here
  req.user.getProducts({where:{id: prodId}})
  // Product.findByPk(prodId)
    .then(prod => {
      const product = prod[0];
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product
      });
    })
    .catch(err=>{
      console.log(err);
    })

};

exports.getProducts = (req, res, next) => {
  Product.findAll()
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
  Product.findByPk(prodId)
  .then(prod=>{
    return prod.destroy()
  })
  .then(result=>{
    console.log("DELETED PRODUCT");
    res.redirect('/admin/products');
  })
  .catch(err=>{
    console.log(err);
  });
  
}
