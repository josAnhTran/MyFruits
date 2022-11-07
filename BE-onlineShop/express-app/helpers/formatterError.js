'use-strict';
///Formatter Error Message
const formatterErrorFunc = (err, collection) =>{
    let errors = {}
    //Handling error code 11000- uniqueness error
    if(err.code === 11000){
      const errName = Object.keys(err.keyValue)[0];
      switch(errName){
        case "name" :
          errors.name = 'Tên danh mục';
          errors.message = "Tên danh mục đã tồn tại.";
          break;
        case "email" :
          errors.name = 'Email';
          errors.message = "Email đã tồn tại.";
          break;
      }
      return errors;
    }

    const errMsg = err.message;
    const errName = err.name;
    const errKind = err.kind;

    //Phân loại kiểu lỗi validation để xử lý
    //Error about StrictModeError
    if(errName === 'StrictModeError'){
      errors.name = 'Lỗi trường dữ liệu chưa được khai báo trong DB';
      errors.message= `Trường ${err.path} chưa được khai báo trong DB`
      return errors;
    }
    // Error about formatter ObjectId
    if((errKind === 'ObjectId')&&(errName === 'CastError')){
      errors.name = 'Mã ID';
      errors.message = 'Mã ID không đúng định dạng!'
      return errors;
    }

    // Other kind of errors
    if(errName !== 'ValidationError') {
        errors.name = errName;
        errors.message = errMsg
        return errors
    }
    //
    

    const error01 = errMsg.substring(errMsg.indexOf(':') +1).trim()
    // const errorSpilt = error01.split(':');
    let [name, message] =error01.split(':').map((e) => e.trim())

    //According name of collection, separation the translation fields
    if(collection === 'categories'){
        switch (name) {
            case 'name' :
              name= 'Tên danh mục';
              break;
            case 'description' :
              name= 'Mô tả danh mục';
              break;
          }
        
    }

    if(collection === 'suppliers'){
        switch (name) {
            case 'name' :
              name= 'Tên nhà phân phối';
              break;
            case 'email' :
              name= 'Email';
              break;
              case 'phoneNumber' :
              name= 'Số điện thoại';
              break;
            case 'address' :
              name= 'Địa chỉ';
              break;
          }
    }
    if(collection === 'products'){

    }
    if(collection === 'employees'){

    }
    if(collection === 'customers'){

    }
    if(collection === 'orders'){

    }

    errors.name = name;
    errors.message = message
    return errors
  }

  module.exports = {formatterErrorFunc}
