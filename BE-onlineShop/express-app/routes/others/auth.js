var fs = require('fs');
var express = require('express');
var router = express.Router();
var {validateSchema, loginSchema} = require('./schemas.yup')
var passport = require ('passport')
var jwt = require('jsonwebtoken')

const fileName = './data/users.json'
const data = fs.readFileSync(fileName, {encoding: 'utf-8', flag: 'r'})
let users = JSON.parse(data)

// /* GET users listing. */
// router.post('/login', validateSchema(loginSchema),  function(req, res, next) {
// //   res.send('LOGIN SUCCESS');
// try{
//   const {username, password} = req.body
//   console.log(password)

//   if(!username || !password){
//     res.sendStatus(400)
//     return
//   }else{
//     const found= users.find(user => user.username === username && user.password === password)
//     if(found){
//       res.json({
//         user: {...found},
//         token: ''
//       })
//       return
//     }else{
//       res.status(401).json({
//         'statusCode': 401,
//         'message': 'Unauthorized'
//       })
//     }
//   }

// }catch(error){
//   res.sendStatus(500)
//   return
// }

//  });


/* GET users listing. 
                                   USING JWT

*/
router.post('/login', validateSchema(loginSchema),  function(req, res, next) {
  //   res.send('LOGIN SUCCESS');

    const {username, password} = req.body
    // console.log(password)
    if(username === 'tungnt@softech.vn' && password=== '123456789'){
      //jwt
      //data de minh chuan bi cho ma hoa
      var payload = {
        user: {
          username: username,
          email: 'tung@softecht.vn',

        },
        application: 'ecommerce'
      }

      var secret = 'ADFV32323VASD2S3VADF3VAD3VADFAF4ASD3'
      //sign- ky so- nghia la bam du lieu
      var token = jwt.sign(payload, secret, {
        expiresIn: 86400, // expires in 24 hours
        audience: 'myAplication.dot',
        issuer:  'myjob.vn',
        subject: username, // Them tieu de 
        algorithm: 'HS512' // thuat toan bam hs512
      })

      res.status(200).json({
        ok: true,
        login: true,
        user: {
          username: username,
          fullname: 'Tran van anh'
        },
        token: token
      })
      return
    }
      res.status(401).json({
        statusCode: 401,
        message: 'Unauthorized'
      })
    })
    
    router.get('/', passport.authenticate('jwt', {session:false}) , function(req,res, next){
        res.json({ok:true})

      // try{

      //   res.json({ok:true})
      //   return
      // }catch(err){
      //   res.json(err)
      // }
    })


module.exports = router;
