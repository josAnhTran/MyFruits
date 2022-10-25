const yup = require('yup')

const validateSchema = (schema) => async(req, res, next) =>{
    try{
        await schema.validate({
            body: req.body,
            query: req.query,
            params: req.params,
        })
        return next()
    }catch(err){
        return res.status(400).json({ type: err.name, message: err.message })
    }
}
//

const insertOneOrderSchema = yup.object({
    body: yup.object({
        shippedDate: yup.string(),
        status: yup.string().max(50).required(),
        description: yup.string().max(500),
        shippingAddress: yup.string().required(),
        paymentType: yup.string().max(20).required(),
        customerId: yup.string().required(),
        employeeId: yup.string().required(),
        orderDetails: yup.array().of(
            yup.object({
                productId: yup.string().required(),
                quantity: yup.number().required(),
                price: yup.number().required(),
                discount: yup.number().required(),
            })
        )
    })

})
//

//Insert Many Orders
const insertManyOrdersSchema = yup.object({
    body: yup.array().of(
        yup.object({
            shippedDate: yup.string(),
            status: yup.string().max(50).required(),
            description: yup.string().max(500),
            shippingAddress: yup.string().required(),
            paymentType: yup.string().max(20).required(),
            customerId: yup.string().required(),
            employeeId: yup.string().required(),
            orderDetails: yup.array().of(
                yup.object({
                    productId: yup.string().required(),
                    quantity: yup.number().required(),
                    price: yup.number().required(),
                    discount: yup.number().required(),
                })
            )
        })
    )
})

const updateOneOrderSchema = yup.object({
    body: yup.object({
        createdDate: yup.string(),
        shippedDate: yup.string(),
        status: yup.string().max(50),
        description: yup.string().max(500),
        shippingAddress: yup.string(),
        paymentType: yup.string().max(20),
        customerId: yup.string(),
        employeeId: yup.string(),
        orderDetails: yup.array().of(
            yup.object({
                productId: yup.string(),
                quantity: yup.number,
                price: yup.number,
                discount: yup.number,
            })
        )
    }),
    params: yup.object({
        id: yup.string().required()
    })
})
//
const updateManyOrderSchema = yup.object({
    body: yup.array().of(
        yup.object({
            createdDate: yup.string(),
            shippedDate: yup.string(),
            status: yup.string().max(50),
            description: yup.string().max(500),
            shippingAddress: yup.string(),
            paymentType: yup.string().max(20),
            customerId: yup.string(),
            employeeId: yup.string(), 
            orderDetails: yup.array().of(
                yup.object({
                    productId: yup.string(),
                    quantity: yup.number,
                    price: yup.number,
                    discount: yup.number,
                })
            )
        })
    ),
    query: yup.object({
        createdDate: yup.string(),
        shippedDate: yup.string(),
        status: yup.string().max(50),
        description: yup.string().max(500),
        shippingAddress: yup.string(),
        paymentType: yup.string().max(20),
        customerId: yup.string(),
        employeeId: yup.string(),
    })

})
//
const search_deleteManyOrdersSchema = yup.object({
    query: yup.object({
        createdDate: yup.string(),
        shippedDate: yup.string(),
        status: yup.string().max(50),
        description: yup.string().max(500),
        shippingAddress: yup.string(),
        paymentType: yup.string().max(20),
        customerId: yup.string(),
        employeeId: yup.string(),
    })
})
//

const search_deleteWithId = yup.object({
    params: yup.object({
        id: yup.string().required()
    })
})




module.exports ={
    validateSchema,
    search_deleteWithId,
    search_deleteManyOrdersSchema,
    insertOneOrderSchema,
    insertManyOrdersSchema,
    updateOneOrderSchema,
    updateManyOrderSchema,
}