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

// const loginSchema = yup.object({
//     body: yup.object({
//         username: yup.string().required(),
//         password: yup.string().min(3).max(31).required(),
//     }),
//     params: yup.object({}),
// })
//
const insertOneSupplierSchema = yup.object({
    body: yup.object({
        name: yup.string().max(100).required(),
        email: yup.string().email().max(50).required(),
        phoneNumber: yup.string().max(50),
        address: yup.string().max(500).required(),

    })

})
//

//Insert Many Suppliers
const insertManySuppliersSchema = yup.object({
    body: yup.array().of(
        yup.object({
            name: yup.string().max(100).required(),
            email: yup.string().email().max(50).required(),
            phoneNumber: yup.string().max(50),
            address: yup.string().max(500).required(), 
        })
    )
})

const updateOneSupplierSchema = yup.object({
    body: yup.object({
        name: yup.string().max(100),
        email: yup.string().email().max(50),
        phoneNumber: yup.string().max(50),
        address: yup.string().max(500),
    }),
    params: yup.object({
        id: yup.string().required()
    })
})
//
const updateManySupplierSchema = yup.object({
    body: yup.array().of(
        yup.object({
            name: yup.string().max(100),
            email: yup.string().email().max(50),
            phoneNumber: yup.string().max(50),
            address: yup.string().max(500),
        })
    ),
    query: yup.object({
        name: yup.string().max(100),
        email: yup.string().email().max(50),
        phoneNumber: yup.string().max(50),
        address: yup.string().max(500),
    })

})
//
const search_deleteManySuppliersSchema = yup.object({
    query: yup.object({
        name: yup.string().max(100),
        email: yup.string().email().max(50),
        phoneNumber: yup.string().max(50),
        address: yup.string().max(500),
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
    search_deleteManySuppliersSchema,
    insertOneSupplierSchema,
    insertManySuppliersSchema,
    updateOneSupplierSchema,
    updateManySupplierSchema,
}