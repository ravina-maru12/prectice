// const multer = require("multer");
const userController = require("../controller/userController");
const router = require("express").Router();
const { verifyUser, authorizeRole } = require("../middlewear/auth");

router.get("/test", userController.test);
router.post("/register", userController.register);    //for register the user
router.get("/view", verifyUser, userController.viewUser);
router.delete("/delete", verifyUser, authorizeRole(['2']), userController.deleteUser);
router.patch("/update", verifyUser,authorizeRole(['1', '2']), userController.updateUser);
router.post("/login", userController.login);
router.post("/logout", verifyUser, userController.logout);
router.get("/home", userController.selectFile);
router.post("/upload", userController.singleFileUpload);
router.post("/multipleFile", userController.uploadMultipleFile);
router.get("/getAllUser", verifyUser, authorizeRole(['0','1', '2']), userController.getAllUser);
// router.get('/admin', verifyUser, authorizeRole('0'), userController.adminAccess);

module.exports = router;