const multer = require('multer');
let fs = require('fs');

//UPLOAD IMAGE FOR Products
let storageProduct= multer.diskStorage({
    destination: function (req, file, cb){
        let idProduct = req.params.id;
        let PATH = `./public/images/products/${idProduct}`;

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

let uploadProduct = multer({ storage: storageProduct});
 const createProductImage = uploadProduct.single('file')
//

module.exports = createProductImage;