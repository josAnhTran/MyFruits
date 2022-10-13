const mongoose = require('mongoose');
const {Schema, model } = mongoose;


const categorySchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            maxLength: [50, 'Tên danh mục không quá 50 kí tự!'],
            // maxLength: 50,
            required: true
        },
        description: {
            type: String,
            trim: true,
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
categorySchema.set('validateBeforeSave', true);


const Category = model('Category', categorySchema);

module.exports = Category;