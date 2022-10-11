const { json } = require('express');
var moment = require('moment')
var express = require('express');
const { join } = require('lodash');
const { ObjectId } = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var router = express.Router();

// const MongoClient = require('mongodb').MongoClient
const url= "mongodb://127.0.0.1:27017/"
// const url= "mongodb://localhost:27017/"
// const dbName= "online-shop"
const COLLECTION_NAME= "orders"


const {
  insertDocument,insertDocuments,
  updateDocument, updateDocuments,
  findOne,
  deleteMany,
  deleteOneWithId,
  findDocuments
  
  } = require("../../helpers/MongoDBOnlineShop");
const { validateSchema,
        search_deleteWithId,
        search_deleteManyOrdersSchema,
        insertOneOrderSchema,
        insertManyOrdersSchema,
        updateOneOrderSchema,
        updateManyOrderSchema,
} = require('../../helpers/schemasOrdersOnlineShop.yup');

//Get all products
router.get('/', function(req, res, next) {
  findDocuments({query: {}}, COLLECTION_NAME)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({findFunction: "failed :v", err: err}))
})
//

router.get('/search/:id', validateSchema(search_deleteWithId), function(req, res, next) {
  const {id}= req.params;
  const query = {_id: ObjectId(id)}
  findOne({ query: query}, COLLECTION_NAME)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({findFunction: "failed", err: err}))
})
//

router.get('/search-many', validateSchema(search_deleteManyOrdersSchema), function(req, res, next) {
  const query= req.query;
  findDocuments({query: query}, COLLECTION_NAME)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({findFunction: "failed", err: err}))
})
//

