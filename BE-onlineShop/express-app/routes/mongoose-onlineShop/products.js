var express = require('express');

const {default: mongoose} = require ('mongoose')
const Product = require('../../model/Product')
var moment = require('moment')
var router = express.Router();

//MONGOOSE
mongoose.connect('mongodb://127.0.0.1:27017/online-shop')
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
  formatterErrorFunc
  } = require("../../helpers/MongoDBOnlineShop");
const {
  validateSchema,
  search_deleteWithId,
  search_deleteManyProductsSchema,
  insertOneProductSchema,
  insertManyProductsSchema,
  updateOneProductSchema,
  updateManyProductSchema,
   } = require('../../helpers/schemasProductsOnlineShop.yup');

//BEGIN: MONGOOSE
//Get all products
router.get('/', async(req, res, next) =>{
  try{
    const products = await Product.find();
    res.json(products);
  } catch(err) {
    res.status(400).json({ error: { name: err.name, message: err.message } })
  }
})
//

router.get('/search/:id', async (req, res, next) => {
  try{
    const {id} = req.params;
    const product = await Product.findById(id);
    //the same:  const product = await Product.findOne({ _id: id });
    res.json(product);
  }catch(err) {
    res.status(400).json({ error: { name: err.name, message: err.message } })
  }
})
//

router.get('/search-many', validateSchema(search_deleteManyProductsSchema), function(req, res, next) {
  const query= req.query;
  findDocuments({query: query}, COLLECTION_NAME)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({findFunction: "failed", err: err}))
})
//

  router.post('/insert', async ( req, res, next) => {
    try{
      const data = req.body;
      //Create a new blog post object
      const product = new Product(data);
      //Insert the product in our MongoDB database
      await product.save();
      res.status(201).json(product);
    }catch(err) {
      const messageError = formatterErrorFunc(err)
      res.status(400).json({error: messageError})
    }
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

router.patch('/update-one/:id', async(req, res, next) => {
  try{
    const {id} = req.params;
    const updateData = req.body;
    const opts= {runValidators: true}

    const product = await Product.findByIdAndUpdate(id, updateData, opts);
    res.json(product)
  }catch(err) {
    const messageError = formatterErrorFunc(err)
    res.status(400).json({error: messageError})
  }
})
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

router.delete('/delete-id/:id', async(req, res, next) => {
  try{
    const {id} = req.params;

    const deleteProduct = await Product.findByIdAndDelete(id);
    res.status(200).json(deleteProduct)
  }catch(err) {
    res.status(400).json({error: {name: err.name, message: err.message}});
  }
})

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