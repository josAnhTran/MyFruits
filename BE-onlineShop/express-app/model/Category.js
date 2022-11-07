const mongoose = require('mongoose');
const {Schema, model } = mongoose;


const categorySchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            maxLength: [50, 'Tên danh mục không quá 50 kí tự!'],
            lowercase: true,
            required: [true, 'Tên danh mục không được để trống']
        },
        description: {
            type: String,
            trim: true,
            maxLength: [500, 'Phần mô tả danh mục không quá 500 kí tự!'],
        },
        imageUrl: {
            type: String,
            trim: true,
            // required: [true, 'Đường dẫn hình ảnh phải là "Null" hoặc một đường dẫn nào đó ']
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
categorySchema.set('validateBeforeSave', true);


const Category = model('Category', categorySchema);

module.exports = Category;