const createError = require("http-errors");
const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

const BasicStrategy = require("passport-http").BasicStrategy;

const indexRouter = require("./routes/others/index");
// const usersRouter = require('./routes/others/users');
// const categoriesRouter = require('./routes/others/categories');
// const categoriesMongodbRouter = require('./routes/others/categoriesMongodb');
// const productRouter = require('./routes/others/products');
// const productMongoRouter = require('./routes/others/productsMongo');

//------------------ONLINE-SHOP---- begin-------------------------//
// const categoriesOnlineShopRouter = require('./routes/online-shop/categories')
// const suppliersOnlineShopRouter = require('./routes/online-shop/suppliers')
// const productsOnlineShopRouter = require('./routes/online-shop/products')
// const customersOnlineShopRouter = require('./routes/online-shop/customers')
// const ordersOnlineShopRouter = require('./routes/online-shop/orders')
// const employeesOnlineShopRouter = require('./routes/online-shop/employees')
//---------------------End--------------------------------//

//------------------ONLINE-SHOP- MONGOOSE---- begin-------------------------//
const authOnlineShopMongooseRouter = require("./routes/mongoose-onlineShop/auth");
const usersOnlineShopMongooseRouter = require("./routes/mongoose-onlineShop/users");
const categoriesOnlineShopMongooseRouter = require("./routes/mongoose-onlineShop/categories");
const suppliersOnlineShopMongooseRouter = require("./routes/mongoose-onlineShop/suppliers");
const productsOnlineShopMongooseRouter = require("./routes/mongoose-onlineShop/products");
const customersOnlineShopMongooseRouter = require("./routes/mongoose-onlineShop/customers");
const ordersOnlineShopMongooseRouter = require("./routes/mongoose-onlineShop/orders");
const employeesOnlineShopMongooseRouter = require("./routes/mongoose-onlineShop/employees");
const { JWT_SETTING, COLLECTION_LOGIN } = require("./helpers/constants");
const { findDocument, findDocuments } = require("./helpers/MongoDBOnlineShop");
//---------------------End--------------------------------//

const app = express();
// //Set up add data from form-data in POSTMAN
// // Put these statements before you define any routes.
// app.use(bodyParser.urlencoded());
// app.use(forms.array());
// app.use(bodyParser.json());
// //

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//CORS
app.use(cors({ origin: "*" }));

//Passport: Basic Auth
passport.use( new BasicStrategy(function(username, password, done) {
  console.log('\n BasicStrategy \n');
  findDocuments({query: {email: username, password}}, COLLECTION_LOGIN)
  .then(result =>{
    if(result.length > 0){
      return done(null, true);
    }else {
      return done(null, false);
    }
  })
  .catch(err =>{
    return done(err, false);
  })
}))
//
// Passport: Bearer Token

const opts = {};
//extract content gui len tu client
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
//ma tu minh nghi ra--ma bao mat ma chi phia server la biet thoi-- duoc dung de bam du lieu
opts.secretOrKey = JWT_SETTING.SECRET;
// issuer. audience- minh viet API cho he thong di dong,...-- thong tin them
opts.issuer = JWT_SETTING.ISSUER;
opts.audience = JWT_SETTING.AUDIENCE;
//Cai dat mot middle ware

passport.use(
  new JwtStrategy(opts, function (payload, done) {
    console.log("\n🚀 JwtStrategy 🚀\n");
    const _id = payload.uid;
    findDocument(_id, COLLECTION_LOGIN)
      .then((result) => {
        if (result) {
          return done(null, result);
        } else {
          return done(null, false);
        }
      })
      .catch((err) => {
        return done(err, false);
      });
  })
);

// END: PASSPORT
//------------------ONLINE-SHOP MONGOOSE---- begin-------------------------//
app.use("/authOnlineShopMongoose", authOnlineShopMongooseRouter);
app.use("/categoriesOnlineShopMongoose", categoriesOnlineShopMongooseRouter);
app.use("/suppliersOnlineShopMongoose", suppliersOnlineShopMongooseRouter);
app.use("/productsOnlineShopMongoose", productsOnlineShopMongooseRouter);
app.use("/customersOnlineShopMongoose", customersOnlineShopMongooseRouter);
app.use("/ordersOnlineShopMongoose", ordersOnlineShopMongooseRouter);
app.use("/employeesOnlineShopMongoose", employeesOnlineShopMongooseRouter);
app.use("/usersOnlineShopMongoose", usersOnlineShopMongooseRouter);
//---------------------End--------------------------------//

//middleware
const myLogger = function (req, res, next) {
  console.log(req.headers["api-key"]);

  const apiKey = req.headers["api-key"];
  if (apiKey && apiKey === "aptech-test-nodeJS") {
    next();
  } else {
    res.sendStatus(401);
    return;
  }
  console.log("MIDDLEWARE LOGGER");
  // next()
};



// app.use(myLogger)
//ROUTES

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  console.log("Not found the link-route");
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
