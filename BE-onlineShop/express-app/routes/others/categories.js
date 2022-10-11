var express = require('express');
var router = express.Router();
var fs = require('fs');
const { max } = require('lodash');
var _ = require('lodash');
const {validateSchema, updateSchema, addSchema} = require('./schemas.yup')

const fileName = './data/categories.json'
const data = fs.readFileSync(fileName, {encoding: 'utf-8', flag: 'r'})

let categories = JSON.parse(data)
/* GET users listing. */
router.get('/', function(req, res, next) {
  try{
    res.json(categories)
    return
  }catch(error){
    //DEV MODE
    res.sendStatus(500).json(error)
    //PRODUCTION MODE
    // res.sendStatus(500)
    // res.status(500).json({
    //   message:'Loi he thong',
    //   desc: 'Loi'
    // })
    return
  }
});

//Get a category
router.get('/:id', function(req, res, next){
try{
  const id = req.params.id
  // console.log('test id', id)
  if(id=== undefined){
    res.status(400).json({
      message: 'id is required'
    })
    return
  }else{
    const found= categories.find(item => item.id.toString() === id)
    if(found){
      res.json(found)
      return
    }else{
      res.sendStatus(404)
      return
    }
  }
}catch(error){
  res.sendStatus(500)
  return
}
})

// Create a category

router.post('/',validateSchema(addSchema), function(req, res, next){
try{
  const {name, description} = req.body
  if(!name || !description){
    res.status(400).json({message: 'Bad Request'})
    return
  }else{
    const max = _.maxBy(categories, 'id')
    console.log('test max:   ', max)
    categories.push({id: max.id + 1, name, description})

    // Save to file 'categories'
    fs.writeFileSync(fileName, JSON.stringify(categories), function(err){
      if(err) throw err;
      console.log('Saved!')
    })
    // res.sendStatus(201)
    res.status(201).json(categories)
    return
  }
}catch(error){
  res.sendStatus(500)
  return
}

})

// UPDATE A CATEGORY

router.patch('/:id',validateSchema(updateSchema), function(req,res, next) {
try{
  const {id}= req.params
  console.log(req.params)
  // console.log('tester:   ', id)
  if( !id){
    res.status(400).json({
      message: 'id is required'
    })
    return
  }
  
    const index = categories.findIndex((categories) => categories.id.toString() === id)
    if(index === -1){
      res.sendStatus(404)
      return
    }
    
      const {name, description} = req.body
      if(!name || !description){
        res.status(400).json({message: 'Bad Request'})
        return
      }else{
        categories.fill({id: id, ...req.body}, index, index+1)

       // Save to file 'categories'
    fs.writeFileSync(fileName, JSON.stringify(categories), function(err){
      if(err) throw err;
      console.log('Saved!')
    })
        res.status(200).json({id: id, ...req.body})
        return
      }
      
  
}catch(error){
  res.sendStatus(500)
  return
}

})

//DELETE A CATEGORY
router.delete('/:id', function(req, res, next) {
try{
  const {id} = req.params
console.log('id: ', id)
  if(!id){
    res.sendStatus(400)
    return
  }else{
    let found = categories.find(category => category.id.toString() === id)
console.log('found:', found)
    if(found){
      _.remove(categories, category => category.id.toString()=== id)

      // Save to file
      fs.writeFileSync(fileName, JSON.stringify(categories), function(err){
        if(err) throw err
        console.log('Saved!')
      })

      res.sendStatus(200)
      return
    }else{
      res.sendStatus(410)
      return
    }
  }
}catch(error){
  res.status(500).json('Failed')
  return
}
})



module.exports = router;
