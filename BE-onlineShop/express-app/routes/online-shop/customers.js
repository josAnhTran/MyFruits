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
const COLLECTION_NAME= "customers"

const {
  insertDocument,insertDocuments, updateDocument,
  updateDocuments,
  findOne,
  findDocuments,
  deleteOneWithId,
  deleteMany
  
  } = require("../../helpers/MongoDBOnlineShop");
const { validateSchema, 
    search_deleteWithId,
    search_deleteManyCustomersSchema,
    insertOneCustomerSchema,
    insertManyCustomersSchema,
    updateOneCustomerSchema,
    updateManyCustomersSchema,
} = require('../../helpers/schemasCustomersOnlineShop.yup');

//Get all categories
router.get('/', function(req, res, next) {
  findDocuments({query: {}}, COLLECTION_NAME)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({findFunction: "failed :v", err: err}))
})
//
router.get('/search/:id', validateSchema(search_deleteWithId), function(req, res, next) {
  const {id}= req.params;
  const query = {_id: ObjectId(id)}
  findOne({query: query}, COLLECTION_NAME)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({findFunction: "failed", err: err}))
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
// router.post('/insert', validateSchema(addSchema), function (req, res, next){
  router.post('/insert',validateSchema(insertOneCustomerSchema), function (req, res, next){
    const data = req.body;
    if(data.birthday){
      //format date: YYYY-MM-DD => type of Date: string
      data.birthday=  moment(data.birthday).utc().local().format('YYYY-MM-DD')
      //convert type of date from String to Date
      data.birthday= new Date(data.birthday)
  
    }
  
    insertDocument(data, COLLECTION_NAME)
    .then(result => {
      res.status(200).json({ok: true, result: result})
    })
    .catch(err =>{
      res.json(500).json({ok:false})
    })
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
 router.patch('/update-one/:id',validateSchema(updateOneCustomerSchema), function(req, res, next){
  const {id} = req.params;
  const paramId = {_id : ObjectId(id)}
  const data = req.body

  if(data.birthday){
    //format date: YYYY-MM-DD => type of Date: string
    data.birthday=  moment(data.birthday).utc().local().format('YYYY-MM-DD')
    //convert type of date from String to Date
    data.birthday= new Date(data.birthday)

  }


  updateDocument(paramId, data, COLLECTION_NAME)
    .then(result => {
      res.status(201).json({update: true, result: result})
    })
    .catch(err => res.json({update: false}))
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

//Delete ONE with ID
router.delete('/delete-id/:_id',validateSchema(search_deleteWithId), function(req, res, next) {
  const {_id}= req.params;

  deleteOneWithId({_id: ObjectId(_id)}, COLLECTION_NAME)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({deleteFunction: "failed", err: err}))
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