// Insert One
// router.post('/insert', validateSchema(addSchema), function (req, res, next){
  router.post('/insert',validateSchema(insertOneOrderSchema), function (req, res, next){
    let data = req.body;
      data.customerId = ObjectId(data.customerId)
      data.employeeId = ObjectId(data.employeeId)
      data.orderDetails[0].productId = ObjectId(data.orderDetails[0].productId)
      //format date: YYYY-MM-DD => type of Date: string
      data.shippedDate=  moment(data.shippedDate).utc().local().format('YYYY-MM-DD')
      let createdDate= moment(new Date()).utc().local().format('YYYY-MM-DD')
      //convert type of date from String to Date
      data.shippedDate= new Date(data.shippedDate)
      createdDate= new Date(createdDate)
      
      data = {createdDate, ...data}
     
  
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
 router.post('/insert-many', validateSchema(insertManyOrdersSchema), function (req, res, next){
  const listData = req.body;

 //convert type of [createdDate, shippedDate] from STRING to DATE with formatting 'YYYY-MM-DD
 listData.map(order => {
  
    order.shippedDate = new Date(moment(order.shippedDate).utc().local().format('YYYY-MM-DD'))
    order.createdDate = new Date(moment().utc().local().format('YYYY-MM-DD'))
  })

  insertDocuments(listData, COLLECTION_NAME)
  .then(result => {
    res.status(200).json({ok: true, result: result})
  })
  .catch(err =>{
    res.json(500).json({ok:false})
  })
 })
//

 //Update One with _Id
 router.patch('/update-one/:id',validateSchema(updateOneOrderSchema), function(req, res, next){
  const {id} = req.params;
  const paramId = {_id : ObjectId(id)}
  const newValues = req.body
  //if updating [createdDate, shippedDate]
 //convert type of [createdDate, shippedDate] from STRING to DATE with formatting 'YYYY-MM-DD
 if(newValues.shippedDate){
   newValues.shippedDate = new Date(moment(newValues.shippedDate).utc().local().format('YYYY-MM-DD'))
 }
 if(newValues.createdDate){
  newValues.createdDate = new Date(moment(newValues.createdDate).utc().local().format('YYYY-MM-DD'))
}



  updateDocument(paramId, newValues, COLLECTION_NAME)
    .then(result => {
      res.status(201).json({update: true, result: result})
    })
    .catch(err => res.json({update: false}))
 })
//

 //Update MANY 
 router.patch('/update-many',validateSchema(updateManyOrderSchema), function(req, res, next){
  const query = req.query;
  const newValues = req.body;
    //if updating [createdDate, shippedDate]
 //convert type of [createdDate, shippedDate] from STRING to DATE with formatting 'YYYY-MM-DD
 if(newValues.shippedDate){
  newValues.shippedDate = new Date(moment(newValues.shippedDate).utc().local().format('YYYY-MM-DD'))
}
if(newValues.createdDate){
 newValues.createdDate = new Date(moment(newValues.createdDate).utc().local().format('YYYY-MM-DD'))
}
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
router.delete('/delete-many',validateSchema(search_deleteManyOrdersSchema), function(req, res, next) {
  const query= req.query;

  deleteMany(query, COLLECTION_NAME)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({deleteFunction: "failed", err: err}))
})

// TASK 23----Get all products with totalPrice
// TASK 31----with totalPrice,Get all products that have shipped successfull- status:completed ; from date1 to date2
router.get('/totalPrice', function(req, res, next) {
  const {status,dateFrom, dateTo} = req.query
  //convert date from string to date with the LocalZone of VietNam with format YYYY-MM-DD HH:MM:SS
  // let start = moment(dateFrom).utc().local().format('YYYY-MM-DD HH:mm:ss')
  // let end = moment(dateTo).utc().local().format('YYYY-MM-DD HH:mm:ss')

  let tmp_query={ $expr: {
    $and: [{$eq: ['$status', 'COMPLETED'] }]
 }}
  //task 31:  shipping order completely
  if((status=== 'COMPLETED')&& dateFrom && dateTo){
    let start = new Date(moment(dateFrom).utc().local().format('YYYY-MM-DD'))
    let end = new Date(moment(dateTo).utc().local().format('YYYY-MM-DD'))
    tmp_query=  { $expr: {
                    $and: [
                    {$eq: ['$status', 'COMPLETED'] },
                    {$lte: [start, "$createdDate"]},
                    {$gte: [end,   "$createdDate"]},
                    ]
                  }};
  }
//

const aggregate = [
  {$unwind: "$orderDetails"},
  {
    $match: tmp_query
  },
  {
    $addFields: {
        "orderDetails.totalPrice": {$sum: { $multiply: [ 
          "$orderDetails.price", "$orderDetails.quantity",
          {$divide : [{$subtract: [100, "$orderDetails.discount"]}, 100]}
        ]}
      }
    }
  },
{
  $group: {
    "_id":  "$_id",
    "createdDate": {$first: "$createdDate"},
    "shippedDate": {$first: "$shippedDate"},
    "status": {$first: "$status"},
    "customerId": {$first: "$customerId"},
    "employeeId": {$first: "$employeeId"},
    "orderDetails" : {$push: {"productId" : "$orderDetails.productId",
                              "quantity" : "$orderDetails.quantity",
                              "discount" : "$orderDetails.discount",
                              "totalPrice" : "$orderDetails.totalPrice"
                    }},
    "totalPriceOrder": {$sum: {$sum: "$orderDetails.totalPrice"},
  }
}
}
]
findDocuments({aggregate:aggregate}, COLLECTION_NAME)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({findFunction: "failed :v", err: err}))
})
//

//TASK 32-- the order that have the largest price from date to date
router.get('/bestTotalPrice', function(req, res, next) {
  const {dateFrom, dateTo} = req.query
  //convert date from string to date with the LocalZone of VietNam with format YYYY-MM-DD HH:MM:SS
  // let start = moment(dateFrom).utc().local().format('YYYY-MM-DD HH:mm:ss')
  // let end = moment(dateTo).utc().local().format('YYYY-MM-DD HH:mm:ss')
  let tmpQuery={
    $expr: {
     $and: [
     {$ne: ['$status', 'CANCELED'] },
     ]
   }};

if(dateFrom && dateTo) {
  let start = new Date(moment(dateFrom).utc().local().format('YYYY-MM-DD'))
  let end = new Date(moment(dateTo).utc().local().format('YYYY-MM-DD'))

  tmpQuery= {
    $expr: {
     $and: [
     {$ne: ['$status', 'CANCELED'] },
     {$lte: [start, "$createdDate"]},
     {$gte: [end,   "$createdDate"]},
     ]
   }}}

const aggregate = [
  {$unwind: "$orderDetails"},
  {
    $match: tmpQuery
  },
  {
    $addFields: {
        "orderDetails.totalPrice": {$sum: { $multiply: [ 
          "$orderDetails.price", "$orderDetails.quantity",
          {$divide : [{$subtract: [100, "$orderDetails.discount"]}, 100]}
        ]}
      }
    }
  },
{
  $group: {
    "_id":  "$_id",
    "createdDate": {$first: "$createdDate"},
    "shippedDate": {$first: "$shippedDate"},
    "status": {$first: "$status"},
    "customerId": {$first: "$customerId"},
    "employeeId": {$first: "$employeeId"},
    "orderDetails" : {$push: {"productId" : "$orderDetails.productId",
                              "quantity" : "$orderDetails.quantity",
                              "discount" : "$orderDetails.discount",
                              "totalPrice" : "$orderDetails.totalPrice"
                    }},
    "totalPriceOrder": {$sum: {$sum: "$orderDetails.totalPrice"},
  }
}
},
{
  $sort: {totalPriceOrder: -1}
}
]
findDocuments({aggregate:aggregate}, COLLECTION_NAME)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({findFunction: "failed :v", err: err}))
})
//

//Showing orders with conditions
//----------------7;8;9;10;11;12;16
router.get('/search', function(req, res, next) {
  const {key,value, today} = req.query
  let query=null
  // Creates a regex of: /^value$/i
  let regexValue = new RegExp(["^", value , "$"].join(""), "i");
  //or new RegExp(`${value}`, "i")]
  let projection=null
  let aggregate=[]
  switch(key){
    case 'status':     
      query ={"status" :  regexValue};
      if(today=== "true") {
         const today = moment();
        query = {
          "$expr": { 
              "$and": [
                  { "$status" : regexValue},
                  //Solution 01
                  {
                    createdDate: new Date(today.format('YYYY-MM-DD')),
                  }
                  //Solution 02
                  // { "$eq": [ { "$year"      : "$createdDate" }, { "$year"      : new Date() } ] },
                  // { "$eq": [ { "$month"     : "$createdDate" }, { "$month"     : new Date() } ] },
                  // { "$eq": [ { "$dayOfMonth": "$createdDate" }, { "$dayOfMonth": new Date() } ] }

              ]
           }
       }
      }
      break;
    case 'payment-type' :
      query = {"paymentType" : regexValue};
      break;
      case 'shipping-address' :
        query = {"shippingAddress" : regexValue};
      break;
    case 'customer-details' :
      projection={customerId:0}
      aggregate = [
        {
          $lookup: {
            from: 'customers', // foreign collection name
            localField: 'customerId',
            foreignField: '_id',
            as: 'customerDetail', // alias
          },
        }
      ];
      break;
    default: 
    res.status(500).json({findFunction: "failed :v", err: "Sorry! Something wrong! Please recheck your query"})
    return;
  }
  findDocuments({query: query, projection: projection, aggregate:aggregate}, COLLECTION_NAME)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({findFunction: "failed :v", err: err}))
})
//


