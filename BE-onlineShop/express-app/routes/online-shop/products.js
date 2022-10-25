const { json } = require('express');
var express = require('express');
var moment = require('moment')
const { join } = require('lodash');
const { ObjectId } = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var router = express.Router();

// const MongoClient = require('mongodb').MongoClient
const url= "mongodb://127.0.0.1:27017/"
// const url= "mongodb://localhost:27017/"
// const dbName= "online-shop"
const COLLECTION_NAME= "products"

const {
  insertDocument,insertDocuments,
  updateDocument, updateDocuments,
  findOne,findDocuments,
  deleteMany,deleteOneWithId,
  } = require("../../helpers/MongoDBOnlineShop");
const {
  validateSchema,
  search_deleteWithId,
  search_deleteManyProductsSchema,
  insertOneProductSchema,
  insertManyProductsSchema,
  updateOneProductSchema,
  updateManyProductSchema,
   } = require('../../helpers/schemas/schemasProductsOnlineShop.yup');

//Get all categories
router.get('/', function(req, res, next) {
  findDocuments({query: {}}, COLLECTION_NAME)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({findFunction: "failed :v", err: err}))
})
//
router.get('/search/:id', validateSchema(search_deleteWithId), function(req, res, next) {
  const {id}= req.params;
  findOne({ query: {_id: ObjectId(id)}}, COLLECTION_NAME)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({findFunction: "failed", err: err}))
})
//

router.get('/search-many', validateSchema(search_deleteManyProductsSchema), function(req, res, next) {
  const query= req.query;
  findDocuments({query: query}, COLLECTION_NAME)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({findFunction: "failed", err: err}))
})
//

