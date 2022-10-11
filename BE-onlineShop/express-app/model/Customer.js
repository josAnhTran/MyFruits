const mongoose = require('mongoose');
const {Schema, model } = mongoose;


const customerSchema = new Schema(
    {
        firstName: {
            type: String,
            maxLength: 50,
            required: true
        },
        lastName: {
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
        },
        email: {
            type: String,
            maxLength: 50,
            required: true
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