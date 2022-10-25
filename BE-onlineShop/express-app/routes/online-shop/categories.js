var express = require('express');
const { join } = require('lodash');
const { ObjectId } = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var router = express.Router();

// const MongoClient = require('mongodb').MongoClient
const url= "mongodb://127.0.0.1:27017/"
// const url= "mongodb://localhost:27017/"
// const dbName= "online-shop"
const COLLECTION_NAME= "categories"

const {
  insertDocument,insertDocuments,
  updateDocument, updateDocuments,
  findOne,findDocuments,
  deleteMany,deleteOneWithId,
  } = require("../../helpers/MongoDBOnlineShop");
const { validateSchema,
   insertOneCategorySchema, 
   updateOneCategorySchema, 
   updateManyCategorySchema,
   insertManyCategoriesSchema,
   search_deleteWithId,
   search_deleteManyCategoriesSchema,
   
  } = require('../../helpers//schemas/schemasCategoriesOnlineShop.yup');


// ///
// router.get('/', async (req, res) => {
//   try {
//     let query = {};
//     const results = await findDocuments(query, COLLECTION_NAME);
//     res.json({ ok: true, results });
//   } catch (error) {
//     res.status(500).json(error);
//   }
// });
// ///
//Get all categories
router.get('/', function(req, res, next) {
  findDocuments({query: {}}, COLLECTION_NAME)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({findFunction: "failed :v", err: err}))
})
//

// Find One Document Following ID   
// Need to improve validate ObjectId
// http://localhost:9000/categoriesOnlineShop/search/ how to response a message error
router.get('/search/:id', validateSchema(search_deleteWithId), function(req, res, next) {
  const {id}= req.params;
  const query ={_id: ObjectId(id)}
  findOne({query: query}, COLLECTION_NAME)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({findFunction: "failed", err: err}))
})
//

router.get('/search-many', validateSchema(search_deleteManyCategoriesSchema), function(req, res, next) {
  const query= req.query;
  findDocuments({query: query}, COLLECTION_NAME)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({findFunction: "failed", err: err}))
})
//

// Insert One -- ok validate
  router.post('/insert',validateSchema(insertOneCategorySchema), function (req, res, next){
    const data = req.body;
    insertDocument(data, COLLECTION_NAME)
    .then(result => {
      res.status(200).json({ok: true, result: result})
    })
    .catch(err =>{
      res.json(500).json({ok:false})
    })
   })
//

 //Insert Many  -- haven't validation yet
 router.post('/insert-many', validateSchema(insertManyCategoriesSchema), function (req, res, next){
  const list = req.body;
  insertDocuments(list, COLLECTION_NAME)
  .then(result => {
    res.status(200).json({ok: true, result: result})
  })
  .catch(err =>{
    res.json(500).json({ok:false})
  })
 })
//

 //Update One with _Id
 router.patch('/update-one/:id',validateSchema(updateOneCategorySchema), function(req, res, next){
  const {id} = req.params;
  const paramId = {_id : ObjectId(id)}
  const data = req.body
  updateDocument(paramId, data, COLLECTION_NAME)
    .then(result => {
      res.status(201).json({update: true, result: result})
    })
    .catch(err => res.json({update: false}))
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

//Delete ONE with ID
router.delete('/delete-id/:_id',validateSchema(search_deleteWithId), function(req, res, next) {
  const {_id}= req.params;

  deleteOneWithId({_id: ObjectId(_id)}, COLLECTION_NAME)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({deleteFunction: "failed", err: err}))
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
