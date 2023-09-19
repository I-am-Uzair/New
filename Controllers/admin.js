const Product = require("../Models/Product");
const { validationResult } = require("express-validator");

exports.getAddProduct = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }

  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    pageTitle: "Add Product",
    editting: false,
    hasError: false,
    errorMessage: null,
    validationError: [],
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  const price = req.body.price;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      pageTitle: "Add Product",
      editting: false,
      hasError: true,
      prod: {
        title: title,
        imageUrl: imageUrl,
        description: description,
        price: price,
      },
      errorMessage: errors.array()[0].msg,
      validationError: errors.array(),
    });
  }

  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user, // Mongoose Automatically pick the user id from req.user because it have the field with name id.
  });
  product
    .save() // This Save() and promises  provided by Mongoose. 
    .then((result) => {
      console.log("Product added");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log("Error in adding product", err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    res.redirect("/");
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return res.redirect("/"); // Instead of Redirecting it should show a error message to the admin.
      }
      res.render("admin/edit-product", {
        pageTitle: "Add Product",
        path: "/admin/edit-product",
        pageTitle: "Edit Product",
        editting: editMode,
        prod: product,
        hasError: false,
        errorMessage: null,
        validationError: [],
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDescription = req.body.description;
  const updatedPrice = req.body.price;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      pageTitle: "Add Product",
      editting: true,
      hasError: true,
      prod: {
        title: updatedTitle,
        imageUrl: updatedImageUrl,
        description: updatedDescription,
        price: updatedPrice,
        _id: prodId,
      },
      errorMessage: errors.array()[0].msg,
      validationError: errors.array(),
    });
  }
  Product.findById(prodId)
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDescription;
      product.imageUrl = updatedImageUrl;

      return product.save().then((result) => {
        console.log("PRODUCT UPDATED SUCESSFULLY");
        res.redirect("/admin/products");
      });
    })

    .catch((err) => {
      console.log(
        "This is Error is Generated in Updating product in DataBase In admin File",
        err
      );
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
exports.getAdminProducts = (req, res, next) => {
  Product.find({ userId: req.user._id }) // Mongoose Method.
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((err) => {
      console.log(
        " This  is Error is Generated in Fetching All Products ",
        err
      );
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.deleteOne({ _id: prodId, userId: req.user._id })
    .then(() => {
      res.status(200).json({message:"Product Deleted Successfully."})
    })
    .catch((err) => {
      console.log(
        "Error Occure while Deleting product from Data base in admin file", err
      );
      res.status(500).json({message:"Product Deletion faild!"})
    });
};
