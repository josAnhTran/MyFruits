const URL_DATA_SERVER = "mongodb://127.0.0.1:27017/";
const URL_APP_SERVER = "mongodb://127.0.0.1:27017/online-shop";
const PATH_FOLDER_PUBLIC = "./public";
const PATH_FOLDER_IMAGES = "/images";
const FOLDER_INITIATION = "initiation";
const COLLECTION_CATEGORIES = "categories";
const COLLECTION_SUPPLIERS = "suppliers";
const COLLECTION_PRODUCTS = 'products';
const COLLECTION_EMPLOYEES = 'employees';
const COLLECTION_ORDERS = 'orders';
const COLLECTION_USER = "users";
const JWT_SETTING = {
  SECRET: "ADB57C459465E3ED43C6C6231E3C9",
  AUDIENCE: "client",
  ISSUER: "online_shop",
};
// module.exports = {
//     SECRET: 'ADB57C459465E3ED43C6C6231E3C9',
//     AUDIENCE: 'aptech.io',
//     ISSUER: 'softech.cloud',
//   };
module.exports = {
  URL_DATA_SERVER,
  URL_APP_SERVER,
  PATH_FOLDER_PUBLIC,
  PATH_FOLDER_IMAGES,
  FOLDER_INITIATION,
  COLLECTION_CATEGORIES,
  COLLECTION_SUPPLIERS,
  COLLECTION_PRODUCTS,
  COLLECTION_EMPLOYEES,
  COLLECTION_ORDERS,
  COLLECTION_USER,
  JWT_SETTING,
};
