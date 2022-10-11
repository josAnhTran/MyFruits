const mongoose = require('mongoose');
const {Schema, model } = mongoose;


const supplierSchema = new Schema(
    {
        name: {
            type: String,
            maxLength: 100,
            required: true
        },
        email: {
            type: String,
            maxLength: 50,
            required: true
        },
        phoneNumber: {
            type: String,
            maxLength: 50
        },
        address: {
            type: String,
            maxLength: 500,
            required: true
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
supplierSchema.set('validateBeforeSave', true);

const Supplier = model('Supplier', supplierSchema);

module.exports = Supplier;