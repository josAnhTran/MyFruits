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

const insertOneEmployeeSchema = yup.object({
    body: yup.object({
        firstName: yup.string().max(50).required(),
        lastName: yup.string().max(50).required(),
        phoneNumber: yup.string().max(50),
        address: yup.string().max(500).required(),
        email: yup.string().email().max(50).required(),
        birthday: yup.string().max(50),
    })

})
//

//Insert Many Categories
const insertManyEmployeesSchema = yup.object({
    body: yup.array().of(
        yup.object({
            firstName: yup.string().max(50).required(),
            lastName: yup.string().max(50).required(),
            phoneNumber: yup.string().max(50),
            address: yup.string().max(500).required(),
            email: yup.string().email().max(50).required(),
            birthday: yup.string().max(50), 
        })
    )
})

const updateOneEmployeeSchema = yup.object({
    body: yup.object({
        firstName: yup.string().max(50),
        lastName: yup.string().max(50),
        phoneNumber: yup.string().max(50),
        address: yup.string().max(500),
        email: yup.string().email().max(50),
        birthday: yup.string().max(50),
    }),
    params: yup.object({
        id: yup.string().required()
    })
})
//
const updateManyEmployeesSchema = yup.object({
    body: yup.array().of(
        yup.object({
            firstName: yup.string().max(50),
            lastName: yup.string().max(50),
            phoneNumber: yup.string().max(50),
            address: yup.string().max(500),
            email: yup.string().email().max(50),
            birthday: yup.string().max(50), 
        })
    ),
    query: yup.object({
        firstName: yup.string().max(50),
        lastName: yup.string().max(50),
        phoneNumber: yup.string().max(50),
        address: yup.string().max(500),
        email: yup.string().email().max(50),
        birthday: yup.string().max(50),
    })

})
//
const search_deleteManyEmployeesSchema = yup.object({
    query: yup.object({
        firstName: yup.string().max(50),
        lastName: yup.string().max(50),
        phoneNumber: yup.string().max(50),
        address: yup.string().max(500),
        email: yup.string().email().max(50),
        birthday: yup.string().max(50),
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
    search_deleteManyEmployeesSchema,
    insertOneEmployeeSchema,
    insertManyEmployeesSchema,
    updateOneEmployeeSchema,
    updateManyEmployeesSchema,
}