var express = require('express');

const {default: mongoose} = require ('mongoose')
const Category = require('../../model/Category')
const { ObjectId } = require('mongodb');
var router = express.Router();

mongoose.connect('mongodb://127.0.0.1:27017/online-shop')

const url= "mongodb://127.0.0.1:27017/"
// const url= "mongodb://localhost:27017/"
// const dbName= "online-shop"
const COLLECTION_NAME= "categories"

const {
  insertDocument,insertDocuments,
  updateDocument, updateDocuments,
  findOne,findDocuments,
  deleteMany,deleteOneWithId,
  formatterErrorFunc
  } = require("../../helpers/MongoDBOnlineShop");
const { validateSchema,
   insertOneCategorySchema, 
   updateOneCategorySchema, 
   updateManyCategorySchema,
   insertManyCategoriesSchema,
   search_deleteWithId,
   search_deleteManyCategoriesSchema,
   
  } = require('../../helpers/schemasCategoriesOnlineShop.yup');


//Get all categories
router.get('/', async(req, res, next) =>{
  try{
    const categories = await Category.find();
    res.json(categories);
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
    res.json(category);
  }catch(err) {
    res.status(400).json({ error: { name: err.name, message: err.message } })
  }
})

router.get('/search-many', validateSchema(search_deleteManyCategoriesSchema), function(req, res, next) {
  const query= req.query;
  findDocuments({query: query}, COLLECTION_NAME)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({findFunction: "failed", err: err}))
})
//

// Insert One 
router.post('/insert', async ( req, res, next) => {
  try{
    const data = req.body;
    //Create a new blog post object
    const category = new Category(data);
    //Insert the product in our MongoDB database
    await category.save();
    res.status(201).json(category);
  }catch(err) {
    const messageError = formatterErrorFunc(err)
    res.status(400).json({error: messageError})
  }
})

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
 router.patch('/updateById/:id', async(req, res, next) => {
  try{
    const {id} = req.params;
    const updateData = req.body;
    const opts= {runValidators: true}
    const category = await Category.findByIdAndUpdate(id, updateData, opts);
    res.json(category)
  }catch(err) {
    const messageError = formatterErrorFunc(err)
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
