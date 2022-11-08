"use strict";
var express = require("express");
var router = express.Router();
const passport = require("passport");

const { default: mongoose } = require("mongoose");
const Employee = require("../../model/Employee");

const multer = require("multer");
const fs = require("fs");

const {
  URL_APP_SERVER,
  PATH_FOLDER_PUBLIC,
  PATH_FOLDER_IMAGES,
  FOLDER_INITIATION,
  COLLECTION_EMPLOYEES
} = require("../../helpers/constants");

mongoose.connect(URL_APP_SERVER);
const { formatterErrorFunc } = require("../../helpers/formatterError");
const { loadEmployee, validateId } = require("../../helpers/commonValidators");

var moment = require("moment");

const {
  insertDocument,
  insertDocuments,
  updateDocument,
  updateDocuments,
  findDocuments,
  deleteOneWithId,
  deleteMany,
} = require("../../helpers/MongoDBOnlineShop");
const {
  validateSchema,
  search_deleteWithId,
  search_deleteManyEmployeesSchema,
  insertOneEmployeeSchema,
  insertManyEmployeesSchema,
  updateOneEmployeeSchema,
  updateManyEmployeesSchema,
} = require("../../helpers/schemas/schemasEmployeesOnlineShop.yup");

//
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let lastLocation = FOLDER_INITIATION;
    if (req.params.id) {
      lastLocation = req.params.id;
    }
    // let PATH = `./public/images/categories/${subLocation}`;
    let PATH = `${PATH_FOLDER_PUBLIC}${PATH_FOLDER_IMAGES}/${COLLECTION_EMPLOYEES}/${lastLocation}`;
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

//Get all employees
router.get("/", async (req, res, next) => {
  try {
    const docs = await Employee.find().sort({_id: -1});
    res.json({ ok: true, results: docs });
  } catch (err) {
    const errMsgMongoDB = formatterErrorFunc(err, COLLECTION_EMPLOYEES);
    res.status(400).json({ ok: false, error: errMsgMongoDB });
  }
});
//

