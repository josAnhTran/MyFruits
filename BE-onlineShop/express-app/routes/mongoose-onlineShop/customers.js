var express = require('express');
const {default: mongoose} = require ('mongoose')
const Customer = require('../../model/Customer')
var moment = require('moment')
var router = express.Router();

mongoose.connect('mongodb://127.0.0.1:27017/online-shop')

// const MongoClient = require('mongodb').MongoClient
const url= "mongodb://127.0.0.1:27017/"
// const url= "mongodb://localhost:27017/"
// const dbName= "online-shop"
const COLLECTION_NAME= "customers"

const {
  insertDocument,insertDocuments,
  updateDocument, updateDocuments,
  findOne, findDocuments,
  deleteOneWithId, deleteMany,
  formatterErrorFunc
  
  } = require("../../helpers/MongoDBOnlineShop");
const { validateSchema, 
    search_deleteWithId,
    search_deleteManyCustomersSchema,
    insertOneCustomerSchema,
    insertManyCustomersSchema,
    updateOneCustomerSchema,
    updateManyCustomersSchema,
} = require('../../helpers/schemasCustomersOnlineShop.yup');

//Get all customers
router.get('/', async(req, res, next) =>{
  try{
    const customers = await Customer.find();
    res.json(customers);
  } catch(err) {
    res.status(400).json({ error: { name: err.name, message: err.message } })
  }
})
//

router.get('/search/:id', async (req, res, next) => {
  try{
    const {id} = req.params;
    const customer = await Customer.findById(id);
    //the same:  const customer = await Customer.findOne({ _id: id });
    res.json(customer);
  }catch(err) {
    res.status(400).json({ error: { name: err.name, message: err.message } })
  }
})
//

router.get('/search-many', validateSchema(search_deleteManyCustomersSchema), function(req, res, next) {
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
      const customer = new Customer(data)
      //Insert the product in our MongoDB database
      await customer.save();
      res.status(201).json(customer);
      
    }catch(err) {
      const messageError = formatterErrorFunc(err)
      res.status(400).json({error: messageError})
    }
  })

 //Insert Many  -- haven't validation yet
 router.post('/insert-many', validateSchema(insertManyCustomersSchema), function (req, res, next){
  const listBirthdays = req.body;
  //convert type of birthday from STRING to DATE with formatting 'YYYY-MM-DD
  listBirthdays.map(customer => {
    if(customer.birthday) {
      customer.birthday = new Date(moment(customer.birthday).utc().local().format('YYYY-MM-DD'))
    }
  })

  insertDocuments(listBirthdays, COLLECTION_NAME)
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
    
    if(updateData.birthday){
      //format date: YYYY-MM-DD => type of Date: string
      updateData.birthday=  moment(updateData.birthday).utc().local().format('YYYY-MM-DD')
      //convert type of date from String to Date
      updateData.birthday= new Date(updateData.birthday)
    }
    const opts= {runValidators: true}

    const customer = await Customer.findByIdAndUpdate(id, updateData, opts)
    res.json(customer)
  }catch(err) {
    const messageError = formatterErrorFunc(err)
    res.status(400).json({error: messageError})
  }
})
//

//Update MANY 
 router.patch('/update-many',validateSchema(updateManyCustomersSchema), function(req, res, next){
  const query = req.query;
  const newValues = req.body;

  if(newValues.birthday){
    //format date: YYYY-MM-DD => type of Date: string
    newValues.birthday=  moment(newValues.birthday).utc().local().format('YYYY-MM-DD')
    //convert type of date from String to Date
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

    const deleteCustomer = await Customer.findByIdAndDelete(id);
    res.status(200).json(deleteCustomer)
  }catch(err) {
    res.status(400).json({error: {name: err.name, message: err.message}});
  }
})
//

//Delete MANY
router.delete('/delete-many',validateSchema(search_deleteManyCustomersSchema), function(req, res, next) {
  const query= req.query;

  deleteMany(query, COLLECTION_NAME)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({deleteFunction: "failed", err: err}))
})
//---------------------------------------------------------------------------------------------------------------//

//Get customers addressing at------- HAI CHAU   ----- 4  ; 5  ; 6  
router.get('/search', function(req, res, next) {
  const {key,value} = req.query
  const query={}
  switch(key){
    case 'address':
      query = {address : new RegExp(`${value}`, "i")};
      break;
    case 'yearBirthday':
      query = { $and: [
                        {birthday: {$exists: true}},
                        {"$expr": { 
                          "$eq": [ { "$year": "$birthday" }, { "$year": new Date(value) } ] ,
                                  }
                          }]}
      break;
    case 'birthday-today':
     query = { $and:[
                  {birthday: {$exists: true}},
                  {"$expr": { 
                      "$and": [
                          { "$eq": [ { "$dayOfMonth": "$birthday" }, { "$dayOfMonth": new Date() } ] },
                          { "$eq": [ { "$month"     : "$birthday" }, { "$month"     : new Date() } ] }
                      ]
                  }
              }]}
      break;
    default:
      res.status(404).json({message: "Searching function is fail", solution: "Please check your formatting request"});
      return;
  }
    findDocuments({query: query}, COLLECTION_NAME)
      .then(result => res.status(200).json(result))
      .catch(err => res.status(500).json({findFunction: "failed :v", err: err}))
  })
  //

//------------------------------------------------------------------------------------------------

module.exports = router;