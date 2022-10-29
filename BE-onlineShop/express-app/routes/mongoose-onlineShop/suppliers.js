"use strict";
var express = require("express");
var router = express.Router();
const { default: mongoose } = require("mongoose");
const Supplier = require("../../model/Supplier");

const multer = require("multer");
const fs = require("fs");


const {
  URL_APP_SERVER,
  PATH_FOLDER_PUBLIC,
  PATH_FOLDER_IMAGES,
  FOLDER_INITIATION,
} = require("../../functions/constants");

const COLLECTION_NAME = "suppliers";
mongoose.connect(URL_APP_SERVER);
const { formatterErrorFunc } = require("../../helpers/formatterError");
// const upload = require('multer')();
//  router.patch('/updateByIdWithoutImage/:id',upload.any() ,async(req, res, next) => {


const {
  insertDocument,
  insertDocuments,
  updateDocument,
  updateDocuments,
  findOne,
  findDocuments,
  deleteMany,
  deleteOneWithId,
} = require("../../helpers/MongoDBOnlineShop");
const {
  validateSchema,
  search_deleteWithId,
  search_deleteManySuppliersSchema,
  insertOneSupplierSchema,
  insertManySuppliersSchema,
  updateOneSupplierSchema,
  updateManySupplierSchema,
} = require("../../helpers/schemas/schemasSuppliersOnlineShop.yup");

//
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let lastLocation = FOLDER_INITIATION;
    if (req.params.id) {
      lastLocation = req.params.id;
    }
    // let PATH = `./public/images/products/${subLocation}`;
    let PATH = `${PATH_FOLDER_PUBLIC}${PATH_FOLDER_IMAGES}/${COLLECTION_NAME}/${lastLocation}`;
    if (!fs.existsSync(PATH)) {
      fs.mkdirSync(PATH);
    }
    cb(null, PATH);
  },
  filename: function (req, file, cb) {
    let extArray = file.mimetype.split("/");
    let extension = extArray[extArray.length - 1];
    cb(null, file.fieldname + "-" + Date.now() + "." + extension);
  },
});

const uploadImg = multer({ storage: storage }).single("file");

// Just update field: image file
router.post("/updateOnlyImage/:id", function (req, res, next) {
  uploadImg(req, res, async function (err) {
    const supplierId = req.params.id;
    let newImgUrl = null;
    try {
      if (err instanceof multer.MulterError) {
        res.status(500).json({ type: "MulterError", err: err });
      } else if (err) {
        res.status(500).json({ type: "UnknownError", err: err });
      } else {
        // console.log({ok: true, message: 'Add the new updating image in to DiskStorage successfully'})
        const currentImgUrl = req.body.imageUrl;
        // const currentDirPath = './public' + currentImgUrl;
        const currentDirPath = PATH_FOLDER_PUBLIC + currentImgUrl;
        const opts = { runValidators: true };
        // imageUrl = `/images/categories/${supplierId}/${req.file.filename}`;
        newImgUrl = `${PATH_FOLDER_IMAGES}/${COLLECTION_NAME}/${supplierId}/${req.file.filename}`;
        //Update in Mongodb
        const UpdatedDoc = await Category.findByIdAndUpdate(
          supplierId,
          { imageUrl: newImgUrl },
          opts
        );
        // console.log({ok: true, message: 'Successful when update image for the collection with supplierId in Mongodb'})
        if (currentImgUrl === "null") {
          // console.log({ok: true, "more_detail": 'Client have the new image' ,message: 'Update imageUrl and other data successfully', result: UpdatedDoc})
          res.json({
            okMongoDB: true,
            more_detail: "Client have the new image",
            message: "Update imageUrl and other data successfully",
            result: UpdatedDoc,
          });
        } else {
          try {
            if (fs.existsSync(currentDirPath)) {
              //If existing, removing the former uploaded image from DiskStorage
              try {
                //delete file image Synchronously
                fs.unlinkSync(currentDirPath);
                res.json({
                  okMongoDB: true,
                  message: "Update imageUrl and other data successfully",
                  UpdatedDoc,
                });
              } catch (errRmvFile) {
                res.json({
                  okMongoDB: true,
                  warning: "The old uploaded file cannot delete",
                  message: "Update imageUrl and other data successfully",
                  result: UpdatedDoc,
                });
              }
            } else {
              res.json({
                okMongoDB: true,
                warning: "Not existing the old uploaded image in DiskStorage",
                message: "Update imageUrl and other data successfully",
                result: UpdatedDoc,
              });
            }
          } catch (errCheckFile) {
            res.json({
              okMongo: true,
              warning:
                "Check the former uploaded image existing unsuccessfully, can not delete it",
              message:
                "Check the former uploaded image existing unsuccessfully ",
              errCheckFile,
            });
          }
        }
      }
    } catch (errMongoDB) {
      // Error when updating the UpdatedDoc in Mongodb, let check the exists of the new image in DiskStorage and remove it before res.status(400)...
      try {
        // const newDirPath = './public/' + imageUrl;
        const newDirPath = PATH_FOLDER_PUBLIC + imageUrl;
        if (fs.existsSync(newDirPath)) {
          try {
            fs.unlinkSync(newDirPath);
            res.status(400).json({
              okMongoDB: false,
              message:
                "add file into DiskStorage, but for error when updating the UpdatedDoc in Mongodb, so that remove successfully this file from DiskStorage",
              errMongoDB,
            });
          } catch (errRmvFile) {
            res.status(500).json({
              okMongoDB: false,
              warning:
                "the new image added into DiskStorage, but can not update successfully the UpdatedDoc in MongoDB, also can not delete the new file from DiskStorage",
              message: "Could not delete the new file in DiskStorage. ",
              errRmvFile,
              errMongoDB,
            });
          }
        } else {
          // do nothing if the new image not exists in DiskStorage
          res.status(400).json({
            okMongoDB: false,
            message:
              " error when update imageUrl in Mongodb, also, we cannot find this new file in DiskStorage",
            errMongoDB,
          });
        }
      } catch (errCheckFile) {
        res.status(400).json({
          okMongoDB: false,
          message:
            " error when update imageUrl in Mongodb. Be careful, Check the new uploaded image existing unsuccessfully to delete it",
          errMongoDB,
        });
      }
    }
  });
});
//

