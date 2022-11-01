"use strict";
// Declaration a library MongoClient
// writing follwing desctructuring <=> const MongoClient = require('mongodb).MongoClient
// ObjectID involving in working with autonumber
const { MongoClient, ObjectId } = require("mongodb");
// connecting string to MongoDB
const DATABASE_NAME = "online-shop";
const CONNECTION_STRING = "mongodb://127.0.0.1:27017/" + DATABASE_NAME;

//Get imageUrl from collection with id
function findDocument(id, collectionName, aggregate = []) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
      .then((client) => {
        const dbo = client.db(DATABASE_NAME);
        const collection = dbo.collection(collectionName);
        const query = { _id: ObjectId(id) };
        collection
          .findOne(query)
          .then((result) => {
            resolve(result);
          })
          .catch((err) => {
            reject(err);
          })
          .finally(() => client.close());
      })
      .catch((err) => reject(err));
  });
}
//

function findDocuments(
  {
    query = null,
    sort = null,
    limit = 50,
    aggregate = [],
    skip = 0,
    projection = null,
  },
  collectionName = ""
) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
      .then((client) => {
        const dbo = client.db(DATABASE_NAME);
        const collection = dbo.collection(collectionName);
        let cursor = collection;
        if (query) {
          cursor = cursor.find(query);
        } else {
          cursor = cursor.aggregate(aggregate);
        }

        if (sort) {
          cursor = cursor.sort(sort);
        }
        cursor.limit(limit).skip(skip);
        if (projection) {
          cursor = cursor.project(projection);
        }

        cursor
          .toArray()

          .then((result) => {
            resolve(result);
          })
          .catch((err) => {
            reject(err);
          })
          .finally(() => client.close());
      })
      .catch((err) => reject(err));
  });
}
//

//INSERT_ONE
const insertDocument = (data, collectionName) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
      .then((client) => {
        const dbo = client.db(DATABASE_NAME);
        const collection = dbo.collection(collectionName);
        collection
          .insertOne(data)
          .then((result) => {
            client.close();
            resolve({ data: data, result: result });
          })
          .catch((err) => {
            client.close();
            reject(err);
          });
      })
      .catch((err) => {
        reject(err);
      });
  });
};
//

//INSERT MANY
function insertDocuments(list, collectionName) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
      .then((client) => {
        const dbo = client.db(DATABASE_NAME);
        const collection = dbo.collection(collectionName);
        collection
          .insertMany(list)
          .then((result) => {
            client.close();
            resolve({ data: list, result: result });
          })
          .catch((err) => {
            client.close();
            reject(err);
          });
      })
      .catch((err) => {
        reject(err);
      });
  });
}
//

//UPDATE ONE WITH ID
function removeFieldById(id, data, collectionName) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
      .then((client) => {
        const dbo = client.db(DATABASE_NAME);
        const collection = dbo.collection(collectionName);

        collection
          .findOneAndUpdate({ _id: id }, { $unset: data })
          .then((result) => {
            client.close();
            resolve(result);
          })
          .catch((err) => {
            client.close();
            reject(err);
          });
      })
      .catch((err) => reject(err));
  });
}
//

//UPDATE ONE WITH ID
function updateDocument(id, data, collectionName) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
      .then((client) => {
        const dbo = client.db(DATABASE_NAME);
        const collection = dbo.collection(collectionName);

        collection
          .findOneAndUpdate(id, { $set: data })
          .then((result) => {
            client.close();
            resolve(result);
          })
          .catch((err) => {
            client.close();
            reject(err);
          });
      })
      .catch((err) => reject(err));
  });
}
//

//UPDATE MANNY
function updateDocuments(query, data, collectionName) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
      .then((client) => {
        const dbo = client.db(DATABASE_NAME);
        const collection = dbo.collection(collectionName);
        if (query._id) {
          query = { _id: ObjectId(query._id) };
        }

        collection
          .updateMany(query, { $set: data })
          .then((result) => {
            client.close();
            resolve(result);
          })
          .catch((err) => {
            client.close();
            reject(err);
          });
      })
      .catch((err) => reject(err));
  });
}
//

//DELETE ONE WITH _ID
function deleteOneWithId(_id, collectionName) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
      .then((client) => {
        const dbo = client.db(DATABASE_NAME);
        const collection = dbo.collection(collectionName);
        collection
          .deleteOne(_id)
          .then((result) => {
            client.close();
            resolve(result);
          })
          .catch((err) => {
            client.close();
            reject(err);
          });
      })
      .catch((err) => reject(err));
  });
}
//

//DELETE MANY
function deleteMany(query, collectionName) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
      .then((client) => {
        const dbo = client.db(DATABASE_NAME);
        const collection = dbo.collection(collectionName);
        collection
          .deleteMany(query)
          .then((result) => {
            client.close();
            resolve(result);
          })
          .catch((err) => {
            client.close();
            reject(err);
          });
      })
      .catch((err) => reject(err));
  });
}

module.exports = {
  insertDocument,
  insertDocuments,
  updateDocument,
  updateDocuments,
  findDocument,
  findDocuments,
  deleteMany,
  deleteOneWithId,
  removeFieldById,
};
