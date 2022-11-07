"use strict";
var express = require("express");
var router = express.Router();
const passport = require("passport");

const { default: mongoose } = require("mongoose");
const User = require("../../model/User");

const multer = require("multer");
const fs = require("fs");

const {
  URL_APP_SERVER,
  PATH_FOLDER_PUBLIC,
  PATH_FOLDER_IMAGES,
  FOLDER_INITIATION,
  COLLECTION_USER
} = require("../../helpers/constants");

mongoose.connect(URL_APP_SERVER);
const { formatterErrorFunc } = require("../../helpers/formatterError");
const { loadCategory, validateId } = require("../../helpers/commonValidators");


const {
  insertDocument,
  insertDocuments,
  updateDocument,
  updateDocuments,
  findDocuments,
  deleteMany,
  deleteOneWithId,
} = require("../../helpers/MongoDBOnlineShop");
const {
  validateSchema,
  search_deleteWithId,
  search_deleteManyOrdersSchema,
  insertOneOrderSchema,
  insertManyOrdersSchema,
  updateOneOrderSchema,
  updateManyOrderSchema,
} = require("../../helpers/schemas/schemasOrdersOnlineShop.yup");
const Supplier = require("../../model/Supplier");

//Get all orders
router.get("/", async (req, res, next) => {
  try {
    const docs = await User.find();
    res.json(docs);
  } catch (err) {
    res.status(400).json({ error: { name: err.name, message: err.message } });
  }
});
//


// Insert One
// router.post('/insert', validateSchema(addSchema), function (req, res, next){
router.post("/insert", async (req, res, next) => {
  try {
    let data = req.body;
    //format date: YYYY-MM-DD => type of Date: string
    //Create a new blog post object
    const doc = new User(data);
    //Insert the new document in our MongoDB database
    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    const errMsg = formatterErrorFunc(err);
    res.status(400).json({ error: errMsg });
  }
});

//

// //Insert Many  -- haven't validation yet
// router.post(
//   "/insert-many",
//   validateSchema(insertManyOrdersSchema),
//   function (req, res, next) {
//     const listData = req.body;

//     //convert type of [createdDate, shippedDate] from STRING to DATE with formatting 'YYYY-MM-DD
//     listData.map((order) => {
//       order.shippedDate = new Date(
//         moment(order.shippedDate).utc().local().format("YYYY-MM-DD")
//       );
//       order.createdDate = new Date(moment().utc().local().format("YYYY-MM-DD"));
//     });

//     insertDocuments(listData, COLLECTION_NAME)
//       .then((result) => {
//         res.status(200).json({ ok: true, result: result });
//       })
//       .catch((err) => {
//         res.json(500).json({ ok: false });
//       });
//   }
// );
// //

// //Update One with _Id
// router.patch("/update-one/:id", async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const updateData = req.body;
//     //if updating [createdDate, shippedDate]
//     //convert type of [createdDate, shippedDate] from STRING to DATE with formatting 'YYYY-MM-DD
//     if (updateData.shippedDate) {
//       updateData.shippedDate = new Date(
//         moment(updateData.shippedDate).utc().local().format("YYYY-MM-DD")
//       );
//     }
//     if (updateData.createdDate) {
//       updateData.createdDate = new Date(
//         moment(updateData.createdDate).utc().local().format("YYYY-MM-DD")
//       );
//     }

//     const opts = { runValidators: true };

//     const order = await Supplier.findByIdAndUpdate(id, updateData, opts);
//     res.json(Supplier);
//   } catch (err) {
//     const errMsg = formatterErrorFunc(err);
//     res.status(400).json({ error: errMsg });
//   }
// });
// //


//------------------------------------------------------------------------------------------------

module.exports = router;
