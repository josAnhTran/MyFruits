const multer = require('multer');
let fs = require('fs');

let storageCategory= multer.diskStorage({
    destination: function (req, file, cb){
        let idCategory = req.params.id;
        let PATH = `./public/images/categories/${idCategory}`;

        if(!fs.existsSync(PATH)){
            fs.mkdirSync(PATH);
        }
        cb(null, PATH);
    },
    filename: function(req, file, cb){
        // console.log(file);
        let extArray= file.mimetype.split('/');
        let extension = extArray[extArray.length - 1];
        cb(null, file.fieldname + '-' + Date.now() + '.' + extension);
    }
})

let uploadCategory = multer({ storage: storageCategory});
let createCategoryImage = uploadCategory.single('file')
module.exports = createCategoryImage;