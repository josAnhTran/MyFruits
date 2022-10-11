var express = require('express');
const { join } = require('lodash');
const { ObjectId } = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var router = express.Router();

const url= "mongodb://127.0.0.1:27017/"
const dbName= "api-training"
const collectionName= "products"
const lookup = [
  {
    $lookup: {
      from: 'categories', // foreign collection name
      localField: 'categoryId',
      foreignField: '_id',
      as: 'category', // alias
    },
  }
];


const {
  insertDocument,insertDocuments, updateDocument,
  updateDocuments,
  findOne,
  findMany,
  deleteOne,
  deleteALot,
  deleteOneWithId
  
  } = require('../../helpers/MongoDBHelper');
const { validateSchema, searchOneWith_IdSchema, searchManySchema, addSchema } = require('./schemas.yup');

/* GET home page. */
// router.get('/', function(req, res, next) {
//   // res.render('index', { title: 'Express' });
//   res.json({ok: true})
// });

// Find One Document Following ID   
router.get('/search/:id', validateSchema(searchOneWith_IdSchema), function(req, res, next) {
  const {id}= req.params;
  findOne({_id: ObjectId(id)}, collectionName)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({findFunction: "failed", err: err}))
})
//

//Find MANY with QUERY
router.get('/searchs', validateSchema(searchManySchema), function(req, res, next) {
 
  findMany(req.query, collectionName)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({findFunction : "get Products failed :v", err: err}))
})
//

//Find MANY with text Search---- Not complete
router.get('/searchs/:textSearch', validateSchema(searchManySchema), function(req, res, next) {
  const {textSearch}= req.params;
  
  findMany(textSearch, collectionName)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({findFunction: "failed :v", err: err}))
})
//

// Insert One
 router.post('/insert-one', validateSchema(addSchema), function (req, res, next){
  const data = req.body;
  insertDocument(data, collectionName)
  .then(result => {
    res.status(200).json({ok: true, result: result})
  })
  .catch(err =>{
    res.json(500).json({ok:false})
  })
 })

 //Insert Many
 router.post('/insert-many', function (req, res, next){
  const list = req.body;

  insertDocuments(list, collectionName)
  .then(result => {
    res.status(200).json({ok: true, result: result})
  })
  .catch(err =>{
    res.json(500).json({ok:false})
  })
 })

 //Update One with _Id
 router.patch('/update-one/:id',validateSchema(addSchema), function(req, res, next){
  const {id} = req.params;
  const paramId = {_id : ObjectId(id)}
  const data = req.body

  updateDocument(paramId, data, collectionName)
    .then(result => {
      res.status(201).json({update: true, result: result})
    })
    .catch(err => res.json({update: false}))
 })
//

 //Update MANY
 router.patch('/update-many', function(req, res, next){
  const query = req.query;
  const newValues = req.body;
  updateDocuments(query, newValues, collectionName)
    .then(result => {
      res.status(201).json({update: true, result: result})
    })
    .catch(err => res.json({update: false}))
 })
//


//Delete ONE
router.delete('/delete', function(req, res, next) {
  const query= req.query;

  deleteOne(query, collectionName)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({deleteFunction: "failed", err: err}))
})
//

//Delete ONE with ID
router.delete('/delete-id/:_id', function(req, res, next) {
  const {_id}= req.params;

  deleteOneWithId({_id: ObjectId(_id)}, collectionName)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({deleteFunction: "failed", err: err}))
})
//

//Delete MANY
router.delete('/delete-many', function(req, res, next) {
  const query= req.query;

  deleteALot(query, collectionName)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({deleteFunction: "failed", err: err}))
})
//
module.exports = router;
