"use strict"
var express = require('express');

const {default: mongoose, deleteModel} = require ('mongoose')
const Category = require('../../../model/Category')
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
  } = require("../../../helpers/MongoDBOnlineShop");
const { validateSchema,
   insertOneCategorySchema, 
   updateOneCategorySchema, 
   updateManyCategorySchema,
   insertManyCategoriesSchema,
   search_deleteWithId,
   search_deleteManyCategoriesSchema,
   
  } = require('../../../helpers/schemas/schemasCategoriesOnlineShop.yup');
const { formatterErrorFunc } = require('../../../helpers/formatterError');
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
//Thêm ảnh mới vào DiskStorage, nếu thành công thì:
//Cập nhật dữ liệu mới( bao gồm link imageUrl của file ảnh mới) vào Mongodb,
 /// Cập nhật thành công thì kiểm tra xem ảnh cũ có tồn tại trong DiskStorage,
 /// Chú ý: nếu field imageUrl là null, nghĩa là chưa từng có ảnh nên ko cần kiểm tra tồn tại và xóa nữa
 /// nếu có thì phải xóa trước khi ghi đường dẫn hình ảnh mới được cập nhật vào Mongodb
//Cập nhật dữ liệu thất bại thì kiểm tra sự tồn tại của file ảnh mới trong DiskStorage và xóa ảnh trước khi res.status(400)...
 router.patch('/updateByIdWithImage/:id', (req, res, next) => {
  //Add the new updating image in to DiskStorage
  uploadImage(req, res, async function (err) {
     //Get the link of the former uploaded image, so that,
     //we can use this link to remove the old uploaded file from DiskStorage after success to update new data in Mongodb
    const currentImageUrl = req.body.imageUrl;
    const currentDirectoryPath ='./public' + currentImageUrl
    const categoryId = req.params.id;
    const NewImageUrl = `/images/categories/${categoryId}/${req.file.filename}`;
    try{
      if (err instanceof multer.MulterError) {
        res.status(500).json({ type: 'MulterError', err: err });
      } 
      else if (err) {
        res.status(500).json({ type: 'UnknownError', err: err });
      } 
      else {
        // If adding the new image into DiskStorage successful, then...
        console.log({ok: true, message: 'Add the new updating image in to DiskStorage successfully'})
       
        const newData = {...req.body};
          //change field imageUrl
        newData.imageUrl = NewImageUrl
        const opts= {runValidators: true}
        const category = await Category.findByIdAndUpdate(categoryId, newData, opts);
        //If update new data(containing the link of the new Image) in Mongodb successfully, then...
        console.log({ok: true, message: 'Update imageUrl and other data in Mongodb successfully ', result: category})
        if(currentImageUrl === 'null'){
          console.log({ok: true, "more_detail": 'Client have the new image' ,message: 'Update imageUrl and other data successfully', result: category})
          res.json({ok: true, "more_detail": 'Client have the new image' ,message: 'Update imageUrl and other data successfully', result: category})
        }
        else{
          try{
            if(fs.existsSync(currentDirectoryPath)) {
              //If existing, removing the former uploaded image from DiskStorage  
              try{
                //delete file image Synchronously
                fs.unlinkSync(currentDirectoryPath);
                console.log({message: 'File Image is delete from DiskStorage, update processing successed '})
                res.json({ok: true, message: 'Update imageUrl and other data successfully', result: category})
              }
              catch(err){
                console.error({ok: false, message: "Could not delete the old uploaded file. ", "detailed_error": err})
                res.json({ok: true,warning: 'The old uploaded file cannot delete', message: 'Update imageUrl and other data successfully', result: category})
              }
            }
            else{
              res.json({ok: true,warning: 'Not existing the old uploaded image in DiskStorage', message: 'Update imageUrl and other data successfully', result: category})

            }
          } 
          catch( err) {
          console.error({ok:false, message: "Check the former uploaded image existing unsuccessfully ", err: err})
          }
        }

      }
    }
    catch(err) {
      // Error when updating new data to Mongodb, let check the exists of the new image in DiskStorage and remove it before res.status(400)...
      try{
        const newDirectoryPath = './public/' + NewImageUrl;
        if(fs.existsSync(newDirectoryPath)){
          try{
            fs.unlinkSync(newDirectoryPath)
            console.log({ok: true, message: 'The new file Image is delete from DiskStorage, when something wrong at updating new data in Mongodb '})
          }
          catch(errRemove){
            res.status(500).json({ok: false, warning: "the new image added into DiskStorage, but can not update successfully the new data( containing the link of new image), also can not delete the new file from DiskStorage",message: "Could not delete the  new file in DiskStorage. ", "detailed_errRemove": errRemove, "detailed_errUpdateMongodb": err})
          }
        }
        else{
          // do nothing if the new image not exists in DiskStorage
        } 
      }
      catch(errCheckExisting){
         console.error({ok:false, message: "Check the new uploaded image existing unsuccessfully ", "detailed_error": errCheckExisting})
      }
      console.log({ok: false, message: 'Having errors when update new data(containing new imageUrl) in Mongodb', "detailed_error": err })
      const messageError = formatterErrorFunc(err, COLLECTION_NAME)
      res.status(400).json({ok: false, error: messageError})
    }
    })
})
//

 //Update One with _Id WITHOUT image
//  router.patch('/updateByIdWithoutImage/:id',upload.any() ,async(req, res, next) => {
  router.patch('/updateByIdWithoutImage/:id',async(req, res, next) => {
  try{ 
    const {id} = req.params;
    const updateData = {...req.body};
    const currentImageUrl = req.body.imageUrl
    const opts= {runValidators: true}
    //Because client don't want use image, means, field imageUrl = null, so that:
    updateData.imageUrl= null
    //Update in Mongodb
    const category = await Category.findByIdAndUpdate(id, updateData, opts);
    //If currentImageUrl= null, means that the user haven't have image before, then: do nothing
    if((currentImageUrl === null)|currentImageUrl === 'null'){
      console.log({ok: true, message: "The user doesn't have an image before now" , result: category})
      res.json({ok: true, result: category})
    }else{
      // remove the old uploaded file from DiskStorage
      try{
        const currentDirectoryPath = './public' + currentImageUrl;
        if(fs.existsSync(currentDirectoryPath)) {
          //If existing, removing the former uploaded image from DiskStorage  
          try{
            //delete file image Synchronously
            fs.unlinkSync(currentDirectoryPath);
            console.log({message: 'File Image is delete from DiskStorage, update processing succeeded '})
            res.json({ok: true, message: 'Update imageUrl and other data successfully', result: category})
          }
          catch(err){
            console.error({ok: false, message: "Could not delete the old uploaded file. ", "detailed_error": err})
            res.json({ok: true,warning: 'The old uploaded file cannot delete', message: 'Update (imageUrl="null") and other data successfully', result: category})
          }
        }
        else{
          res.json({ok: true,warning: 'Not existing the old uploaded image in DiskStorage', message: 'Update (imageUrl="null") and other data successfully', result: category})

        }
      } 
      catch( err) {
      console.error({ok:false, message: "Check the former uploaded image existing unsuccessfully ", err: err})
      }
    }
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
