# MyFruits
# Validate PhoneNumber: 
/\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/
Supporting for: 
(123) 456 7899
(123).456.7899
(123)-456-7899
123-456-7899
123 456 7899
1234567899
# multer.any()
// const upload = require('multer')();
//  router.patch('/updateByIdWithoutImage/:id',upload.any() ,async(req, res, next) => {

# multer function 
const multer = require('multer');
let fs = require('fs');

//UPLOAD IMAGE FOR Customers
let storageCustomer= multer.diskStorage({
    destination: function (req, file, cb){
        let idCustomer = req.params.id;
        let PATH = `./public/images/customers/${idCustomer}`;

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

let uploadCustomer = multer({ storage: storageCustomer});
 const createCustomerImage = uploadCustomer.single('file')
//

module.exports = createCustomerImage;

