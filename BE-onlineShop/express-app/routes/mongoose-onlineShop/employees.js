var express = require('express');

const {default: mongoose} = require ('mongoose')
const Employee = require('../../model/Employee')
var moment = require('moment')
var router = express.Router();

mongoose.connect('mongodb://127.0.0.1:27017/online-shop')

// const MongoClient = require('mongodb').MongoClient
const url= "mongodb://127.0.0.1:27017/"
// const url= "mongodb://localhost:27017/"
// const dbName= "online-shop"
const COLLECTION_NAME= "employees"

const {
  insertDocument,insertDocuments, updateDocument,
  updateDocuments,
  findOne,
  findDocuments,
  deleteOneWithId,
  deleteMany,
  
  } = require("../../helpers/MongoDBOnlineShop");
const { validateSchema,
  search_deleteWithId,
  search_deleteManyEmployeesSchema,
  insertOneEmployeeSchema,
  insertManyEmployeesSchema,
  updateOneEmployeeSchema,
  updateManyEmployeesSchema,

} = require('../../helpers/schemasEmployeesOnlineShop.yup');
const { date } = require('yup');

//Get all employees
router.get('/', async(req, res, next) =>{
  try{
    const employees = await Employee.find();
    res.json(employees);
  } catch(err) {
    res.status(400).json({ error: { name: err.name, message: err.message } })
  }
})
//

router.get('/search/:id', async (req, res, next) => {
  try{
    const {id} = req.params;
    const employee = await Employee.findById(id);
    //the same:  const employee = await Employee.findOne({ _id: id });
    res.json(employee);
  }catch(err) {
    res.status(400).json({ error: { name: err.name, message: err.message } })
  }
})
//

router.get('/search-many', validateSchema(search_deleteManyEmployeesSchema), function(req, res, next) {
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
    if(data.birthday){
      //format date: YYYY-MM-DD => type of Date: string
      data.birthday=  moment(data.birthday).utc().local().format('YYYY-MM-DD')
      //convert type of date from String to Date
      data.birthday= new Date(data.birthday)
    }
    //Create a new blog post object
    const employee = new Employee(data)
    //Insert the product in our MongoDB database
    await employee.save();
    res.status(201).json(employee);
    
  }catch(err) {
    res.status(400).json({error: {name: err.name, message: err.message}})
  }
})

 //Update One with _Id
 router.patch('/update-one/:id', async(req, res, next) => {
  try{

    const {id} = req.params;
    const updateData = req.body
    
    if(updateData.birthday){
      //format date: YYYY-MM-DD => type of Date: string
      updateData.birthday=  moment(updateData.birthday).utc().local().format('YYYY-MM-DD')
      //convert type of date from String to Date
      updateData.birthday= new Date(updateData.birthday)
    }
    const employee = await Employee.findByIdAndUpdate(id, updateData)
    res.json(employee)
  }catch(err) {
    res.status(400).json({error: {name: err.name, message: err.message}});
  }
})
//

 //Update MANY 
 router.patch('/update-many',validateSchema(updateManyEmployeesSchema), function(req, res, next){
  const query = req.query;
  const newValues = req.body;

  if(newValues.birthday) 
   {
     //format date: YYYY-MM-Đ => type of Date: string
    newValues.birthday= moment(newValues.birthday).utc().local().format('YYYY-MM-DD')
    //converting type of date from String to Date
    newValues.birthday= new Date(newValues.birthday)
  }

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

    const deleteEmployee = await Employee.findByIdAndDelete(id);
    res.status(200).json(deleteEmployee)
  }catch(err) {
    res.status(400).json({error: {name: err.name, message: err.message}});
  }
})
//

//Delete MANY
router.delete('/delete-many',validateSchema(search_deleteManyEmployeesSchema), function(req, res, next) {
  const query= req.query;

  deleteMany(query, COLLECTION_NAME)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({deleteFunction: "failed", err: err}))
})


