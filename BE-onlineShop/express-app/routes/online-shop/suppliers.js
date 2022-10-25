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
const COLLECTION_NAME= "suppliers"

const {
  insertDocument,insertDocuments,
  updateDocument, updateDocuments,
  findOne,findDocuments,
  deleteMany,deleteOneWithId,
  } = require("../../helpers/MongoDBOnlineShop");
const { validateSchema,
        search_deleteWithId,
        search_deleteManySuppliersSchema,
        insertOneSupplierSchema,
        insertManySuppliersSchema,
        updateOneSupplierSchema,
        updateManySupplierSchema,
} = require('../../helpers/schemas/schemasSuppliersOnlineShop.yup');

//Get all categories
router.get('/', function(req, res, next) {
  findDocuments({query: {}}, COLLECTION_NAME)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({findFunction: "failed :v", err: err}))
})
//
router.get('/search/:id', validateSchema(search_deleteWithId), function(req, res, next) {
  const {id}= req.params;
  findOne({query: {_id: ObjectId(id)}}, COLLECTION_NAME)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({findFunction: "failed", err: err}))
})
//

router.get('/search-many', validateSchema(search_deleteManySuppliersSchema), function(req, res, next) {
  const query= req.query;
  findDocuments({query: query}, COLLECTION_NAME)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({findFunction: "failed", err: err}))
})
//
// Insert One
// router.post('/insert', validateSchema(addSchema), function (req, res, next){
  router.post('/insert',validateSchema(insertOneSupplierSchema), function (req, res, next){
    const data = req.body;
    insertDocument(data, COLLECTION_NAME)
    .then(result => {
      res.status(200).json({ok: true, result: result})
    })
    .catch(err =>{
      res.json(500).json({ok:false})
    })
   })


 //Insert Many  -- haven't validation yet
 router.post('/insert-many', validateSchema(insertManySuppliersSchema), function (req, res, next){
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
 router.patch('/update-one/:id',validateSchema(updateOneSupplierSchema), function(req, res, next){
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
 router.patch('/update-many',validateSchema(updateManySupplierSchema), function(req, res, next){
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
router.delete('/delete-many',validateSchema(search_deleteManySuppliersSchema), function(req, res, next) {
  const query= req.query;

  deleteMany(query, COLLECTION_NAME)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({deleteFunction: "failed", err: err}))
})


//TASK 26  --- not finished
//---get suppliers that not sale
router.get('/suppliersNotSale', function(req, res, next) {
  aggregate = [
    {
      $lookup: {
        from: "products",
        let: {supplierId: "$_id"},
        pipeline: [
          {$match: {
            $expr: {
              $and: [
                {$ne: ['$productId', '$$productId'] },
                // {$eq: ['$status', 'COMPLETED'] },
               
              ]
            }
          }}
        ],
        as: "products"
      }},
      {
        $match: {products}
      }
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
      
  ]
  findDocuments(query, COLLECTION_NAME, aggregate, sort, limit, skip, projection)
      .then(result => res.status(200).json(result))
      .catch(err => res.status(500).json({findFunction: "failed :v", err: err}))
  })
  //
//


// Get suppliers --- task 15
router.get('/search', function(req, res, next) {
  let {key,values} = req.query
  // change "," into "|" and remove spaces in string values for Regular Expression
  values = values.replaceAll("," , "|")
  values = values.replaceAll(" " , "")
  let query={};
  switch(key){
    case 'name':
      query = {"name" : new RegExp(`${values}`, "gi")};
      break;
    default:
  }
    findDocuments({query: query}, COLLECTION_NAME)
      .then(result => {
       if(result.length === 0){
         res.status(404).json({message: "Not Found"}) 
       }else{
         res.status(200).json(result)
        }
       })
      .catch(err => res.status(500).json({findFunction: "failed :v", err: err}))
  })
  //


// Get suppliers with all products  --- task 19
router.get('/products', function (req, res) {
  aggregate=[
    {
      $lookup: {
        from: 'products',
        let: { supplierId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$$supplierId', '$supplierId'] },
            },
          },
        ],
        as: 'products',
      },
    },
    {$addFields: {
      totalSupply: {$sum: '$products.stock'}
    }}
  ]
  findDocuments({aggregate: aggregate}, COLLECTION_NAME)
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

//Listing suppliers that have product sold
router.get('/suppliersNotSold', function(req, res){
  const {dateFrom, dateTo} = req.query
  
  let start = new Date(moment(dateFrom).utc().local().format('YYYY-MM-DD'))
  let end = new Date(moment(dateTo).utc().local().format('YYYY-MM-DD'))

  const aggregate=[
    {
      $lookup: {
        from: 'products',
        let: {supplierId: '$_id'},
        pipeline: [
          {
            $match: {
              $expr: {
                "$and" : [
                 { $eq: ["$supplierId", '$$supplierId']},
                ]
              }
            }
          },
        ],
        as : "products"
      }
    },
    {
      $unwind: {
        path: "$products",
        preserveNullAndEmptyArrays: true
      }
    },
    {$lookup: {
      from: 'orders',
      let: {productId: '$products._id'},
      pipeline: [
        {
          $unwind:{
            path:  "$orderDetails",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $match: {
            $expr: {
              "$and" : [
               { $eq: ["$$productId", '$orderDetails.productId']},
               { $ne: ["$status", 'CANCELED']},
                // {$gte: ['$createdDate', start]},
                // {$lte: ['$createdDate', end]}
              ]
            }
          }
        },
      ],
      as : "orders"
    }},
    {
      $group:{
        _id: "$_id",
        name: {$first: "$name"},
        isProduct: {$push: "$products._id"},
        isOrder:{$push: '$orders._id'}
      }
    },
    {
      $match: {
       $or: [
        { "isProduct": {$eq: []}},
        {"isOrder" : {$eq: []}}
       ]
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
})

//------------------------------------------------------------------------------------------------

module.exports = router;