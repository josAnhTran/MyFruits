"use strict"
var express = require('express');

const {default: mongoose, deleteModel} = require ('mongoose')
const Category = require('../../model/Category')
const { ObjectId } = require('mongodb');
var router = express.Router();

const multer = require('multer');
const fs = require('fs');
const {promisify} = require('util');

const unlinkAsync = promisify(fs.link);
// const upload = require('multer')();


mongoose.connect('mongodb://127.0.0.1:27017/online-shop')

const url= "mongodb://127.0.0.1:27017/"
// const url= "mongodb://localhost:27017/"
const COLLECTION_NAME= "categories"

const {
  insertDocument,insertDocuments,
  updateDocument, updateDocuments,
  findOne,findDocuments,
  deleteMany,deleteOneWithId, removeFieldById,
  } = require("../../helpers/MongoDBOnlineShop");
const { validateSchema,
   insertOneCategorySchema, 
   updateOneCategorySchema, 
   updateManyCategorySchema,
   insertManyCategoriesSchema,
   search_deleteWithId,
   search_deleteManyCategoriesSchema,
   
  } = require('../../helpers/schemas/schemasCategoriesOnlineShop.yup');
const { formatterErrorFunc } = require('../../helpers/formatterError');
// const { removeFile, removeSyncFile } = require('../../controller/controller');
const { result } = require('lodash');
const { ok } = require('assert');
// const { json } = require('express');
//
  const storage = multer.diskStorage({
    destination: function (req, file, cb){
      let subLocation = 'firstTimeCreate';
      if(req.params.id) {
           subLocation = req.params.id;
       }
      let PATH = `./public/images/categories/${subLocation}`;
      
      if(!fs.existsSync(PATH)){
          fs.mkdirSync(PATH);
        }
      cb(null, PATH);
    },
    filename: function(req, file, cb){
      let extArray= file.mimetype.split('/');
      let extension = extArray[extArray.length - 1];
      cb(null, file.fieldname + '-' + Date.now() + '.' + extension);
    }
  })

  const uploadImage = multer({ storage: storage}).single('file')
  // router.post('/api/photo', uploadImage, async (req, res) =>{
router.post('/uploadFile/:id', function (req, res, next) {
  
  uploadImage(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      res.status(500).json({ type: 'MulterError', err: err });
    } else if (err) {
      res.status(500).json({ type: 'UnknownError', err: err });
    } else {
      const categoryId = req.params.id;
      let imageUrl = '';
      if(req.file){
        imageUrl = `/images/categories/${categoryId}/${req.file.filename}`;
      }
      // MONGODB
      updateDocument({_id: ObjectId(categoryId)}, { imageUrl: imageUrl }, COLLECTION_NAME)
      .then(result => {
        res.status(201).json({update: true, result: result})
      })
      .catch(err => res.json({update: 'UnSuccessful when update image for the category'}))
    }
  });
});


//Get all categories
router.get('/', async(req, res, next) =>{
  try{
    const categories = await Category.find().sort({'_id': -1});
    res.json({ ok: true, result: categories });
  } catch(err) {
    res.status(400).json({ error: { name: err.name, message: err.message } })
  }
})
//

router.get('/search/:id', async (req, res, next) => {
  try{
    const {id} = req.params;
    const category = await Category.findById(id);
    //the same:  const category = await Category.findOne({ _id: id });
    res.json({ ok: true, result: category });
  }catch(err) {
    res.status(400).json({ error: { name: err.name, message: err.message } })
  }
})

//HAVEN'T USED YET
router.get('/search-many', validateSchema(search_deleteManyCategoriesSchema), function(req, res, next) {
  const query= req.query;
  findDocuments({query: query}, COLLECTION_NAME)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({findFunction: "failed", err: err}))
})
//

// Insert One WITH an Image
router.post('/insertWithImage', ( req, res, next) => {
  // router.post('/insert', async ( req, res, next) => {
  uploadImage(req, res, async function(err) {
      try{
        // await uploadImage(req, res, function(err) {
        if (err instanceof multer.MulterError) {
          res.status(500).json({ type: 'MulterError', err: err });
          return;
        } else if (err) {
          res.status(500).json({ type: 'UnknownError', err: err });
          return;
        } else {
          let subLocation = 'firstTimeCreate';
          const imageUrl = `/images/categories/${subLocation}/${req.file.filename}`;
          const newData = {...req.body, imageUrl};
          
          //Create a new blog post object
          const category = new Category(newData);
          //Insert the new category in our Mongodb database
          //  await category.save();
          await category.save();
            res.status(201).json({ok: true, result: category})
        }
      }catch(err) {
        const messageError = formatterErrorFunc(err, COLLECTION_NAME)
        res.status(400).json({error: messageError})
      }
  })
})
    //
    
