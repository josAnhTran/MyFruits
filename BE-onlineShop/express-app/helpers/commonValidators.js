const { ObjectID } = require("bson");
const { COLLECTION_CATEGORIES, COLLECTION_SUPPLIERS } = require("./constants");
const { findDocument } = require("./MongoDBOnlineShop");

function validateId(req, res, next) {
  const id = req.params.id;
  if (!(id && ObjectID.isValid(id))) {
    res.status(400).json({
      ok: false,
      error: {
        name: "id",
        message: "The parameter id is not a true formatted ObjectId",
      },
    });
    return;
  }
  next();
}
//
function loadCategory(req, res, next) {
  const id = req.params.id;
  if (!(id && ObjectID.isValid(id))) {
    res.status(400).json({
      ok: false,
      error: {
        name: "id",
        message: "The parameter id is not a true formatting ObjectId",
      },
    });
    return;
  }

  findDocument(id,collectionName = 'categories')
    .then((result) => {
      //result !== false, is mean, finding a document with the id in the collection
      if (result) {
        req.document = result;
        next();
      } else {
        res.status(404).json({
          ok: true,
          error: {
            name: "id",
            message: `the document with following id doesn't exist in the collection ${collectionName}`,
          },
        });
        return;
      }
    })
    .catch((error) => {
      res.status(500).json({ ok: false, error });
      return;
    });
}
//
function loadSupplier(req, res, next) {
  const id = req.params.id;
  if (!(id && ObjectID.isValid(id))) {
    res.status(400).json({
      ok: false,
      error: {
        name: "id",
        message: "The parameter id is not a true formatting ObjectId",
      },
    });
    return;
  }

  findDocument(id,collectionName= 'suppliers')
    .then((result) => {
      //result !== false, is mean, finding a document with the id in the collection
      if (result) {
        req.document = result;
        next();
      } else {
        res.status(404).json({
          ok: true,
          error: {
            name: "id",
            message: `the document with following id doesn't exist in the collection ${collectionName}`,
          },
        });
        return;
      }
    })
    .catch((error) => {
      res.status(500).json({ ok: false, error });
      return;
    });
}

//
module.exports = {
  validateId,
  loadCategory,
  loadSupplier,
};