//Get products sold from date1 to date2-----------  task 20---21--- 28
router.get('/sold', function(req, res, next) {
  const {type,dateFrom, dateTo, top} = req.query
  let start = new Date(moment(dateFrom).utc().local().format('YYYY-MM-DD'))
  let end = new Date(moment(dateTo).utc().local().format('YYYY-MM-DD'))

  let aggregate=[]
switch (type) {
  case "products":
    aggregate=[
      { $match :  {
        "$expr": { 
          "$and": [
            {"$ne": ['$status', 'CANCELED'] },
            {"$gte": ["$createdDate", start]},
            {"$lte": ["$createdDate", end]},
                 ]
     }}
      },
      {
        $unwind: "$orderDetails"
      },
      {
        $lookup: {
          from: 'products', // foreign collection name
          localField: 'orderDetails.productId',
          foreignField: '_id',
          pipeline: [{$project: { categoryId: 0, supplierId: 0  }}],
          as: 'productDetail', // alias
        },
      },
      {
        $group:{
          _id:"$orderDetails.productId",
          productDetail: {$first: '$productDetail'},
          listOrders: {$push: { orderId: "$_id", createdDate: "$createdDate", orderDetails: "$orderDetails" }}
        }
      }
    ]
    break;
    case "customers":
      aggregate=[
        { $unwind : "$orderDetails" },
        { $match :  {
          "$expr": { 
            "$and": [
              {"$gte": ["$createdDate", start]},
              {"$lte": ["$createdDate", end]},
                   ]
       }}
        },
        {
          $lookup: {
            from: 'customers', // foreign collection name
            localField: 'customerId',
            foreignField: '_id',
            // pipeline: [{$project: { : 0, supplierId: 0  }}],
            as: 'customerDetail', // alias
          },
        },
        {
          $group: {
          _id: "$customerId",  
           customerDetail: {$first: "$customerDetail"},
          totalAmount:  {$sum: { 
              $multiply: [ 
                "$orderDetails.price", "$orderDetails.quantity",
                {$divide : [{$subtract: [100, "$orderDetails.discount"]}, 100]}
              ]  }},
        }},
    
      ]
      break;
      
  default:
    break;
}
  let sort= {totalAmount: -1};
  let limit= 50;
  if(top) limit= parseInt(top)
  let projection={customerId:0, employeeId:0}

  findDocuments({aggregate:aggregate, sort:sort, limit:limit, projection:projection}, COLLECTION_NAME)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({findFunction: "failed :v", err: err}))
})
//






//------------------------------------------------------------------------------------------------

module.exports = router;