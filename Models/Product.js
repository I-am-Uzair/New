const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  userId : {
    type:Schema.Types.ObjectId,
    ref: "User",
    required:true
    
  }
});

module.exports = mongoose.model("Product", productSchema);

// const mongodb = require("mongodb");
// const getDb = require("../Utils/database").getDb;

// class Product {
//   constructor(title, price, description, imageUrl, id, userId) {
//     this.title = title;
//     this.price = price;
//     this.description = description;
//     this.imageUrl = imageUrl;
//     this._id = id ? new mongodb.ObjectId(id) : null;
//     this.userId = userId;
//   }
//   save() {
//     const db = getDb();
//     let dbOb;
//     if (this._id) {
//       //updata product
//       dbOb = db
//         .collection("products")
//         .updateOne({ _id: this._id }, { $set: this });
//     } else {
//       dbOb = db.collection("products").insertOne(this);
//     }
//     return dbOb
//       .then((result) => {
//         console.log(result);
//       })
//       .catch((err) => {
//         console.log(err, "Error while inserting a Product in to Data Base");
//       });
//   }
//   static fetchAll = () => {
//     const db = getDb();
//     return db
//       .collection("products")
//       .find()
//       .toArray()
//       .then((products) => {
//         return products;
//       })
//       .catch((err) => {
//         console.log(err, "Error while fetching all Products from Data Base");
//       });
//   };

//   static findById = (prodId) => {
//     const db = getDb();
//     return db
//       .collection("products")
//       .find({ _id: new mongodb.ObjectId(prodId) })
//       .next()
//       .then((product) => {
//         return product;
//       })
//       .catch((err) => {
//         console.log(
//           err,
//           "This is error is generated while fetching single product from the data base Product modal file"
//         );
//       });
//   };

//   static deleteById = (prodId) => {

//     const db = getDb();
//     return db
//       .collection("products")
//       .deleteOne({ _id: new mongodb.ObjectId(prodId) })
//       .then((result) => {
//         console.log("Product Deleted Successfully");
//       })
//       .catch((err) => {
//         console.log(err, "Error while Deleting Product from Data Base");
//       });
//   };
// }

// module.exports = Product;