// Insert One WITH an Image
router.post("/insertWithImage", (req, res, next) => {
  uploadImg(req, res, async function (err) {
    try {
      // await uploadImg(req, res, function(err) {
      if (err instanceof multer.MulterError) {
        res.status(500).json({ type: "MulterError", err: err });
      } else if (err) {
        res.status(500).json({ type: "UnknownError", err: err });
      } else {
        // const imageUrl = `/images/suppliers/initiation/${req.file.filename}`;
        const imageUrl = `${PATH_FOLDER_IMAGES}/${COLLECTION_NAME}/${FOLDER_INITIATION}/${req.file.filename}`;
        const newData = { ...req.body, imageUrl };

        //Create a new blog post object
        const newDoc = new Supplier(newData);
        //Insert the new Document in our Mongodb database
        await newDoc.save();
        res.status(201).json({ okMongoDB: true, result: newDoc });
      }
    } catch (errMongoDB) {
      // Error when adding new data to Mongodb, let check the exists of the new image in DiskStorage and remove it before res.status(400)...
      const errMsgMongoDB = formatterErrorFunc(errMongoDB, COLLECTION_NAME);
      try {
        // const newDirPath = './public/' + imageUrl;
        const newDirPath = PATH_FOLDER_PUBLIC + imageUrl;
        if (fs.existsSync(newDirPath)) {
          try {
            fs.unlinkSync(newDirPath);
            res.status(400).json({
              okMongoDB: false,
              message:
                "add file into DiskStorage, but for error when adding newDocument in Mongodb, so that removing successfully this file from DiskStorage",
              errMsgMongoDB,
            });
          } catch (errRmvFile) {
            res.status(500).json({
              okMongoDB: false,
              warning:
                "the new image added into DiskStorage, but can not add successfully the newDocument in MongoDB, also can not delete this new file from DiskStorage",
              message:
                "Add new Document error, can not delete the  new file in DiskStorage. ",
              errRmvFile,
              errMsgMongoDB,
            });
          }
        } else {
          // do nothing if the new image not exists in DiskStorage
          res.status(400).json({
            okMongoDB: false,
            message:
              " error when adding the newDocument in Mongodb, also, we cannot find this new file in DiskStorage",
            errMsgMongoDB,
          });
        }
      } catch (errCheckFile) {
        res.status(400).json({
          okMongoDB: false,
          message:
            " error when adding the newDocument in Mongodb. Be careful, Check the new uploaded image existing unsuccessfully",
          errCheckFile,
          errMsgMongoDB,
        });
      }
    }
  });
});
//

