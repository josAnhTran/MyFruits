const mongoose = require('mongoose');
const {Schema, model } = mongoose;


const employeeSchema = new Schema(
    {
        firstName: {
            type: String,
            trim: true,
            maxLength: 50,
            required: true
        },
        lastName: {
            type: String,
            trim: true,
            maxLength: 50,
            required: true
        },
        phoneNumber: {
            type: String,
            trim: true,
            match: [/\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/, 'Vui lòng nhập đúng định dạng số điện thoại']
        },
        address: {
            type: String,
            trim: true,
            maxLength: 500,
            required: true
        },
        email: {
            type: String,
            trim: true,
            lowercase : true,
            maxLength: 50,
            required: true,
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Vui lòng nhập đúng định dạng email']

        },
        birthday: {
            type: Date,
            //Employee have his age more than 18 years
            validate: {
                validator: function (v){
                    return (
                        v && //check that there is a date object
                        v.getTime() <= Date.now() - 18*365*24*60*60*1000
                    )
                },
                message: 'nhân viên phải lớn hơn hoặc bằng 18 tuổi'
            }
        },
        imageUrl: {
            type: String,
            trim: true,
        }
    },
    {"strict": "throw"} // If the field haven't existed in MongooseSchema, throw error

    // {
    //     //QUERY
    //     query: {
    //         byName(name){
    //             return this.where({ name: new RegExp(name, 'i')});
    //         },
    //     },
    //     //VIRTUALS
    //     virtuals: {
    //         total: {
    //             get(){
    //                 return (this.price * (100 - this.discount)) / 100;
    //             },
    //         },
    //     },
    // },
);
//Include virtuals
// productSchema.set('toObject', { virtuals: true});
// productSchema.set('toJSON', {virtuals: true});

//validateBeforeSave
employeeSchema.set('validateBeforeSave', true);

const Employee = model('Employee', employeeSchema);

module.exports = Employee;