// Insert One WITHOUT An Image
router.post('/insertWithoutImage', async ( req, res, next) => {
  try{
        //Create a new blog post object
        const category = new Category(req.body);
        //Insert the new category in our Mongodb database
      //  await category.save();
       await category.save();
      res.status(201).json({ok: true, result: category})
  } catch(err) {
    const messageError = formatterErrorFunc(err, COLLECTION_NAME)
    res.status(400).json({error: messageError})
  }
    })

//HAVEN'T USED YET
 //Insert Many  -- haven't validation yet
 router.post('/insert-many', validateSchema(insertManyCategoriesSchema), function (req, res, next){
  const list = req.body;
  insertDocuments(list, COLLECTION_NAME)
  .then(result => {
    res.status(201).json({ok: true, result})
  })
  .catch(err =>{
    res.json(500).json({ok:false})
  })
 })
//

 //Update One with _Id WITH image
 //Strategy:
 router.patch('/updateByIdWithImage/:id', (req, res, next) => {
  //Add the new updating image in to DiskStorage
  uploadImage(req, res, async function (err) {
    try{
      if (err instanceof multer.MulterError) {
        res.status(500).json({ type: 'MulterError', err: err });
      } 
      else if (err) {
        res.status(500).json({ type: 'UnknownError', err: err });
      } 
      else {
        console.log({status: true, message: 'Add the new updating image in to DiskStorage successfully'})
        // If add successful, then, check the former uploaded image existing in DiskStorage or not
        try{
          //Get the link of the former uploaded image
          const currentImageUrl = req.body.imageUrl;
          const currentDirectoryPath ='./public' + currentImageUrl

          const fileExist = fs.existsSync(currentDirectoryPath)

          const categoryId = req.params.id;

          const NewImageUrl = `/images/categories/${categoryId}/${req.file.filename}`;
          const newData = {...req.body};
          //change field imageUrl
          newData.imageUrl = NewImageUrl

          const opts= {runValidators: true}

          if(fileExist) {
            //If existing, removing the former uploaded image from DiskStorage  
            try{
              //delete file image Synchronously
              fs.unlinkSync(currentDirectoryPath);
              console.log({message: 'File Image is delete from DiskStorage '})

              // If removing the former uploaded image from DiskStorage successfully
              // then, update req.body and link of the new image into Mongodb  
              const category = await Category.findByIdAndUpdate(categoryId, newData, opts);
              console.log({ok: true, message: 'After deleting old file, update imageUrl and other data successfully', result: category})
              res.json({ok: true, message: 'Update imageUrl and other data successfully', result: category})
            }
            catch(err){
              res.status(500).json({ message: "Could not delete the file. " + err})
            }
          }
          else{
            //nếu không thì cập nhật imageUrl và một số thứ khác vào Mongodb
            const category = await Category.findByIdAndUpdate(categoryId, newData, opts);
            console.log({ok: true, message: 'Update imageUrl and other data successfully', result: category})
            res.json({ok: true, message: 'Update imageUrl and other data successfully', result: category})
          }
        } 
        catch( err) {
          res.status(500).json({ message: "Check the former uploaded image existing unsuccessfully ", err: err})
        }
      }
    }
    catch(err) {
      const messageError = formatterErrorFunc(err, COLLECTION_NAME)
      res.status(400).json({error: messageError})
    }
    })
})
 //Thêm ảnh mới vào DiskStorage, nếu thành công thì:
 //Kiểm tra xem ảnh cũ có tồn tại trong DiskStorage, nếu có thì phải xóa trước khi ghi đường dẫn hình ảnh mới được cập nhật vào Mongodb


