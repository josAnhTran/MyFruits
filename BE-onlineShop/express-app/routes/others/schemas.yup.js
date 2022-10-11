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
const loginSchema = yup.object({
    body: yup.object({
        username: yup.string().required(),
        password: yup.string().min(3).max(31).required(),
    }),
    params: yup.object({}),
})

const updateSchema = yup.object({
    body: yup.object({
        name: yup.string().max(32),
        description: yup.string().min(3)
    }),
    params: yup.object({
        id: yup.number().required()
    })
})

const addSchema = yup.object({
    body: yup.object({
        name: yup.string().min(5).max(32).required(),
        description: yup.string().min(5).max(255)
    }),

})

const searchOneWith_IdSchema = yup.object({
    params: yup.object({
        id: yup.string().required()
    })
})

const searchManySchema = yup.object({
    query: yup.object({
        name: yup.string().min(5).max(32),
        description: yup.string().min(5).max(252)
    })
})




module.exports ={
    validateSchema,
    loginSchema,
    updateSchema,
    addSchema,
    searchOneWith_IdSchema,
    searchManySchema
}