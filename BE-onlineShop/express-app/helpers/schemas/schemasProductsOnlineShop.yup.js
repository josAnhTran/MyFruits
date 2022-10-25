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
const insertOneProductSchema = yup.object({
    body: yup.object({
        name: yup.string().max(50).required(),
        price: yup.number().required(),
        discount: yup.number().required(),
        stock: yup.number().required(),
        categoryId: yup.string().required(),
        supplierId: yup.string().required(),
        description: yup.string().required()
    })

})
//

//Insert Many Products
const insertManyProductsSchema = yup.object({
    body: yup.array().of(
        yup.object({
            name: yup.string().max(50).required(),
            price: yup.number().required(),
            discount: yup.number().required(),
            stock: yup.number().required(),
            categoryId: yup.string().required(),
            supplierId: yup.string().required(),
            description: yup.string().required()
        })
    )
})

const updateOneProductSchema = yup.object({
    body: yup.object({
        name: yup.string().max(50),
        price: yup.number(),
        discount: yup.number(),
        stock: yup.number(),
        categoryId: yup.string(),
        supplierId: yup.string(),
        description: yup.string()
    }),
    params: yup.object({
        id: yup.string().required()
    })
})
//
const updateManyProductSchema = yup.object({
    body: yup.array().of(
        yup.object({
            name: yup.string().max(50),
            price: yup.number(),
            discount: yup.number(),
            stock: yup.number(),
            categoryId: yup.string(),
            supplierId: yup.string(),
            description: yup.string() 
        })
    ),
    query: yup.object({
        name: yup.string().max(50),
        price: yup.number(),
        discount: yup.number(),
        stock: yup.number(),
        categoryId: yup.string(),
        supplierId: yup.string(),
        description: yup.string()
    })

})
//
const search_deleteManyProductsSchema = yup.object({
    query: yup.object({
        name: yup.string().max(50),
        price: yup.number(),
        discount: yup.number(),
        stock: yup.number(),
        categoryId: yup.string(),
        supplierId: yup.string(),
        description: yup.string()
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
    search_deleteManyProductsSchema,
    insertOneProductSchema,
    insertManyProductsSchema,
    updateOneProductSchema,
    updateManyProductSchema,
}