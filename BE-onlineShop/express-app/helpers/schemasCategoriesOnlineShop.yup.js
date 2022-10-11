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
const insertOneCategorySchema = yup.object({
    body: yup.object({
        name: yup.string().max(50).required(),
        description: yup.string().max(500)
    })

})
//

//Insert Many Categories
const insertManyCategoriesSchema = yup.object({
    body: yup.array().of(
        yup.object({
            name: yup.string().max(50).required(),
            description: yup.string().max(500) 
        })
    )
})

const updateOneCategorySchema = yup.object({
    body: yup.object({
        name: yup.string().max(50),
        description: yup.string().max(500)
    }),
    params: yup.object({
        id: yup.string().required()
    })
})
//
const updateManyCategorySchema = yup.object({
    body: yup.array().of(
        yup.object({
            name: yup.string().max(50).required(),
            description: yup.string().max(500) 
        })
    ),
    query: yup.object({
        name: yup.string().max(50),
        description: yup.string().max(500)
    })

})
//
const search_deleteManyCategoriesSchema = yup.object({
    query: yup.object({
        name: yup.string().max(50),
        description: yup.string().max(500)
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
    search_deleteManyCategoriesSchema,
    insertOneCategorySchema,
    insertManyCategoriesSchema,
    updateOneCategorySchema,
    updateManyCategorySchema,
}