const { upload } = require("./auth");
const singleFile = upload.single('image');

const errorHandler = (req, res) => {
    singleFile(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            res.status(400).json({ status: 400, message: "multiple file uploaded" });
        }
        else {
            res.status(200).json({ status: 200, message: "file uploaded successfully" });
        }
    })
}

module.exports = { errorHandler };