// Insert One WITHOUT An Image
router.post("/insertWithoutImage", async (req, res, next) => {
  try {
    const data = req.body;
    //Create a new blog post object
    const newDoc = new Supplier(data);
    //Insert the newDocument in our Mongodb database
    await newDoc.save();
    res.status(201).json({ ok: true, result: newDoc });
  } catch (errMongoDB) {
    const errMsgMongoDB = formatterErrorFunc(errMongoDB, COLLECTION_NAME);
    res.status(400).json({ errMsgMongoDB });
  }
});
//

//--Update One with _Id WITH image
//--Strategy:
//--Thêm ảnh mới vào DiskStorage, nếu thành công thì:
//--Cập nhật dữ liệu mới( bao gồm link imageUrl của file ảnh mới) vào Mongodb,
///-- Cập nhật thành công thì kiểm tra xem ảnh cũ có tồn tại trong DiskStorage,
///-- Chú ý: nếu field imageUrl là null, nghĩa là trước đó không có ảnh nên ko cần kiểm tra tồn tại và xóa nữa
///-- nếu có thì phải xóa nó khỏiDiskStorage
//--Cập nhật dữ liệu vào Mongodb thất bại thì kiểm tra sự tồn tại của file ảnh mới trong DiskStorage và xóa ảnh trước khi res.status(400)...
router.patch("/updateByIdWithImage/:id", (req, res, next) => {
  //--Add the new updating image in to DiskStorage
  uploadImg(req, res, async function (err) {
    //--Get the link of the former uploaded image, so that,
    //--we can use this link to remove the old uploaded file from DiskStorage after success to update new data in Mongodb
    const currentImgUrl = req.body.imageUrl;
    const currentDirPath = PATH_FOLDER_PUBLIC + currentImgUrl;
    const supplierId = req.params.id;
    const newImgUrl = `${PATH_FOLDER_IMAGES}/${COLLECTION_NAME}/${supplierId}/${req.file.filename}`;
    try {
      if (err instanceof multer.MulterError) {
        res.status(500).json({ type: "MulterError", err: err });
      } else if (err) {
        res.status(500).json({ type: "UnknownError", err: err });
      } else {
        //-----If adding the new image into DiskStorage successful, then...
        // console.log({ok: true, message: 'Add the new updating image in to DiskStorage successfully'})

        const newData = { ...req.body };
        //--change field imageUrl
        newData.imageUrl = newImgUrl;
        const opts = { runValidators: true };
        const UpdatedDoc = await Supplier.findByIdAndUpdate(
          supplierId,
          newData,
          opts
        );
        //--If update new data(containing the link of the new Image) in Mongodb successfully, then...
        // console.log({ok: true, message: 'Update imageUrl and other data in Mongodb successfully ', result: UpdatedDoc})
        if (currentImgUrl === null || currentImgUrl === "null") {
          // console.log({ok: true, "more_detail": 'Client have the new image' ,message: 'Update imageUrl and other data successfully', result: UpdatedDoc})
          res.json({
            ok: true,
            more_detail: "Client have the new image",
            message: "Update imageUrl and other data successfully",
            result: UpdatedDoc,
          });
        } else {
          try {
            if (fs.existsSync(currentDirPath)) {
              //--If existing, removing the former uploaded image from DiskStorage
              try {
                //--delete file image Synchronously
                fs.unlinkSync(currentDirPath);
                res.json({
                  okMongoDB: true,
                  message: "Update imageUrl and other data successfully",
                  result: UpdatedDoc,
                });
              } catch (errRmvFile) {
                res.json({
                  okMongoDB: true,
                  warning: "The old uploaded file cannot delete",
                  message: "Update imageUrl and other data successfully",
                  errRmvFile,
                  result: UpdatedDoc,
                });
              }
            } else {
              res.json({
                okMongoDB: true,
                warning: "Not existing the old uploaded image in DiskStorage",
                message: "Update imageUrl and other data successfully",
                result: UpdatedDoc,
              });
            }
          } catch (errCheckFile) {
            res.json({
              okMongoDB: true,
              warning:
                "Check existing of the former uploaded image for deleting unsuccessfully",
              message: "Update imageUrl and other data successfully",
              result: UpdatedDoc,
            });
          }
        }
      }
    } catch (errMongoDB) {
      // Error when updating new data to Mongodb, let check the exists of the new image in DiskStorage and remove it before res.status(400)...
      const errMsgMongoDB = formatterErrorFunc(errMongoDB, COLLECTION_NAME);

      try {
        const newDirPath = PATH_FOLDER_PUBLIC + newImgUrl;
        if (fs.existsSync(newDirPath)) {
          try {
            fs.unlinkSync(newDirPath);
            res.status(400).json({
              okMongoDB: false,
              message:
                "the new image added into DiskStorage, after that, this file Image is deleted from DiskStorage, when something wrong at updating the UpdatedDoc in Mongodb ",
              errMsgMongoDB,
            });
          } catch (errRmvFile) {
            res.status(500).json({
              okMongoDB: false,
              warning:
                "the new image added into DiskStorage, but can not update successfully the the UpdatedDoc( containing the link of new image), also can not delete the new file from DiskStorage",
              message:
                "error when updating the updateDocument in Mongodb, also,can not delete the new file in DiskStorage. ",
              errRmvFile,
              errMongoDB,
            });
          }
        } else {
          // do nothing if the new image not exists in DiskStorage
          res.status(400).json({
            okMongoDB: false,
            message:
              " error when updating the updateDocument in Mongodb, also, we cannot find this new file in DiskStorage",
            errMongoDB,
          });
        }
      } catch (errCheckFile) {
        res.status(400).json({
          okMongoDB: false,
          message:
            "error when updating the updateDocument in Mongodb, also, check the new uploaded image existing unsuccessfully to delete it",
          errCheckFile,
          errMsgMongoDB,
        });
      }
    }
  });
});
//