//  router.patch('/updateByIdWithImage/:id', (req, res, next) => {
//   //Add the new updating image in to DiskStorage
//   uploadImage(req, res, function (err) {
//       if (err instanceof multer.MulterError) {
//         res.status(500).json({ type: 'MulterError', err: err });
//       } 
//       else if (err) {
//         res.status(500).json({ type: 'UnknownError', err: err });
//       } 
//       else {
//         console.log({status: true, message: 'Add the new updating image in to DiskStorage successfully'})
//         // If add successful, then, check the former uploaded image existing in DiskStorage or not
//         try{
//           //Get the link of the former uploaded image
//           const currentImageUrl = req.body.imageUrl;
//           const currentDirectoryPath ='./public' + currentImageUrl

//           const fileExist = fs.existsSync(currentDirectoryPath)

//           const categoryId = req.params.id;

//           const NewImageUrl = `/images/categories/${categoryId}/${req.file.filename}`;
//           const newData = {...req.body};
//           //change field imageUrl
//           newData.imageUrl = NewImageUrl

//           const opts= {runValidators: true}

//           if(fileExist) {
//             //If existing, removing the former uploaded image from DiskStorage  
//             try{
//               //delete file image Synchronously
//               fs.unlinkSync(currentDirectoryPath);
//               console.log({message: 'File Image is delete from DiskStorage '})

//               // If removing the former uploaded image from DiskStorage successfully
//               // then, update req.body and link of the new image into Mongodb  
//               //Mongoose
//               const updateFunction = async(newData, res, next) => {
//                 try{
//                   const category = await Category.findByIdAndUpdate(categoryId, newData, opts);
//                   res.json({ok: true, message: 'Update imageUrl and other data successfully', result: category})
//                 }
//                 catch(err) {
//                   const messageError = formatterErrorFunc(err, COLLECTION_NAME)
//                   res.status(400).json({error: messageError})
//                 }
//               }

//               // const category =  Category.findByIdAndUpdate(categoryId, newData, opts)
//               //                           .then(result => {
//               //                             res.status(201).json({update: true, message: 'Update imageUrl and other data successfully',result: result})
//               //                           })
//               //                           .catch(err =>{
//               //                             const messageError = formatterErrorFunc(err, COLLECTION_NAME)
//               //                             res.status(400).json({error: messageError})
//               //                           })
//             }
//             catch(err){
//               res.status(500).json({ message: "Could not delete the file. " + err})
//             }
//           }
//           else{
//             //nếu không thì cập nhật imageUrl và một số thứ khác vào Mongodb
//             const updateFunction = async(newData, res, next) => {
//               try{
//                 const category = await Category.findByIdAndUpdate(categoryId, newData, opts);
//                 res.json({ok: true, message: 'Update imageUrl and other data successfully', result: category})
//               }
//               catch(err) {
//                 const messageError = formatterErrorFunc(err, COLLECTION_NAME)
//                 res.status(400).json({error: messageError})
//               }
//             }
//             // const category =  Category.findByIdAndUpdate(categoryId, newData, opts)
//             //                           .then(result => {
//             //                             res.status(201).json({update: true, message: 'Update imageUrl and other data successfully',result: result})
//             //                           })
//             //                           .catch(err =>{
//             //                             const messageError = formatterErrorFunc(err, COLLECTION_NAME)
//             //                             res.status(400).json({error: messageError})
//             //                           })
//           }
//         } 
//         catch( err) {
//           res.status(500).json({ message: "Check the former uploaded image existing unsuccessfully ", err: err})
//         }
//       }
//     })
// })


//

 //Update One with _Id WITHOUT image
//  router.patch('/updateByIdWithoutImage/:id',upload.any() ,async(req, res, next) => {
  router.patch('/updateByIdWithoutImage/:id',async(req, res, next) => {
  try{ 
    const {id} = req.params;
    const updateData = req.body;
    const opts= {runValidators: true}
    const category = await Category.findByIdAndUpdate(id, updateData, opts);
    res.json({ok: true, result: category})
  }catch(err) {
    const messageError = formatterErrorFunc(err, COLLECTION_NAME)
    res.status(400).json({error: messageError})
  }
})
//


 //Update MANY 
 router.patch('/update-many',validateSchema(updateManyCategorySchema), function(req, res, next){
  const query = req.query;
  const newValues = req.body;
  updateDocuments(query, newValues, COLLECTION_NAME)
    .then(result => {
      res.status(201).json({update: true, result: result})
    })
    .catch(err => res.json({update: false}))
 })
