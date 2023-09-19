const Product = require("../Models/Product");
const Order = require("../Models/Order");

const ITEMS_PER_PAGE = 2;

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;
  Product.find() // This method provide by mongoose.
    //.select("title price") //load the product data just with title and price field excluded other field.
    //.populate("userId") // Load the all the data (not just id) with related user .
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE); // This method provide by mongoose.
    })
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "Products",
        path: "/products",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPrevPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
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

exports.getSingleProduct = (req, res, next) => {
  let prodId = req.params.productId;
  Product.findById(prodId) // This Also Mongoose's method.
    .then((prod) => {
      res.render("shop/product-detail", {
        product: prod,
        pageTitle: prod.title,
        path: "/product",
      });
    })
    .catch((err) => {
      console.log("Error in Getting Single product");
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE); // This method provide by mongoose.
    })
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Home",
        path: "/",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPrevPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      console.log("Error while loading index page", err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items;
      res.render("shop/cart", {
        pageTitle: "MY-Cart",
        path: "/cart",
        products: products,
      });
    })
    .catch((err) => {
      console.log("Error while fetching the cart In Cart File", err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log("Error while adding Product to cart", err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeItemFromCart(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log(
        "Error while deleting product from Cart in shop. js file",
        err
      );
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckout = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items;
      let total = 0;
      products.forEach((p) => {
        total += p.quantity * p.productId.price;
      });
      res.render("shop/checkout", {
        pageTitle: "Checkout",
        path: "/checkout",
        products: products,
        totalSum: total,
      });
    })
    .catch((err) => {
      console.log("Error while fetching the Checkout", err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });

      const order = new Order({
        products: products,
        user: { name: req.user.name, userId: req.user },
      });
      return order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then((resul) => {
      res.redirect("/orders");
    })
    .catch((err) => {
      console.log("Error in Post Order Mehtod in shop.js file", err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then((loadedOrders) => {
      res.render("shop/orders", {
        pageTitle: "My Orders",
        path: "/orders",
        orders: loadedOrders,
      });
    })
    .catch((err) => {
      console.log("Error while All Fetching Order ", err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
