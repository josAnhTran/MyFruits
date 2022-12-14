const mongoose = require('mongoose');
const {Schema, model } = mongoose;

const orderDetailSchema = new Schema ({
    productId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        required: true
    }
})
const orderSchema = new Schema(
    {
        createdDate: {
            type: Date,
            default: Date.now
        },
        shippedDate :{
            type: Date,
            required: true
        },
        status: {
            type: String,
            trim: true,
            enum: ['WAITING', 'COMPLETED', 'CANCELED'],
            default: 'WAITING',
            required: true
        },
        description: {
            type: String,
            trim: true,
        },
        shippingAddress: {
            type: String,
            trim: true,
            maxLength: 500,
            required: true
        },
        paymentType: {
            type: String,
            trim: true,
            default: 'CASH',
            enum: ['CREDIT CARD', 'CASH'],
            required: true
        },
        customerId: {
            type: Schema.Types.ObjectId,
            required: true
            },
        employeeId: { 
            type: Schema.Types.ObjectId,
            required: true
        },
        orderDetails:{
            type: [orderDetailSchema],
            default: undefined
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
orderSchema.set('validateBeforeSave', true);

const Order = model('Order', orderSchema);

module.exports = Order;