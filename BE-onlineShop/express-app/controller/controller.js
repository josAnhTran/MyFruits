// const fs = require("fs");

// const removeFile = (req, res) => {
//   const fileName = req.params.name;
//   const directoryPath = "./public/images/categories/firstTimeCreate/file-1666607023338.jpeg";
//   // const directoryPath = __basedir + "/BE-onlineShop/express-app/public/images/categories/firstTimeCreate/file-1666605538771.jpeg";

//   // fs.unlink(directoryPath + fileName, (err) => {
//     fs.unlink(directoryPath, (err) => {
//     if (err) {
//       res.status(500).send({
//         message: "Could not delete the file. " + err,
//       });
//     }

//     res.status(200).send({
//       message: "File is deleted.-- ok",
//     });
//   });
// };

// // const removeSyncFile = (req, res) => {
// //   // const fileName = req.params.name;
// //   const {fileName} = req.body
// //   console.log({request: fileName})
// //   const directoryPath = "./public/images/categories/firstTimeCreate/";
// //   // const directoryPath = __basedir + "/resources/static/assets/uploads/";

// //   try {
// //     fs.unlinkSync(directoryPath + fileName);
// //     // fs.unlinkSync(directoryPath);

// //     res.status(200).send({
// //       message: "File is deleted. hoho",
// //     });
// //   } catch (err) {
// //     res.status(500).send({
// //       message: "Could not delete the file. " + err,
// //     });
// //   }
// // };

// const removeSyncFile = (directoryPath) => {
  
//   try {
//     fs.unlinkSync(directoryPath);
//     res.status(200).send({
//       message: "File is deleted. hoho",
//     });
//   } catch (err) {
//     res.status(500).send({
//       message: "Could not delete the file. " + err,
//     });
//   }
// };

// module.exports = {
//   removeFile,
//   removeSyncFile,
// };