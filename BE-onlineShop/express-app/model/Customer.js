const mongoose = require('mongoose');
const {Schema, model } = mongoose;


const customerSchema = new Schema(
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
            type: Date
        }
    },
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
customerSchema.set('validateBeforeSave', true);

const Customer = model('Customer', customerSchema);

module.exports = Customer;