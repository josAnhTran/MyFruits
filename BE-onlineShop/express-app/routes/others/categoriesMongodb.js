var express = require('express');
const { join } = require('lodash');
const { ObjectId } = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var router = express.Router();

// const MongoClient = require('mongodb').MongoClient
const url= "mongodb://127.0.0.1:27017/"
// const url= "mongodb://localhost:27017/"
const dbName= "api-training"
const collectionName= "categories"


const {
  insertDocument,insertDocuments, updateDocument,
  updateDocuments,
  findOne,
  findMany,
  findManyProjection,
  deleteOne,
  deleteALot,
  findAll,
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
  const query= req.query;
  console.log(query);
  findMany(query, collectionName)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({findFunction: "failed :v", err: err}))
})
//

//Find MANY with text Search
router.get('/searchs/:textSearch', validateSchema(searchManySchema), function(req, res, next) {
  const {textSearch}= req.params;
  
  findMany(textSearch, collectionName)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({findFunction: "failed :v", err: err}))
})
//

// router.post('/', function(req, res, next){
//   //1. OPEN
//   MongoClient.connect(url, function(err, db){
//     // db: object database
// //ERROR OF CONNECT
//     if(err) {
//       res.status(500).json({ok: false, error: err})
//       return;
//     }
// // .db la thiet lap de chung ta lam viec voi database nao
//     var dbo = db.db(dbName)
//     //dbo dong vai tro la mot object san sang cho viec them moi sua xoa.
//     const category = req.body
//     //collection- ten cua collection
//     dbo.collection("categories").insertOne(category, function(err, result) {
// //EROR OF INSERT
//       if (err) {
//         res.status(500).json({ok:false, error: err});
//         return;
//       }
// //OK
//         res.json({ok:true, result: result})
//       db.close();
//       return
//     });
//   }  );
//   //
  

// })

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
