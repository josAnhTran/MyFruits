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

const insertOneCustomerSchema = yup.object({
    body: yup.object({
        firstName: yup.string().max(50).required(),
        lastName: yup.string().max(50).required(),
        phoneNumber: yup.string().max(50),
        address: yup.string().max(500).required(),
        email: yup.string().email().max(50).required(),
        birthday: yup.date(),
    })

})
//

//Insert Many Categories
const insertManyCustomersSchema = yup.object({
    body: yup.array().of(
        yup.object({
            firstName: yup.string().max(50).required(),
            lastName: yup.string().max(50).required(),
            phoneNumber: yup.string().max(50),
            address: yup.string().max(500).required(),
            email: yup.string().email().max(50).required(),
            birthday: yup.date(), 
        })
    )
})

const updateOneCustomerSchema = yup.object({
    body: yup.object({
        firstName: yup.string().max(50),
        lastName: yup.string().max(50),
        phoneNumber: yup.string().max(50),
        address: yup.string().max(500),
        email: yup.string().email().max(50),
        birthday: yup.date(),
    }),
    params: yup.object({
        id: yup.string().required()
    })
})
//
const updateManyCustomersSchema = yup.object({
    body: yup.array().of(
        yup.object({
            firstName: yup.string().max(50),
            lastName: yup.string().max(50),
            phoneNumber: yup.string().max(50),
            address: yup.string().max(500),
            email: yup.string().email().max(50),
            birthday: yup.date(), 
        })
    ),
    query: yup.object({
        firstName: yup.string().max(50),
        lastName: yup.string().max(50),
        phoneNumber: yup.string().max(50),
        address: yup.string().max(500),
        email: yup.string().email().max(50),
        birthday: yup.date(),
    })

})
//
const search_deleteManyCustomersSchema = yup.object({
    query: yup.object({
        firstName: yup.string().max(50),
        lastName: yup.string().max(50),
        phoneNumber: yup.string().max(50),
        address: yup.string().max(500),
        email: yup.string().email().max(50),
        birthday: yup.date(),
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
    search_deleteManyCustomersSchema,
    insertOneCustomerSchema,
    insertManyCustomersSchema,
    updateOneCustomerSchema,
    updateManyCustomersSchema,
}