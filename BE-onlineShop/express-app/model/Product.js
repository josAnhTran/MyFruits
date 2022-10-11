const mongoose = require('mongoose');
const {Schema, model } = mongoose;


const productSchema = new Schema(
    {
        name: {
            type: String,
            maxLength: 50,
            required: true
        },
        price: Number,
        discount: Number,
        stock: Number,
        categoryId: { type: Schema.Types.ObjectId},
        supplierId: { type: Schema.Types.ObjectId},
        description: {
            type: String,
            required: true
        }
    },
    {
        //QUERY
        query: {
            byName(name){
                return this.where({ name: new RegExp(name, 'i')});
            },
        },
        //VIRTUALS
        virtuals: {
            total: {
                get(){
                    return (this.price * (100 - this.discount)) / 100;
                },
            },
        },
    },
);
//Include virtuals
productSchema.set('toObject', { virtuals: true});
productSchema.set('toJSON', {virtuals: true});

//validateBeforeSave
productSchema.set('validateBeforeSave', true);

const Product = model('Product', productSchema);

module.exports = Product;