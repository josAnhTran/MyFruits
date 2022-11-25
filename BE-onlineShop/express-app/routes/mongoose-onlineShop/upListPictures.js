const fs = require('fs');
const express = require('express');
const router = express.Router();
// MULTER UPLOAD
const multer = require('multer');
const {
    URL_APP_SERVER,
    PATH_FOLDER_PUBLIC,
    PATH_FOLDER_IMAGES,
    FOLDER_INITIATION,
    COLLECTION_CATEGORIES
  } = require("../../helpers/constants");
  

//
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      let lastLocation = FOLDER_INITIATION;
      if (req.params.id) {
        lastLocation = req.params.id;
      }
      // let PATH = `./public/images/categories/${subLocation}`;
      let PATH = `${PATH_FOLDER_PUBLIC}${PATH_FOLDER_IMAGES}/demoUploadList/${lastLocation}`;
      if (!fs.existsSync(PATH)) {
        fs.mkdirSync(PATH);
      }
      cb(null, PATH);
    },
    filename: function (req, file, cb) {
  console.log('file: ', file)
      
      let extArray = file.mimetype.split("/");
      let extension = extArray[extArray.length - 1];
      cb(null, file.fieldname + "-" + Date.now() + "." + extension);
    },
  });
  
  const uploadImg = multer({ storage: storage }).array("files", 6);
    // const uploadImg = multer({ storage: storage }).single("myFiles");

router.post('/uploadList/:id', function (req, res, next) {
  console.log('putting')
  console.log(req)
  uploadImg(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      res.status(500).json({ type: 'MulterError', err: err });
    } else if (err) {
      res.status(500).json({ type: 'UnknownError', err: err });
    } else {
      console.log('putting')
      const pictures = req.files;
        console.log(req.body.myFiles)
        if(!pictures) {
            const error = new Error('Please choose files')
            error.httpStatusCode = 400
            return next(error)
          }
          let tmp = []
          pictures.map(p => {
            tmp.push({filename: p.filename})
          })
        res.json(tmp);
        return;
    //   const categoryId = req.params.id;
    //   console.log('categoryId:', categoryId);

    //   // MONGODB
    //   updateDocument(categoryId, { imageUrl: `/uploads/categories/${categoryId}/${req.file.filename}` }, 'categories');
    //   console.log(req.params);
    //   console.log(req.body);
    //   //
    //   const publicUrl = `${req.protocol}://${req.hostname}:9000/uploads/categories/${categoryId}/${req.file.filename}`;
    //   res.status(200).json({ ok: true, publicUrl: publicUrl, file: req.file });
    }
  });
});

module.exports = router;
