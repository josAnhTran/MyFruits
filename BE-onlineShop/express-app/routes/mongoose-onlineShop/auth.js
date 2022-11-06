const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const {
  validateSchema,
  loginSchema,
} = require("../../helpers/schemas/schemas.yup");
const { JWT_SETTING, COLLECTION_LOGIN } = require("../../helpers/constants");
const {
  findDocuments,
  findDocument,
} = require("../../helpers/MongoDBOnlineShop");

router.post("/login", validateSchema(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    const login = await findDocuments(
      { query: { email, password }, projection: { email: 1 } },
      COLLECTION_LOGIN
    );
    //login = null or login.length not > 0
    if (login && login.length <= 0) {
      res.status(401).json({ message: "UnAuthorized" });
      return;
    }

    const payload = {
      uid: login[0]._id,
      email: login[0]._id,
    };
    const token = jwt.sign(payload, JWT_SETTING.SECRET, {
      expiresIn: 86400, //expires in 24 hours
      issuer: JWT_SETTING.ISSUER,
      audience: JWT_SETTING.AUDIENCE,
      algorithm: "HS512",
    });

    res.json({
      ok: true,
      login: true,
      payload,
      token,
    });
  } catch (err) {
    res.sendStatus(500);
  }
});
//
// ------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------
// CALL API HTTP BASIC AUTHENTICATION
// ------------------------------------------------------------------------------------------------
router.get(
  "/basic",
  passport.authenticate("basic", { session: false }),
  function (req, res, next) {
    res.json({ ok: true, method: "basic authentication" });
  }
);
// ------------------------------------------------------------------------------------------------
//CALL API JWT AUTHENTICATION
// ------------------------------------------------------------------------------------------------
router.get(
  "/jwt",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    res.json({ ok: true, next: "hehe" });
  }
);
//--------------------------------------------------------------------------
//GET ALL USERS WITH API-KEY
const checkApikey = () => {
  //return a middleware
  return (req, res, next) => {
    const apikey = req.get("x-api-key");
    if (apikey === "josLight0209") {
      next();
    } else {
      res.status(401).json({ message: "x-api-key is invalid" });
    }
  };
};

//Solution 1:
router.get("/api-key", checkApikey(), function (req, res) {
  res.json({ ok: true, message: "Successful in method Api-key" });
});
// Cách 2
// router.use(checkApiKey());
// router.get('/api-key', function (req, res, next) {
//   res.json({ ok: true });
// });
// ------------------------------------------------------------------------------------------------
// CALL API WITH ROLES
// ------------------------------------------------------------------------------------------------

//CHECK ROLES
const allowRoles = (...roles) => {
  //return a middleware
  return (req, res, next) => {
    //GET BEARER TOKEN FROM HEADER
    const bearerToken = req.get("Authorization").replace("Bearer ", "");
    //DECODE TOKEN
    const payload = jwt.decode(bearerToken, { json: true });
    //AFTER DECODE: GET UID FROM PAYLOAD
    const { uid } = payload;
    // FINDING BY ID
    findDocument(uid, COLLECTION_LOGIN).then((document) => {
      console.log(document);
      if (document && document.roles) {
        let ok = false;
        document.roles.forEach((role) => {
          if (roles.includes(role)) {
            ok = true;
            return;
          }
        });
        if (ok) {
          next();
        } else {
          res.status(403).json({ message: "Forbidden" });
        }
      } else {
        res.status(403).json({ message: "Forbidden" });
      }
    });
  };
};
// ------------------------------------------------------------------------------------------------
// CALL API JWT AUTHENTICATION & CHECK ROLES
// ------------------------------------------------------------------------------------------------
router.get(
  "/roles",
  passport.authenticate("jwt", { session: false }),
  allowRoles("administrators"),
  function (req, res, next) {
    res.json({ ok: true });
  }
);
module.exports = router;
