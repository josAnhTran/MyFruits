const mongoose = require('mongoose');
const {Schema, model } = mongoose;


const supplierSchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            maxLength: [100, 'Tên nhà cung cấp không quá 100 kí tự'],
            required: [true, 'Tên nhà cung cấp không được để trống']
        },
        email: {
            type: String,
            trim: true,
            lowercase : true,
            maxLength:[ 50, 'Email không vượt quá 50 kí tự'],
            required: [true, 'Email không được để trống']
        },
        phoneNumber: {
            type: String,
            trim: true,
            maxLength: [50, 'Số điện thoại không vượt quá 50 kí tự']
        },
        address: {
            type: String,
            trim: true,
            maxLength: [500, 'Địa chỉ không vượt quá 500 kí tự'],
            required: [true, 'Địa chỉ không được để trống']
        },
        imageUrl: {
            type: String,
            trim: true,
        },
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
supplierSchema.set('validateBeforeSave', true);

const Supplier = model('Supplier', supplierSchema);

module.exports = Supplier;