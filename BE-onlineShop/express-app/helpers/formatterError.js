'use-strict';
///Formatter Error Message
const formatterErrorFunc = (err, collection) =>{
    let errors = {}
    const errMessage = err.message;
    const errName = err.name;
    //Phân loại kiểu lỗi validation để xử lý
    if(errName !== 'ValidationError') {
        errors.name = errName;
        errors.message = errMessage
        return errors
    }
    //

    const error01 = errMessage.substring(errMessage.indexOf(':') +1).trim()
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
              name= 'Tên nhà cung cấp';
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