//TASK 24
//Get all employees with total Price they have sold
router.get('/revenue', function(req, res, next) {
  
 const aggregate = [
    {
      $lookup: {
        from: "orders",
        let: {employeeId : "$_id"},
        pipeline: [
          {$unwind: "$orderDetails"},
          {
            $match:{
              $expr: {
                "$and" : [
                  {$eq: ['$employeeId', '$$employeeId'] },
                  {$ne: ['$status', 'CANCELED'] }
                ]
              }
            }
          },
//Solution 01
          // { $group: {
          //   _id: "$employeeId", //to show totalPrice or all Orders that this employee sold
          //  ordersId: {$push: "$_id"},
          //   totalPrice: {$sum: { $multiply: [ 
          //     "$orderDetails.price", "$orderDetails.quantity",
          //     {$divide : [{$subtract: [100, "$orderDetails.discount"]}, 100]}
          //   ]}},
          // }
          // },
//
//Solution 02
          { $group: {
            _id: "$_id", //to show totalPrice or all Orders that this employee sold
           productsId: {$push: "$orderDetails.productId"},
            totalPriceEachOrder: {$sum: { $multiply: [ 
              "$orderDetails.price", "$orderDetails.quantity",
              {$divide : [{$subtract: [100, "$orderDetails.discount"]}, 100]}
            ]}},
          }
          },
        ],
        as: "orders",
      }
    },
    {
      $addFields: {
        totalPriceAll: {$sum: "$orders.totalPriceEachOrder"}
      }
    }
//
  ]
  findDocuments({aggregate: aggregate}, COLLECTION_NAME)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({findFunction: "failed :v", err: err}))
})
//

//TASK 27
//Get top 3 employees with total Price they have sold from date1 to date2
router.get('/revenueTop3', function(req, res, next) {
  const {dateFrom, dateTo} = req.query
  //convert date from string to date with the LocalZone of VietNam with format YYYY-MM-DD HH:MM:SS
  // let start = moment(dateFrom).utc().local().format('YYYY-MM-DD HH:mm:ss')
  // let end = moment(dateTo).utc().local().format('YYYY-MM-DD HH:mm:ss')

  let start = new Date(moment(dateFrom).utc().local().format('YYYY-MM-DD'))
  let end = new Date(moment(dateTo).utc().local().format('YYYY-MM-DD'))

  const aggregate = [
    {
      $lookup: {
        from: "orders",
        let: {employeeId : "$_id"},
        pipeline: [
          {$unwind: "$orderDetails"},
          {
            $match:{
              $expr: {
                "$and" : [
                  {$eq: ['$employeeId', '$$employeeId'] },
                  {$ne: ['$status', 'CANCELED'] },
                  {$gte: ['$createdDate', start]},
                  {$lte: ['$createdDate', end]}
                ]
              }
            }
          },

          { $group: {
            _id: "$_id", 
            createdDate: {$first: "$createdDate"},
           productsId: {$push: "$orderDetails.productId"},
            totalPriceEachOrder: {$sum: { $multiply: [ 
              "$orderDetails.price", "$orderDetails.quantity",
              {$divide : [{$subtract: [100, "$orderDetails.discount"]}, 100]}
            ]}},
          }
          },
        ],
        as: "orders",
      }
    },
    {
      $match: {
        orders: {$ne: []}
      }
    },
    {
      $addFields: {
        totalPriceAll: {$sum: "$orders.totalPriceEachOrder"}
      }
    },
    {
      $sort: { "totalPriceAll": -1}
    },
    {
      $limit: 3
    }
//
  ]
  findDocuments({aggregate: aggregate}, COLLECTION_NAME)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({findFunction: "failed :v", err: err}))
})
//

//Get employees 14  
router.get('/search', function(req, res, next) {
  const {key,value} = req.query
 const query={}
  switch(key){
    case 'address':
      query = {address : new RegExp(`${value}`, "i")};
      break;
    case 'birthday':
      query = {$and: [
        {'birthday': {$exists: true}},
        { "$expr": {  
          "$eq": [ { "$year": "$birthday" }, { "$year": new Date() } ] 
        }}
      ]}
      
      break;
    case 'birthday-today':
     query = {
      "birthday": {"$exists": true} ,
      "$expr": { 
            "$and": [
                 { "$eq": [ { "$dayOfMonth": "$birthday" }, { "$dayOfMonth": new Date() } ] },
                 { "$eq": [ { "$month"     : "$birthday" }, { "$month"     : new Date() } ] }
            ]
         }
     }
    
      break;
    default:
      res.status(404).json({message: 'Something wrong, please check your formatting request'})
      return;
  }
  findDocuments({query: query}, COLLECTION_NAME)
      .then(result => res.status(200).json(result))
      .catch(err => res.status(500).json({findFunction: "failed :v", err: err}))
  })
  //






//------------------------------------------------------------------------------------------------

module.exports = router;