//

//Delete file
router.delete('/delete-file/:id', async (req, res, next) => {
  // router.delete('/delete-file/:id',  (req, res, next) => {
  try{
    const {id} = req.params;
    const category = await Category.findById(id);
    console.log({status: true, message: 'we have got data of a category with id from req.params'})
    const directoryPath ='./public' +( category.imageUrl ? category.imageUrl: '');
    try{
      //delete file image Synchronously
      fs.unlinkSync(directoryPath);
      console.log({message: 'File Image is delete from DiskStorage '})

      //handling remove the field imageUrl after delete the picture of this id
      removeFieldById(ObjectId(id), {imageUrl: ''}, COLLECTION_NAME)
      .then(result => {
        res.status(201).json({removing : true, message: 'Remove field imageUrl successful', result: result})
      })
      .catch(err => res.json({update: false}))

    }catch(err){
      res.status(500).json({ message: "Could not delete the file. " + err})
    }
  }catch(err) {
    res.status(400).json({ error: { name: err.name, message: err.message } })
  }
})

//Delete ONE with ID
router.delete('/delete-id/:id', async(req, res, next) => {
  try{
    const {id} = req.params;

    const deleteCategory = await Category.findByIdAndDelete(id);
    res.status(200).json(deleteCategory)
  }catch(err) {
    res.status(400).json({error: {name: err.name, message: err.message}});
  }
})
//

//Delete MANY
router.delete('/delete-many',validateSchema(search_deleteManyCategoriesSchema), function(req, res, next) {
  const query= req.query;

  deleteMany(query, COLLECTION_NAME)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({deleteFunction: "failed", err: err}))
})


// Get categories with all products  --- task 18
router.get('/products', function (req, res) {
 const aggregate=[
    {
      $lookup: {
        from: 'products',
        let: { categoryId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$$categoryId', '$categoryId'] },
            },
          },
         { $project: {name:1, price:1, discount:1, stock:1}}
        ],
        as: 'products',
      },
    },
    {
      $match: {products: {$ne: []}} // Solution 1
      // $match: {products: { $exists: true,$ne: []}} // Solution 2
      // $match : {$exists: true, $not: {$size: 0}} // Solution 3
    },
    {
      $addFields: {
        totalStock: {$sum: "$products.stock"}
      }
    },
  ]
  findDocuments( {aggregate: aggregate}, COLLECTION_NAME)
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});
//

// TASK 30
//Show categories with totalPrice from products have sold in each Category
router.get("/totalPrice", function(req,res){
  const aggregate=[
    {
      $lookup: {
        from: 'products',
        let: { categoryId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$$categoryId', '$categoryId'] },
            },
          },
         { $project: {categoryId:0, description: 0, supplierId: 0, stock:0}}
        ],
        as: 'products',
      },
    },

    {
      $unwind: {
        path: "$products",
        preserveNullAndEmptyArrays: true
      }
    },

    {
      $lookup: {
        from: 'orders',
        let: { productId: '$products._id' },
        pipeline: [
          {  $unwind: "$orderDetails"},
          {
            $match: {
              $expr: {
                 "$and" : [
                  { $eq: ['$$productId', '$orderDetails.productId'] },
                  {$ne: ['$status', 'CANCELED'] }
              ]}
            },
          },
          {
            $addFields: {
               totalPriceOfOneOrder: {$sum: { $multiply: [ 
                            "$orderDetails.price", "$orderDetails.quantity",
                            {$divide : [{$subtract: [100, "$orderDetails.discount"]}, 100]}
                          ]}},}
          },
          {
            $project: {
              shippingAddress: 0, description:0, "orderDetails.productId":0,
              customerId:0, employeeId:0
            }
          }
        ],
        as: 'listOrders',
      },
    },
    {
      $addFields: {
        totalPriceOneProduct: {$sum: "$listOrders.totalPriceOfOneOrder"}
      }
    },
    {
      $group:{
        _id: "$_id",
        name: {$first: "$name"},
        description: {$first: "$description"},
        totalPriceProducts: {$sum: "$totalPriceOneProduct" }
    }
  }
  ]
  findDocuments({aggregate: aggregate}, COLLECTION_NAME)
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

//------------------------------------------------------------------------------------------------

module.exports = router;
