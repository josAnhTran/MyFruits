var createError = require('http-errors');
var express = require('express');
var cors = require('cors')
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var passport = require('passport')
var JwtStrategy = require('passport-jwt').Strategy
var ExtractJwt = require('passport-jwt').ExtractJwt 

var indexRouter = require('./routes/others/index');
var usersRouter = require('./routes/others/users');
var authRouter = require('./routes/others/auth');
var categoriesRouter = require('./routes/others/categories');
var categoriesMongodbRouter = require('./routes/others/categoriesMongodb');
var productRouter = require('./routes/others/products');
var productMongoRouter = require('./routes/others/productsMongo');

//------------------ONLINE-SHOP---- begin-------------------------// 
var categoriesOnlineShopRouter = require('./routes/online-shop/categories')
var suppliersOnlineShopRouter = require('./routes/online-shop/suppliers')
var productsOnlineShopRouter = require('./routes/online-shop/products')
var customersOnlineShopRouter = require('./routes/online-shop/customers')
var ordersOnlineShopRouter = require('./routes/online-shop/orders')
var employeesOnlineShopRouter = require('./routes/online-shop/employees')
//---------------------End--------------------------------//

//------------------ONLINE-SHOP- MONGOOSE---- begin-------------------------// 
var categoriesOnlineShopMongooseRouter = require('./routes/mongoose-onlineShop/categories')
var suppliersOnlineShopMongooseRouter = require('./routes/mongoose-onlineShop/suppliers')
var productsOnlineShopMongooseRouter = require('./routes/mongoose-onlineShop/products')
var customersOnlineShopMongooseRouter = require('./routes/mongoose-onlineShop/customers')
var ordersOnlineShopMongooseRouter = require('./routes/mongoose-onlineShop/orders')
var employeesOnlineShopMongooseRouter = require('./routes/mongoose-onlineShop/employees')
//---------------------End--------------------------------//
//UPLOAD



var app = express();

app.use(cors({}))
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
app.use('/users', usersRouter);

//------------------ONLINE-SHOP---- begin-------------------------// 
app.use('/categoriesOnlineShop',categoriesOnlineShopRouter)
app.use('/suppliersOnlineShop',suppliersOnlineShopRouter)
app.use('/productsOnlineShop',productsOnlineShopRouter)
app.use('/customersOnlineShop',customersOnlineShopRouter)
app.use('/ordersOnlineShop',ordersOnlineShopRouter)
app.use('/employeesOnlineShop',employeesOnlineShopRouter)
//---------------------End--------------------------------//

//------------------ONLINE-SHOP MONGOOSE---- begin-------------------------// 
app.use('/categoriesOnlineShopMongoose',categoriesOnlineShopMongooseRouter)
app.use('/suppliersOnlineShopMongoose',suppliersOnlineShopMongooseRouter)
app.use('/productsOnlineShopMongoose',productsOnlineShopMongooseRouter)
app.use('/customersOnlineShopMongoose',customersOnlineShopMongooseRouter)
app.use('/ordersOnlineShopMongoose',ordersOnlineShopMongooseRouter)
app.use('/employeesOnlineShopMongoose',employeesOnlineShopMongooseRouter)
//---------------------End--------------------------------//




//middleware
const myLogger = function (req, res, next){
  console.log(req.headers['api-key'])

  const apiKey = req.headers['api-key']
  if(apiKey && apiKey=== 'aptech-test-nodeJS'){
    next()
  }else{
    res.sendStatus(401)
    return
  }
  console.log('MIDDLEWARE LOGGER')
  // next()
}

//Passport: Jwt
var opts = {};
//extract content gui len tu client
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
//ma tu minh nghi ra--ma bao mat ma chi phia server la biet thoi-- duoc dung de bam du lieu
opts.secretOrKey = 'ADFV32323VASD2S3VADF3VAD3VADFAF4ASD3'
// issuer. audience- minh viet API cho he thong di dong,...-- thong tin them
opts.issuer = 'myjob.vn'
opts.audience = 'myAplication.dot'

//Cai dat mot middle ware
passport.use(
  new JwtStrategy(opts, function (payload, done){
    if(payload.sub === 'tungnt@softech.vn'){
      return done(null, true)
    }else {
      return done(null, false)
    }
  })
)
// app.use(myLogger)
//ROUTES
app.use('/products', productRouter)
app.use('/auth', authRouter);
app.use('/categories', categoriesRouter);

app.use('/categoriesMongodb', categoriesMongodbRouter)
app.use('/productsMongo', productMongoRouter)


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