//--Update One with _Id WITHOUT image
router.patch("/updateByIdWithoutImage/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    const currentImgUrl = req.body.imageUrl;
    const { isChangeImg } = req.body;
    //Delete key isChangeImage from data before update in MongoDB
    delete updateData.isChangeImg;
    const opts = { runValidators: true };
    //--Because client don't want use image, means, field imageUrl = null
    //But, if the client not change image Upload, then keeping the old imageUrl
    if (isChangeImg) updateData.imageUrl = null;
    //--Update in Mongodb
    const updatedDoc = await Supplier.findByIdAndUpdate(id, updateData, opts);
    //--If currentImgUrl= null, means that the user haven't have image before, then: do nothing
    if (currentImgUrl === null || currentImgUrl === "null" || !isChangeImg) {
      res.json({
        okMongoDB: true,
        message: "The client doesn't have an image before now",
        result: updatedDoc,
      });
    } else {
      //-- remove the old uploaded file from DiskStorage
      try {
        const currentDirPath = PATH_FOLDER_PUBLIC + currentImgUrl;
        if (fs.existsSync(currentDirPath)) {
          //--If existing, removing the former uploaded image from DiskStorage
          try {
            //--delete file image Synchronously
            fs.unlinkSync(currentDirPath);
            // console.log( {message: 'File Image is delete from DiskStorage, update processing succeeded '})
            res.json({
              okMongoDB: true,
              message:
                "The old uploaded image is delete from DiskStorage, Update imageUrl and other data successfully",
              result: updatedDoc,
            });
          } catch (errRmvFile) {
            // console.error({ok: false, message: "Could not delete the old uploaded file. ", "detailed_error": err})
            res.json({
              okMongoDB: true,
              warning: "The old uploaded file cannot delete",
              message: 'Update (imageUrl="null") and other data successfully',
              errRmvFile,
              result: updatedDoc,
            });
          }
        } else {
          res.json({
            okMongoDB: true,
            warning: "Not existing the old uploaded image in DiskStorage",
            message: "Update (imageUrl= null) and other data successfully",
            result: updatedDoc,
          });
        }
      } catch (errFileExisting) {
        res.json({
          ok: true,
          warning: "Check the former uploaded image existing unsuccessfully",
          message: "Update (imageUrl= null) and other data successfully",
          errFileExisting,
          result: updatedDoc,
        });
      }
    }
  } catch (errMongoDB) {
    const errMsgMongoDB = formatterErrorFunc(errMongoDB, COLLECTION_NAME);
    res.status(400).json({ errMsgMongoDB: errMsgMongoDB });
  }
});
//

