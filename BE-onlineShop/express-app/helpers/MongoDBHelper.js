'use strict';
const { values } = require('lodash');
// Declaration a library MongoClient
// writing follwing desctructuring <=> const MongoClient = require('mongodb).MongoClient
// ObjectID involving in working with autonumber
const { MongoClient, ObjectId } = require('mongodb');
// connecting string to MongoDB
const DATABASE_NAME = 'api-training'
const CONNECTION_STRING= "mongodb://127.0.0.1:27017/" + DATABASE_NAME

//INSERT_ONE
// function insertDocument(data, collectionName){
    const insertDocument =(data, collectionName) =>{
    return new Promise((resolve, reject) => {
        MongoClient.connect(CONNECTION_STRING, {useNewUrlParser: true, useUnifiedTopology: true})
            .then((client) =>{
                const dbo = client.db(DATABASE_NAME);
                const collection = dbo.collection(collectionName);
                collection
                    .insertOne(data)
                    .then((result) => {
                        client.close();
                        resolve({data: data, result: result})
                    })
                    .catch((err) => {
                        client.close()
                        reject(err)
                    })
                })
                .catch((err) => {
                    reject(err)
                })
    })
}

//INSERT MANY
function insertDocuments(list, collectionName) {
    return new Promise((resolve, reject) =>{
        MongoClient.connect(CONNECTION_STRING, {useNewUrlParser: true, useUnifiedTopology: true})
            .then((client) =>{
                const dbo = client.db(DATABASE_NAME);
                const collection = dbo.collection(collectionName);
                collection
                    .insertMany(list)
                    .then((result) => {
                        client.close();
                        resolve({data: list, result: result})
                    })
                    .catch((err) => {
                        client.close()
                        reject(err)
                    })
                })
                .catch((err) => {
                    reject(err)
                })
    })
}

//UPDATE ONE WITH ID

function updateDocument(id, data, collectionName){
    return new Promise( (resolve, reject) => {
        MongoClient.connect(CONNECTION_STRING, {useNewUrlParser: true, useUnifiedTopology: true})
        .then((client) =>{
            const dbo = client.db(DATABASE_NAME);
            const collection = dbo.collection(collectionName);
            // if(query._id) {query = {_id: ObjectId(query._id)}}

            collection.
                updateOne(id, {$set: data})
                .then(result => {
                    client.close();
                    resolve(result);
                })
                .catch(err =>{
                    client.close();
                    reject(err);
                })
        })
        .catch(err => reject(err))
    })
}
//

//UPDATE MANNY

function updateDocuments(query, data, collectionName){
    return new Promise( (resolve, reject) => {
        MongoClient.connect(CONNECTION_STRING, {useNewUrlParser: true, useUnifiedTopology: true})
        .then((client) =>{
            const dbo = client.db(DATABASE_NAME);
            const collection = dbo.collection(collectionName);
            if(query._id) {query = {_id: ObjectId(query._id)}}

            collection.
                updateMany(query, {$set: data})
                .then(result => {
                    client.close();
                    resolve(result);
                })
                .catch(err =>{
                    client.close();
                    reject(err);
                })
        })
        .catch(err => reject(err))
    })
}
//

// FIND following id
function findOne(id, collectionName, aggregate=[]){
    console.log(id)
    return new Promise((resolve, reject) => {
        MongoClient.connect(CONNECTION_STRING, {useNewUrlParser:true , useUnifiedTopology: true})
            .then(client =>{
                const dbo = client.db(DATABASE_NAME);
                const collection = dbo.collection(collectionName);
                    collection  
                    .find([{ $project : {name: 1 } }])  
                    // .findOne(id)
                            .then(result => {
                                client.close();
                                resolve(result);
                            })
                            .catch(err => {
                                client.close()
                                reject(err)
                            })
            })
            .catch(err => reject(err))
    })
}
//

// FIND MANY JUST SHOWING DESCRIPTION

function findMany(query={}, collectionName, aggregate=[], sort={name:1}, limit=5, skip=0, projection={name : 1, cost: 1 }){
    return new Promise((resolve, reject) => {
        MongoClient.connect(CONNECTION_STRING, {useNewUrlParser:true , useUnifiedTopology: true})
            .then(client =>{
                const dbo = client.db(DATABASE_NAME);
                const collection = dbo.collection(collectionName);
                    collection
                    // .createIndex({name: 1, description: 1})
                        // .aggregate(aggregate)  
                        // .find( { $text: { $search: textSearch } } )
                        .find(query)
                        // .sort(sort)
                        // .limit(limit)
                        // .skip(skip)
                        .project(projection)
                        .toArray()
                        .then(result => {
                            client.close();
                            resolve(result);
                       })
                        .catch(err => {
                            console.log('err:   ', err)
                            client.close()
                            reject(err)
                        })
            })
            .catch(err => reject(err))
    })
}
//


//DELETE ONE 
function deleteOne(query, collectionName){
    return new Promise((resolve, reject) => {
        MongoClient.connect(CONNECTION_STRING, {useNewUrlParser:true , useUnifiedTopology: true})
            .then(client =>{
                  // res.json(typeof(query._id));
  // return;
  if(query._id) {query = {_id: ObjectId(query._id)}}
  // res.json(query._id);
  // return;
                const dbo = client.db(DATABASE_NAME);
                const collection = dbo.collection(collectionName);
                    collection  
                        .deleteOne(query)
                            .then(result => {
                                client.close();
                                resolve(result);
                            })
                            .catch(err => {
                                client.close()
                                reject(err)
                            })
            })
            .catch(err => reject(err))
    })
}
//

//DELETE ONE WITH _ID
function deleteOneWithId(_id, collectionName){
    return new Promise((resolve, reject) => {
        MongoClient.connect(CONNECTION_STRING, {useNewUrlParser:true , useUnifiedTopology: true})
            .then(client =>{
                const dbo = client.db(DATABASE_NAME);
                const collection = dbo.collection(collectionName);
                    collection  
                        .deleteOne(_id)
                            .then(result => {
                                client.close();
                                resolve(result);
                            })
                            .catch(err => {
                                client.close()
                                reject(err)
                            })
            })
            .catch(err => reject(err))
    })
}
//

//DELETE MANY 
function deleteALot(query, collectionName){
    return new Promise((resolve, reject) => {
        MongoClient.connect(CONNECTION_STRING, {useNewUrlParser:true , useUnifiedTopology: true})
            .then(client =>{
                const dbo = client.db(DATABASE_NAME);
                const collection = dbo.collection(collectionName);
                    collection  
                        .deleteMany(query)
                            .then(result => {
                                client.close();
                                resolve(result);
                            })
                            .catch(err => {
                                client.close()
                                reject(err)
                            })
            })
            .catch(err => reject(err))
    })
}


module.exports = {
    insertDocument, insertDocuments,
    updateDocument, updateDocuments,
    findOne,findMany,
    deleteOne, deleteALot,
    deleteOneWithId
            }