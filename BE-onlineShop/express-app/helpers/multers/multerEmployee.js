const multer = require('multer');
let fs = require('fs');

//UPLOAD IMAGE FOR Employees
let storageEmployee= multer.diskStorage({
    destination: function (req, file, cb){
        let idEmployee = req.params.id;
        let PATH = `./public/images/employees/${idEmployee}`;

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

let uploadEmployee = multer({ storage: storageEmployee});
 const createEmployeeImage = uploadEmployee.single('file')
//

module.exports = createEmployeeImage;