//Delete ONE with ID
router.delete("/delete-id/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleteDoc = await Supplier.findByIdAndDelete(id);
    //--Delete the folder containing image of the account
    try {
      const pathFolderImages =
        PATH_FOLDER_PUBLIC +
        PATH_FOLDER_IMAGES +
        "/" +
        COLLECTION_NAME +
        "/" +
        id;
      if (fs.existsSync(pathFolderImages)) {
        //--If existing, removing this folder from DiskStorage
        try {
          fs.rmSync(pathFolderImages, { recursive: true, force: true });
          res.json({
            okMongoDB: true,
            message:
              "Delete the document in MongoDB and DiskStorage successfully",
          });
        } catch (err) {
          res.json({
            okMongoDB: true,
            warning:
              "Could not delete the folder containing image of the document.",
            message: "Delete the document with ID successfully, in MongoDB",
          });
        }
      } else {
        // console.log({ok: true, warning: 'Not existing the folder containing image for deleted document in DiskStorage', message: 'Delete the document with ID successfully, in MongoDB'})
        res.json({
          okMongoDB: true,
          warning:
            "Not existing the folder containing image for deleted document in DiskStorage",
          message: "Delete the document with ID successfully, in MongoDB",
        });
      }
    } catch (errCheckFile) {
      res.json({
        ok: false,
        warning:
          "Check the existence of the folder containing image of the document unsuccessfully, can not delete it",
        message: "Delete the document with ID successfully, in MongoDB",
        errCheckFile,
      });
    }
  } catch (errMongoDB) {
    res.status(400).json({
      errMsgMongoDB: { name: errMongoDB.name, message: errMongoDB.message },
      message: "Failed to delete the document with ID",
    });
  }
});
//





//Get all suppliers
router.get("/", async (req, res, next) => {
  try {
    const suppliers = await Supplier.find().sort({ _id: -1 });
    res.json({ ok: true, result: suppliers });
  } catch (err) {
    res.status(400).json({ errMsgMongoDB: { name: err.name, message: err.message } });
  }
});
//

router.get("/search/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findById(id);
    //the same:  const supplier = await Supplier.findOne({ _id: id });
    res.json({ ok: true, result: supplier });
  } catch (err) {
    res.status(400).json({ error: { name: err.name, message: err.message } });
  }
});
//

router.get(
  "/search-many",
  validateSchema(search_deleteManySuppliersSchema),
  function (req, res, next) {
    const query = req.query;
    findDocuments({ query: query }, COLLECTION_NAME)
      .then((result) => res.status(200).json(result))
      .catch((err) =>
        res.status(500).json({ findFunction: "failed", err: err })
      );
  }
);
//
// Insert One
router.post("/insert", async (req, res, next) => {
  try {
    const data = req.body;
    //Create a new blog post object
    const supplier = new Supplier(data);
    //Insert the product in our MongoDB database
    await supplier.save();
    res.status(201).json({ ok: true, result: supplier });
  } catch (err) {
    const errMsg = formatterErrorFunc(err, COLLECTION_NAME);
    res.status(400).json({ error: errMsg });
  }
});

//Insert Many  -- haven't validation yet
router.post(
  "/insert-many",
  validateSchema(insertManySuppliersSchema),
  function (req, res, next) {
    const list = req.body;
    insertDocuments(list, COLLECTION_NAME)
      .then((result) => {
        res.status(200).json({ ok: true, result: result });
      })
      .catch((err) => {
        res.json(500).json({ ok: false });
      });
  }
);
//

//Update One with _Id WITHOUT image
router.patch("/updateWithoutImage/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    console.log({ showmeee: updateData });
    const opts = { runValidators: true };

    const supplier = await Supplier.findByIdAndUpdate(id, updateData, opts);
    res.json({ ok: true, result: supplier });
  } catch (err) {
    const errMsg = formatterErrorFunc(err, COLLECTION_NAME);
    res.status(400).json({ error: errMsg });
  }
});
//

//Update MANY
router.patch(
  "/update-many",
  validateSchema(updateManySupplierSchema),
  function (req, res, next) {
    const query = req.query;
    const newValues = req.body;
    updateDocuments(query, newValues, COLLECTION_NAME)
      .then((result) => {
        res.status(201).json({ update: true, result: result });
      })
      .catch((err) => res.json({ update: false }));
  }
);
//