// Just update field: image file
router.patch("/updateOnlyImage/:id", loadEmployee, (req, res) => {
  // Func loadEmployee validate id; check existing the document with id in the collection
  uploadImg(req, res, async function (err) {
    const employeeId = req.params.id;
    let newImgUrl = null;
    try {
      if (err instanceof multer.MulterError) {
        res.status(500).json({ type: "MulterError", err: err });
        return;
      } else if (err) {
        res.status(500).json({ type: "UnknownError", err: err });
        return;
      } else {
        // if doesn't exist file in form-data then res... and return
        if (!req.file) {
          res.status(400).json({
            ok: false,
            error: {
              name: "file",
              message: `doesn't have any files in form-data from client`,
            },
          });
          return;
        }
        //else, continue
        const currentImgUrl = req.document.imageUrl;
        const currentDirPath = PATH_FOLDER_PUBLIC + currentImgUrl;
        const opts = { runValidators: true };
        newImgUrl = req.file.filename
          ? `${PATH_FOLDER_IMAGES}/${COLLECTION_EMPLOYEES}/${employeeId}/${req.file.filename}`
          : null;
        //Update in Mongodb
        const updatedDoc = await Employee.findByIdAndUpdate(
          employeeId,
          { imageUrl: newImgUrl },
          opts
        );
        //if currentImgUrl =null
        if (!currentImgUrl) {
          res.json({
            ok: true,
            more_detail: "Client have the new image",
            message: "Update imageUrl and other data successfully",
            result: updatedDoc,
          });
          return;
        }
        //else, then...
        try {
          if (fs.existsSync(currentDirPath)) {
            //If existing, removing the former uploaded image from DiskStorage
            try {
              //delete file image Synchronously
              fs.unlinkSync(currentDirPath);
              res.json({
                ok: true,
                message: "Update imageUrl and other data successfully",
                result: updatedDoc,
              });
            } catch (errRmvFile) {
              res.json({
                ok: true,
                warning: "The old uploaded file cannot delete",
                message: "Update imageUrl and other data successfully",
                result: updatedDoc,
              });
            }
          } else {
            res.json({
              ok: true,
              warning: "Not existing the old uploaded image in DiskStorage",
              message: "Update imageUrl and other data successfully",
              result: updatedDoc,
            });
          }
        } catch (errCheckFile) {
          res.json({
            ok: true,
            warning:
              "Check the former uploaded image existing unsuccessfully, can not delete it",
            message: "Update imageUrl and other data successfully.",
            errCheckFile,
            result: updatedDoc,
          });
        }
      }
    } catch (errMongoDB) {
      // Error when updating the updatedDoc in Mongodb, let check the exists of the new image in DiskStorage and remove it before res.status(400)...
      const errMsgMongoDB = formatterErrorFunc(errMongoDB, COLLECTION_EMPLOYEES);

      try {
        // const newDirPath = './public/' + imageUrl;
        const newDirPath = PATH_FOLDER_PUBLIC + imageUrl;
        if (fs.existsSync(newDirPath)) {
          try {
            fs.unlinkSync(newDirPath);
            res.status(400).json({
              ok: false,
              message:
                "add file into DiskStorage, but for error when updating the updatedDoc in Mongodb, so that remove successfully this file from DiskStorage",
              error: errMsgMongoDB,
            });
          } catch (errRmvFile) {
            res.status(500).json({
              ok: false,
              warning:
                "Can not delete the new file from DiskStorage when the system didn't update successfully in MongoDB",
              message: "error when update imageUrl in Mongodb ",
              errRmvFile,
              error: errMsgMongoDB,
            });
          }
        } else {
          // do nothing if the new image not exists in DiskStorage
          res.status(400).json({
            ok: false,
            warning:
              "we cannot find this new file in DiskStorage to delete it.",
            message: " error when update imageUrl in Mongodb.",
            error: errMsgMongoDB,
          });
        }
      } catch (errCheckFile) {
        res.status(400).json({
          ok: false,
          warning:
            "Be careful, Check the new uploaded image existing unsuccessfully to delete it.",
          message: " error when update imageUrl in Mongodb.",
          error: errMsgMongoDB,
        });
      }
    }
  });
});
//

// Insert One WITH an Image
// ok validation
router.post("/insertWithImage", (req, res, next) => {
  uploadImg(req, res, async function (err) {
    let imageUrl = null;
    try {
      // await uploadImg(req, res, function(err) {
      if (err instanceof multer.MulterError) {
        res.status(500).json({ type: "MulterError", err: err });
        return;
      } else if (err) {
        res.status(500).json({ type: "UnknownError", err: err });
        return;
      } else {
        // if doesn't exist file in form-data then res... and return
        if (!req.file) {
          res.status(400).json({
            ok: false,
            error: {
              name: "file",
              message: `doesn't have any files in form-data from client`,
            },
          });
          return;
        }
        //else, continue

        // const imageUrl = `/images/categories/initiation/${req.file.filename}`;
        imageUrl = `${PATH_FOLDER_IMAGES}/${COLLECTION_EMPLOYEES}/${FOLDER_INITIATION}/${req.file.filename}`;
        const newData = { ...req.body, imageUrl };
        delete newData.file
        console.log(newData.birthday)
        if (newData.birthday) {
          //format date: YYYY-MM-DD => type of Date: string
          newData.birthday = moment(newData.birthday).utc().local().format("YYYY-MM-DD");
          //convert type of date from String to Date
          newData.birthday = new Date(newData.birthday);
            }
        //Create a new blog post object
        const newDoc = new Employee(newData);
        //Insert the new Document in our Mongodb database
        await newDoc.save();
        res.status(201).json({ ok: true, result: newDoc });
      }
    } catch (errMongoDB) {
      // Error when adding new data to Mongodb, let check the exists of the new image in DiskStorage and remove it before res.status(400)...
      const errMsgMongoDB = formatterErrorFunc(errMongoDB, COLLECTION_EMPLOYEES);
      try {
        // const newDirPath = './public/' + imageUrl;
        const newDirPath = PATH_FOLDER_PUBLIC + imageUrl;
        if (fs.existsSync(newDirPath)) {
          try {
            fs.unlinkSync(newDirPath);
            res.status(400).json({
              ok: false,
              message:
                "add file into DiskStorage, but for error when adding newDocument in Mongodb, so that removing successfully this file from DiskStorage",
              error: errMsgMongoDB,
            });
          } catch (errRmvFile) {
            res.status(500).json({
              ok: false,
              warning:
                "the new image added into DiskStorage, but can not add successfully the newDocument in MongoDB, also can not delete this new file from DiskStorage",
              message:
                "Add new Document error, can not delete the  new file in DiskStorage. ",
              errRmvFile,
              error: errMsgMongoDB,
            });
          }
        } else {
          // do nothing if the new image not exists in DiskStorage
          res.status(400).json({
            ok: false,
            warning: "Cannot find this new file in DiskStorage",
            message: " error when adding the newDocument in Mongodb",
            error: errMsgMongoDB,
          });
        }
      } catch (errCheckFile) {
        res.status(400).json({
          ok: false,
          warning:
            "Be careful, Check the new uploaded image existing unsuccessfully to delete it",
          message: " error when adding the newDocument in Mongodb. ",
          errCheckFile,
          error: errMsgMongoDB,
        });
      }
    }
  });
});
//

