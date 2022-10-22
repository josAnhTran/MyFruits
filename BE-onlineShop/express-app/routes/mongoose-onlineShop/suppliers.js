var express = require('express');
const multer = require('multer');
const {default: mongoose} = require ('mongoose')
const Supplier = require('../../model/Supplier')
var moment = require('moment')
const { ObjectId } = require('mongodb');
var router = express.Router();

mongoose.connect('mongodb://127.0.0.1:27017/online-shop')

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
  formatterErrorFunc
  } = require("../../helpers/MongoDBOnlineShop");
const { validateSchema,
        search_deleteWithId,
        search_deleteManySuppliersSchema,
        insertOneSupplierSchema,
        insertManySuppliersSchema,
        updateOneSupplierSchema,
        updateManySupplierSchema,
} = require('../../helpers/schemasSuppliersOnlineShop.yup');
const createSupplierImage = require('../../helpers/multerHelper');


router.post('/uploadFile/:id', function (req, res, next) {
  createSupplierImage(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      res.status(500).json({ type: 'MulterError', err: err });
    } else if (err) {
      res.status(500).json({ type: 'UnknownError', err: err });
    } else {
      const supplierId = req.params.id;
      const imageUrl = `/images/suppliers/${supplierId}/${req.file.filename}`;

      // MONGODB
      updateDocument({_id: ObjectId(supplierId)}, { imageUrl: imageUrl }, COLLECTION_NAME)
      .then(result => {
        res.status(201).json({update: true, result: result})
      })
      .catch(err => res.json({update: 'UnSuccessful when update image for the supplier'}))
    }
  });
});

//Get all suppliers
router.get('/', async(req, res, next) =>{
  try{
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch(err) {
    res.status(400).json({ error: { name: err.name, message: err.message } })
  }
})
//

router.get('/search/:id', async (req, res, next) => {
  try{
    const {id} = req.params;
    const supplier = await Supplier.findById(id);
    //the same:  const supplier = await Supplier.findOne({ _id: id });
    res.json(supplier);
  }catch(err) {
    res.status(400).json({ error: { name: err.name, message: err.message } })
  }
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
router.post('/insert', async (req, res, next) =>{
  try{
    const data = req.body;
    //Create a new blog post object
    const supplier = new Supplier(data)
    //Insert the product in our MongoDB database
    await supplier.save();
    res.status(201).json(supplier);
    
  }catch(err) {
    const messageError = formatterErrorFunc(err)
    res.status(400).json({error: messageError})
  }
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
 router.patch('/update-one/:id', async(req, res, next) => {
  try{
    const {id} = req.params;
    const updateData = req.body
    const opts= {runValidators: true}

    const supplier = await Supplier.findByIdAndUpdate(id, updateData, opts)
    res.json(supplier)
  }catch(err) {
    const messageError = formatterErrorFunc(err)
    res.status(400).json({error: messageError})
  }
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
router.delete('/delete-id/:id', async(req, res, next) => {
  try{
    const {id} = req.params;

    const deleteSupplier = await Supplier.findByIdAndDelete(id);
    res.status(200).json(deleteSupplier)
  }catch(err) {
    res.status(400).json({error: {name: err.name, message: err.message}});
  }
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