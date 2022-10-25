const multer = require('multer');
let fs = require('fs');

//UPLOAD IMAGE FOR CATEGORIES
let storageCategory= multer.diskStorage({
    
    destination: function (req, file, cb){
        let subLocation = 'firstTimeCreate';
        if(req.params.id) {
            subLocation = req.params.id;
        }
        let PATH = `./public/images/categories/${subLocation}`;

        if(!fs.existsSync(PATH)){
            fs.mkdirSync(PATH);
        }
        cb(null, PATH);
    },
    filename: function(req, file, cb){
            let extArray= file.mimetype.split('/');
            let extension = extArray[extArray.length - 1];
            cb(null, file.fieldname + '-' + Date.now() + '.' + extension);
    }
})

let uploadCategory = multer({ storage: storageCategory});
let createCategoryImage = uploadCategory.single('file')

module.exports = createCategoryImage;