// Insert One WITHOUT An Image
//--ok validation
router.post("/insertWithoutImage", async (req, res) => {
  try {
    const data = req.body;
        if (data.birthday) {
      //format date: YYYY-MM-DD => type of Date: string
      data.birthday = moment(data.birthday).utc().local().format("YYYY-MM-DD");
      //convert type of date from String to Date
      data.birthday = new Date(data.birthday);
        }
    //Create a new blog post object
    const newDoc = new Employee(data);
    //Insert the newDocument in our Mongodb database
    await newDoc.save();
    res.status(201).json({ ok: true, result: newDoc });
  } catch (errMongoDB) {
    const errMsgMongoDB = formatterErrorFunc(errMongoDB, COLLECTION_EMPLOYEES);
    res.status(400).json({ ok: false, error: errMsgMongoDB });
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
router.patch("/updateByIdWithImage/:id", loadEmployee, (req, res) => {
  const employeeId = req.params.id;
  let currentImgUrl = null;
  //--Add the new updating image in to DiskStorage
  uploadImg(req, res, async function (err) {
    //--Get the link of the former uploaded image, so that,
    //--we can use this link to remove the old uploaded file from DiskStorage after success to update new data in Mongodb
    try {
      if (err instanceof multer.MulterError) {
        res.status(500).json({ type: "MulterError", err: err });
      } else if (err) {
        res.status(500).json({ type: "UnknownError", err: err });
      } else {
        // if doesn't exist file in form-data then res... and return
        if (!req.file) {
          res.status(400).json({
            ok: false,
            error: {
              name: "file",
              message: `doesn't have any files in form-data from client`,
            },
          });
          return;
        }
        //
        //else, continue
        currentImgUrl = req.document.imageUrl;
        const currentDirPath = currentImgUrl
          ? PATH_FOLDER_PUBLIC + currentImgUrl
          : "";
        const newImgUrl = `${PATH_FOLDER_IMAGES}/${COLLECTION_EMPLOYEES}/${employeeId}/${req.file.filename}`;

        //-----If adding the new image into DiskStorage successful, then...
        // console.log({ok: true, message: 'Add the new updating image in to DiskStorage successfully'})

        const newData = { ...req.body };
        console.log({demo: newData})
        delete newData.file

        //--change field imageUrl
        newData.imageUrl = newImgUrl;
        const opts = { runValidators: true };
        const updatedDoc = await Employee.findByIdAndUpdate(
          employeeId,
          newData,
          opts
        );
        //--If update new data(containing the link of the new Image) in Mongodb successfully, then...
        // if: currentImgUrl = underfined or null
        if (!currentImgUrl) {
          res.json({
            ok: true,
            more_detail: "Client have the new image",
            message: "Update imageUrl and other data successfully",
            result: updatedDoc,
          });
          return;
        } else {
          try {
            if (fs.existsSync(currentDirPath)) {
              //--If existing, removing the former uploaded image from DiskStorage
              try {
                //--delete file image Synchronously
                fs.unlinkSync(currentDirPath);
                res.json({
                  ok: true,
                  message: "Update imageUrl and other data successfully",
                  result: updatedDoc,
                });
              } catch (errRmvFile) {
                res.json({
                  ok: true,
                  warning: "The old uploaded file cannot delete",
                  message: "Update imageUrl and other data successfully",
                  errRmvFile,
                  result: updatedDoc,
                });
              }
            } else {
              res.json({
                ok: true,
                warning: "Not existing the old uploaded image in DiskStorage",
                message: "Update imageUrl and other data successfully",
                result: updatedDoc,
              });
            }
          } catch (errCheckFile) {
            res.json({
              ok: true,
              warning:
                "Check existing of the former uploaded image for deleting unsuccessfully",
              message: "Update imageUrl and other data successfully",
              result: updatedDoc,
            });
          }
        }
      }
    } catch (errMongoDB) {
      // Error when updating new data to Mongodb, let check the exists of the new image in DiskStorage and remove it before res.status(400)...
      const errMsgMongoDB = formatterErrorFunc(errMongoDB, COLLECTION_EMPLOYEES);

      try {
        const newDirPath = PATH_FOLDER_PUBLIC + newImgUrl;
        if (fs.existsSync(newDirPath)) {
          try {
            fs.unlinkSync(newDirPath);
            res.status(400).json({
              ok: false,
              message:
                "the new image added into DiskStorage, after that, this file Image is deleted from DiskStorage, when something wrong at updating the updatedDoc in Mongodb ",
              result: errMsgMongoDB,
            });
          } catch (errRmvFile) {
            res.status(500).json({
              ok: false,
              warning:
                "the new image added into DiskStorage, but can not update successfully the the updatedDoc( containing the link of new image), also can not delete the new file from DiskStorage",
              message:
                "error when updating the updateDocument in Mongodb, also,can not delete the new file in DiskStorage. ",
              errRmvFile,
              result: errMsgMongoDB,
            });
          }
        } else {
          // do nothing if the new image not exists in DiskStorage
          res.status(400).json({
            ok: false,
            warning: "we cannot find this new file in DiskStorage to delete it",
            message: " error when updating the updateDocument in Mongodb",
            result: errMsgMongoDB,
          });
        }
      } catch (errCheckFile) {
        res.status(400).json({
          ok: false,
          warning:
            "Check the new uploaded image existing unsuccessfully to delete it",
          message: "error when updating the updateDocument in Mongodb",
          errCheckFile,
          result: errMsgMongoDB,
        });
      }
    }
  });
});
//

//--Update One with _Id WITHOUT image
router.patch("/updateByIdWithoutImage/:id", validateId , async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    const currentImgUrl = req.body.imageUrl;
    const { isChangeImgUrl } = req.body;
    //Delete key isChangeImage from data before update in MongoDB
    delete updateData.isChangeImgUrl;
    const opts = { runValidators: true };
    //--Because client don't want use image, means, field imageUrl = null
    //But, if the client not change image Upload, then keeping the old imageUrl
    if (isChangeImgUrl) updateData.imageUrl = null;
    //--Update in Mongodb
    const updatedDoc = await Employee.findByIdAndUpdate(id, updateData, opts);
    //--If currentImgUrl= null, means that the user haven't have image before, then: do nothing
    if (!currentImgUrl || !isChangeImgUrl) {
      res.json({
        ok: true,
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
              ok: true,
              message:
                "The old uploaded image is delete from DiskStorage, Update imageUrl and other data successfully",
              result: updatedDoc,
            });
          } catch (errRmvFile) {
            // console.error({ok: false, message: "Could not delete the old uploaded file. ", "detailed_error": err})
            res.json({
              ok: true,
              warning: "The old uploaded file cannot delete",
              message: 'Update (imageUrl="null") and other data successfully',
              errRmvFile,
              result: updatedDoc,
            });
          }
        } else {
          res.json({
            ok: true,
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
    const errMsgMongoDB = formatterErrorFunc(errMongoDB, COLLECTION_EMPLOYEES);
    res.status(400).json({ ok:true, error: errMsgMongoDB });
  }
});
//

//Delete ONE with ID
router.delete("/delete-id/:id", validateId, async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleteDoc = await Employee.findByIdAndDelete(id);
    //deleteDoc !== false, is mean, finding a document with the id in the collection
    if (!deleteDoc) {
      res.status(404).json({
        ok: true,
        error: {
          name: "id",
          message: `the document with following id doesn't exist in the collection ${COLLECTION_EMPLOYEES}`,
        },
      });
      return;
    }
    //
    //--Delete the folder containing image of the account
    try {
      const pathFolderImages =
        PATH_FOLDER_PUBLIC +
        PATH_FOLDER_IMAGES +
        "/" +
        COLLECTION_EMPLOYEES +
        "/" +
        id;
      if (fs.existsSync(pathFolderImages)) {
        //--If existing, removing this folder from DiskStorage
        try {
          fs.rmSync(pathFolderImages, { recursive: true, force: true });
          res.json({
            ok: true,
            message:
              "Delete the document in MongoDB and DiskStorage successfully",
          });
        } catch (err) {
          res.json({
            ok: true,
            warning:
              "Could not delete the folder containing image of the document.",
            message: "Delete the document with ID successfully, in MongoDB",
            err,
          });
        }
      } else {
        // console.log({ok: true, warning: 'Not existing the folder containing image for deleted document in DiskStorage', message: 'Delete the document with ID successfully, in MongoDB'})
        res.json({
          ok: true,
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
    const errMsgMongoDB = formatterErrorFunc(errMongoDB, COLLECTION_EMPLOYEES);
    res.status(400).json({
      ok: false,
      message: "Failed to delete the document with ID",
      err: errMsgMongoDB,
    });
  }
});
//






// router.get("/search/:id", async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const employee = await Employee.findById(id);
//     //the same:  const employee = await Employee.findOne({ _id: id });
//     res.json(employee);
//   } catch (err) {
//     res.status(400).json({ error: { name: err.name, message: err.message } });
//   }
// });
// //

// router.get(
//   "/search-many",
//   validateSchema(search_deleteManyEmployeesSchema),
//   function (req, res, next) {
//     const query = req.query;
//     findDocuments({ query: query }, COLLECTION_NAME)
//       .then((result) => res.status(200).json(result))
//       .catch((err) =>
//         res.status(500).json({ findFunction: "failed", err: err })
//       );
//   }
// );
// //

// // Insert One
// router.post("/insert", async (req, res, next) => {
//   try {
//     const data = req.body;
//     if (data.birthday) {
//       //format date: YYYY-MM-DD => type of Date: string
//       data.birthday = moment(data.birthday).utc().local().format("YYYY-MM-DD");
//       //convert type of date from String to Date
//       data.birthday = new Date(data.birthday);
//     }
//     //Create a new blog post object
//     const employee = new Employee(data);
//     //Insert the product in our MongoDB database
//     await employee.save();
//     res.status(201).json(employee);
//   } catch (err) {
//     const errMsg = formatterErrorFunc(err);
//     res.status(400).json({ error: errMsg });
//   }
// });

// //Update One with _Id
// router.patch("/update-one/:id", async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const updateData = req.body;

//     if (updateData.birthday) {
//       //format date: YYYY-MM-DD => type of Date: string
//       updateData.birthday = moment(updateData.birthday)
//         .utc()
//         .local()
//         .format("YYYY-MM-DD");
//       //convert type of date from String to Date
//       updateData.birthday = new Date(updateData.birthday);
//     }

//     const opts = { runValidators: true };

//     const employee = await Employee.findByIdAndUpdate(id, updateData, opts);
//     res.json(employee);
//   } catch (err) {
//     const errMsg = formatterErrorFunc(err);
//     res.status(400).json({ error: errMsg });
//   }
// });
// //

// //Update MANY
// router.patch(
//   "/update-many",
//   validateSchema(updateManyEmployeesSchema),
//   function (req, res, next) {
//     const query = req.query;
//     const newValues = req.body;

//     if (newValues.birthday) {
//       //format date: YYYY-MM-Đ => type of Date: string
//       newValues.birthday = moment(newValues.birthday)
//         .utc()
//         .local()
//         .format("YYYY-MM-DD");
//       //converting type of date from String to Date
//       newValues.birthday = new Date(newValues.birthday);
//     }

//     updateDocuments(query, newValues, COLLECTION_NAME)
//       .then((result) => {
//         res.status(201).json({ update: true, result: result });
//       })
//       .catch((err) => res.json({ update: false }));
//   }
// );
// //

// router.delete("/delete-id/:id", async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     const deleteEmployee = await Employee.findByIdAndDelete(id);
//     res.status(200).json(deleteEmployee);
//   } catch (err) {
//     res.status(400).json({ error: { name: err.name, message: err.message } });
//   }
// });
// //

// //Delete MANY
// router.delete(
//   "/delete-many",
//   validateSchema(search_deleteManyEmployeesSchema),
//   function (req, res, next) {
//     const query = req.query;

//     deleteMany(query, COLLECTION_NAME)
//       .then((result) => res.status(200).json(result))
//       .catch((err) =>
//         res.status(500).json({ deleteFunction: "failed", err: err })
//       );
//   }
// );

// //TASK 24
// //Get all employees with total Price they have sold
// router.get("/revenue", function (req, res, next) {
//   const aggregate = [
//     {
//       $lookup: {
//         from: "orders",
//         let: { employeeId: "$_id" },
//         pipeline: [
//           { $unwind: "$orderDetails" },
//           {
//             $match: {
//               $expr: {
//                 $and: [
//                   { $eq: ["$employeeId", "$$employeeId"] },
//                   { $ne: ["$status", "CANCELED"] },
//                 ],
//               },
//             },
//           },
//           //Solution 01
//           // { $group: {
//           //   _id: "$employeeId", //to show totalPrice or all Orders that this employee sold
//           //  ordersId: {$push: "$_id"},
//           //   totalPrice: {$sum: { $multiply: [
//           //     "$orderDetails.price", "$orderDetails.quantity",
//           //     {$divide : [{$subtract: [100, "$orderDetails.discount"]}, 100]}
//           //   ]}},
//           // }
//           // },
//           //
//           //Solution 02
//           {
//             $group: {
//               _id: "$_id", //to show totalPrice or all Orders that this employee sold
//               productsId: { $push: "$orderDetails.productId" },
//               totalPriceEachOrder: {
//                 $sum: {
//                   $multiply: [
//                     "$orderDetails.price",
//                     "$orderDetails.quantity",
//                     {
//                       $divide: [
//                         { $subtract: [100, "$orderDetails.discount"] },
//                         100,
//                       ],
//                     },
//                   ],
//                 },
//               },
//             },
//           },
//         ],
//         as: "orders",
//       },
//     },
//     {
//       $addFields: {
//         totalPriceAll: { $sum: "$orders.totalPriceEachOrder" },
//       },
//     },
//     //
//   ];
//   findDocuments({ aggregate: aggregate }, COLLECTION_NAME)
//     .then((result) => res.status(200).json(result))
//     .catch((err) =>
//       res.status(500).json({ findFunction: "failed :v", err: err })
//     );
// });
// //

// //TASK 27
// //Get top 3 employees with total Price they have sold from date1 to date2
// router.get("/revenueTop3", function (req, res, next) {
//   const { dateFrom, dateTo } = req.query;
//   //convert date from string to date with the LocalZone of VietNam with format YYYY-MM-DD HH:MM:SS
//   // let start = moment(dateFrom).utc().local().format('YYYY-MM-DD HH:mm:ss')
//   // let end = moment(dateTo).utc().local().format('YYYY-MM-DD HH:mm:ss')

//   let start = new Date(moment(dateFrom).utc().local().format("YYYY-MM-DD"));
//   let end = new Date(moment(dateTo).utc().local().format("YYYY-MM-DD"));

//   const aggregate = [
//     {
//       $lookup: {
//         from: "orders",
//         let: { employeeId: "$_id" },
//         pipeline: [
//           { $unwind: "$orderDetails" },
//           {
//             $match: {
//               $expr: {
//                 $and: [
//                   { $eq: ["$employeeId", "$$employeeId"] },
//                   { $ne: ["$status", "CANCELED"] },
//                   { $gte: ["$createdDate", start] },
//                   { $lte: ["$createdDate", end] },
//                 ],
//               },
//             },
//           },

//           {
//             $group: {
//               _id: "$_id",
//               createdDate: { $first: "$createdDate" },
//               productsId: { $push: "$orderDetails.productId" },
//               totalPriceEachOrder: {
//                 $sum: {
//                   $multiply: [
//                     "$orderDetails.price",
//                     "$orderDetails.quantity",
//                     {
//                       $divide: [
//                         { $subtract: [100, "$orderDetails.discount"] },
//                         100,
//                       ],
//                     },
//                   ],
//                 },
//               },
//             },
//           },
//         ],
//         as: "orders",
//       },
//     },
//     {
//       $match: {
//         orders: { $ne: [] },
//       },
//     },
//     {
//       $addFields: {
//         totalPriceAll: { $sum: "$orders.totalPriceEachOrder" },
//       },
//     },
//     {
//       $sort: { totalPriceAll: -1 },
//     },
//     {
//       $limit: 3,
//     },
//     //
//   ];
//   findDocuments({ aggregate: aggregate }, COLLECTION_NAME)
//     .then((result) => res.status(200).json(result))
//     .catch((err) =>
//       res.status(500).json({ findFunction: "failed :v", err: err })
//     );
// });
// //

// //Get employees 14
// router.get("/search", function (req, res, next) {
//   const { key, value } = req.query;
//   const query = {};
//   switch (key) {
//     case "address":
//       query = { address: new RegExp(`${value}`, "i") };
//       break;
//     case "birthday":
//       query = {
//         $and: [
//           { birthday: { $exists: true } },
//           {
//             $expr: {
//               $eq: [{ $year: "$birthday" }, { $year: new Date() }],
//             },
//           },
//         ],
//       };

//       break;
//     case "birthday-today":
//       query = {
//         birthday: { $exists: true },
//         $expr: {
//           $and: [
//             {
//               $eq: [{ $dayOfMonth: "$birthday" }, { $dayOfMonth: new Date() }],
//             },
//             { $eq: [{ $month: "$birthday" }, { $month: new Date() }] },
//           ],
//         },
//       };

//       break;
//     default:
//       res
//         .status(404)
//         .json({
//           message: "Something wrong, please check your formatting request",
//         });
//       return;
//   }
//   findDocuments({ query: query }, COLLECTION_NAME)
//     .then((result) => res.status(200).json(result))
//     .catch((err) =>
//       res.status(500).json({ findFunction: "failed :v", err: err })
//     );
// });
// //

//------------------------------------------------------------------------------------------------

module.exports = router;