//Delete ONE with ID
router.delete("/delete-id/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleteSupplier = await Supplier.findByIdAndDelete(id);
    res.status(200).json(deleteSupplier);
  } catch (err) {
    res.status(400).json({ error: { name: err.name, message: err.message } });
  }
});
//

//Delete MANY
router.delete(
  "/delete-many",
  validateSchema(search_deleteManySuppliersSchema),
  function (req, res, next) {
    const query = req.query;

    deleteMany(query, COLLECTION_NAME)
      .then((result) => res.status(200).json(result))
      .catch((err) =>
        res.status(500).json({ deleteFunction: "failed", err: err })
      );
  }
);

//TASK 26  --- not finished
//---get suppliers that not sale
router.get("/suppliersNotSale", function (req, res, next) {
  aggregate = [
    {
      $lookup: {
        from: "products",
        let: { supplierId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $ne: ["$productId", "$$productId"] },
                  // {$eq: ['$status', 'COMPLETED'] },
                ],
              },
            },
          },
        ],
        as: "products",
      },
    },
    {
      $match: { products },
    },
    // {
    //   $lookup: {
    //     from: "orders",
    //     let: {productId: "$_id"},
    //     pipeline: [
    //       {$unwind: "$orderDetails"},
    //       {$match: {
    //         $expr: {
    //           $and: [
    //             {$eq: ['$orderDetails.productId', '$$productId'] },
    //             {$eq: ['$status', 'COMPLETED'] },

    //           ]
    //         }
    //       }}
    //     ],
    //     as: "orders"
    //   }},
  ];
  findDocuments(
    query,
    COLLECTION_NAME,
    aggregate,
    sort,
    limit,
    skip,
    projection
  )
    .then((result) => res.status(200).json(result))
    .catch((err) =>
      res.status(500).json({ findFunction: "failed :v", err: err })
    );
});
//
//

// Get suppliers --- task 15
router.get("/search", function (req, res, next) {
  let { key, values } = req.query;
  // change "," into "|" and remove spaces in string values for Regular Expression
  values = values.replaceAll(",", "|");
  values = values.replaceAll(" ", "");
  let query = {};
  switch (key) {
    case "name":
      query = { name: new RegExp(`${values}`, "gi") };
      break;
    default:
  }
  findDocuments({ query: query }, COLLECTION_NAME)
    .then((result) => {
      if (result.length === 0) {
        res.status(404).json({ message: "Not Found" });
      } else {
        res.status(200).json(result);
      }
    })
    .catch((err) =>
      res.status(500).json({ findFunction: "failed :v", err: err })
    );
});
//

// Get suppliers with all products  --- task 19
router.get("/products", function (req, res) {
  aggregate = [
    {
      $lookup: {
        from: "products",
        let: { supplierId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$$supplierId", "$supplierId"] },
            },
          },
        ],
        as: "products",
      },
    },
    {
      $addFields: {
        totalSupply: { $sum: "$products.stock" },
      },
    },
  ];
  findDocuments({ aggregate: aggregate }, COLLECTION_NAME)
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

//Listing suppliers that have product sold
router.get("/suppliersNotSold", function (req, res) {
  const { dateFrom, dateTo } = req.query;

  let start = new Date(moment(dateFrom).utc().local().format("YYYY-MM-DD"));
  let end = new Date(moment(dateTo).utc().local().format("YYYY-MM-DD"));

  const aggregate = [
    {
      $lookup: {
        from: "products",
        let: { supplierId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$supplierId", "$$supplierId"] }],
              },
            },
          },
        ],
        as: "products",
      },
    },
    {
      $unwind: {
        path: "$products",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "orders",
        let: { productId: "$products._id" },
        pipeline: [
          {
            $unwind: {
              path: "$orderDetails",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$$productId", "$orderDetails.productId"] },
                  { $ne: ["$status", "CANCELED"] },
                  // {$gte: ['$createdDate', start]},
                  // {$lte: ['$createdDate', end]}
                ],
              },
            },
          },
        ],
        as: "orders",
      },
    },
    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        isProduct: { $push: "$products._id" },
        isOrder: { $push: "$orders._id" },
      },
    },
    {
      $match: {
        $or: [{ isProduct: { $eq: [] } }, { isOrder: { $eq: [] } }],
      },
    },
  ];

  findDocuments({ aggregate: aggregate }, COLLECTION_NAME)
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

//------------------------------------------------------------------------------------------------

module.exports = router;