// Insert One
// router.post('/insert', validateSchema(addSchema), function (req, res, next){
  router.post('/insert',validateSchema(insertOneProductSchema), function (req, res, next){
    const data = req.body;
  // Transforming the type of categoryId, supplierId from STRING to OBJECT_ID
      data.categoryId = ObjectId(data.categoryId)
      data.supplierId = ObjectId(data.supplierId)
  //   res.json(data);
  //   return;
    insertDocument(data, COLLECTION_NAME)
    .then(result => {
      res.status(200).json({ok: true, result: result})
    })
    .catch(err =>{
      res.json(500).json({ok:false})
    })
   })
  

 //Insert Many  -- haven't validation yet
 router.post('/insert-many', validateSchema(insertManyProductsSchema), function (req, res, next){
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
 router.patch('/update-one/:id',validateSchema(updateOneProductSchema), function(req, res, next){
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
 router.patch('/update-many',validateSchema(updateManyProductSchema), function(req, res, next){
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
router.delete('/delete-many',validateSchema(search_deleteManyProductsSchema), function(req, res, next) {
  const query= req.query;

  deleteMany(query, COLLECTION_NAME)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({deleteFunction: "failed", err: err}))
})


//TASK 29 -- Completed  // GET kind of discounts
  router.get('/discounts', function(req,res, next){
    const aggregate=[
      {$match: {}},
      {$group: {
        _id: "$discount",
        listProducts: {
          $push: {
            discount: "$discount",
            productId: "$_id",
            nameProduct: "$name",
            price: "$price",
            stock: "$stock",
            description: "$description"
        }}
      }}
    ]
    findDocuments({aggregate: aggregate}, COLLECTION_NAME)
      .then(result => res.status(200).json(result))
      .catch(err => res.status(500).json({findFunctionGetDiscounts: "failed", err: err}))
  })
//



//TASK 25
//---get products that not sale
router.get('/notSale', function(req, res, next) {
  const aggregate = [
    {
      $lookup: {
        from: "orders",
        let: {productId: "$_id"},
        pipeline: [
          {$unwind: "$orderDetails"},
          {$match: {
            $expr: {
              $and: [
                {$eq: ['$orderDetails.productId', '$$productId'] },
               {$ne: ['$status', 'CANCELED'] }
              ]
            }
          }}
        ],
        as: "orders"
      }
    },
    {$match: {
      orders: {$eq: []}
      }
    },
    // {
    //   $project: {orders: 0}
    // }
  ]
 
  findDocuments({aggregate: aggregate}, COLLECTION_NAME)
      .then(result => res.status(200).json(result))
      .catch(err => res.status(500).json({findFunction: "failed :v", err: err}))
  })
  //
//

//TASK 26-- NOT FINISH
//---get products that not sale
router.get('/supplierNotSale', function(req, res, next) {
    aggregate = [
      {
        $lookup: {
          from: "orders",
          let: {productId: "$_id"},
          pipeline: [
            {$unwind: "$orderDetails"},
            {$match: {
              $expr: {
                $and: [
                  {$eq: ['$orderDetails.productId', '$$productId'] },
                  {$or: [{$eq: ['$status', 'COMPLETED'] },{$eq: ['$status', 'WAITING'] },]}
                ]
              }
            }}
          ],
          as: "orders"
        }
      },
      {$match: {
        orders: {$eq: []}
        }
      },
      {
        $project: {orders: 0}
      }
    ]
   
    findDocuments(query, COLLECTION_NAME, aggregate, sort, limit, skip, projection)
        .then(result => res.status(200).json(result))
        .catch(err => res.status(500).json({findFunction: "failed :v", err: err}))
    })
//

//TASK 1; 2 ; 3 ; 
//Showing products that have discount <= ..... percent
router.get('/search', function(req, res, next) {
  let query = {}
  const {key,quantity} = req.query
  switch(key){
    case 'discount':
      query = {discount : {$lte: Number(quantity)}};
      break;
    case 'stock' :
      query = {stock : {$lte: Number(quantity)}};
      break;
      case 'ending-price' :
        let discountedPrice = { "$divide": [{"$multiply": [{"$subtract": [100, "$discount"]}, "$price"]}, 100 ] };
        query = { "$expr" : { "$lte" : [discountedPrice, parseInt(quantity)]}}
      break;
      default:
      res.status(500).json({findFunction: "failed :v", err: "Sorry! Bad request"})
      return;
  }
  findDocuments({query:query}, COLLECTION_NAME)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({findFunction: "failed :v", err: err}))
})
//


//TASK  17
//Showing products that have discount <= ..... percent
router.get('/more-detail', function(req, res, next) {
      // projection={categoryId:0, supplierId: 0}

    const   aggregate = [
        {
          $lookup: {
            from: 'categories', // foreign collection name
            localField: 'categoryId',
            foreignField: '_id',
            as: 'categoryDetail', // alias
          },
        },
        {
          $lookup: {
            from: 'suppliers', // foreign collection name
            localField: 'supplierId',
            foreignField: '_id',
            as: 'supplierDetail', // alias
          },
        },
        {$project: {categoryId:0, supplierId: 0}}
      ];

  findDocuments({aggregate : aggregate}, COLLECTION_NAME)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({findFunction: "failed :v", err: err}))
})
//

//TASK 20
//Get products sold from date1 to date2
router.get('/sold', function(req, res, next) {
  const {dateFrom, dateTo} = req.query
  let start = new Date(moment(dateFrom).utc().local().format('YYYY-MM-DD'))
  let end = new Date(moment(dateTo).utc().local().format('YYYY-MM-DD'))


 const aggregate=[
    {
      $lookup: {
        from: 'orders',
        let: { productId: '$_id' },
        pipeline: [
          {
            $unwind: "$orderDetails",
          },
          {
            $match: { 
              $expr: { 
                "$and": [ 
                { $eq: ["$orderDetails.productId", "$$productId"]} ,
                {$ne: ['$status', 'CANCELED'] },
                { "$lte": [ start, "$createdDate" ] },
                { "$gte": [ end, "$createdDate" ] },
                ]
             },
            },
          },
          { $project: { _id: 0 } }
        ],
        as: 'orders',
      },
    },
    {
      $match: {orders : {$ne: []}}
    }
  ]

  findDocuments({aggregate: aggregate}, COLLECTION_NAME)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({findFunction: "failed :v", err: err}))
})
//

//------------------------------------------------------------------------------------------------

module.exports = router;