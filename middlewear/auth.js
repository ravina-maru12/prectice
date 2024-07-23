const jwt = require("jsonwebtoken");
const secretKey = 'abc111';
const con = require("../database/db");
const multer = require('multer');

const verifyUser = (req, res, next) => {
  try {
    let token = req.header("Authorization");
    let verToken = token.slice(7);
    jwt.verify(verToken, secretKey, async (err, decoded) => {
      if (err) {
        res.json({
          message: "Token is not verified",
          err
        });
      }
      else {
        //to decode data from token
        const decoded = jwt.decode(verToken, 'abc111');
        const getUser = `SELECT * FROM user WHERE id = ?`;

        //declare one time Promise and use any where
        const data = new Promise((resolve, reject) => {
          con.query(getUser, decoded.data.user.id, (err, result) => {
            if (err) {
              reject(err)
            } else {
              // console.log(result)
              //if any record is find then condition is true
              if (0 < result.length) {
                resolve(result[0]);
              } else {
                res.status(404).json({ status: 404, message: "This User Is Not Found" })
              }
            }
          });
        })
        let user = await data;
        req.user = user;
        console.log(req.user);
      }
      next();
    });
  }
  catch (err) {
    console.log(err);
    res.send("{message: Token is not defined}");
  }
}

// const upload = multer({ dest: 'uploads/' });

//when you want to display the image using multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    return cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    return cb(null, `${Date.now}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });   //image is the filed name

// Middleware for role-based authorization
const authorizeRole = ([...roles]) => {
  return (req, res, next) => {
    // console.log(req.user.role);
    //req.user.role => database role
    for (let role of roles) {
      if (req.user.role === role) {
        console.log("access the data");
        next();
      } else {
        // console.log("Can't access");
        res.send({ status: 400, message: "Access denied" });
      }
    }
    // return false;
  }
}

module.exports = {
  verifyUser,
  upload,
  authorizeRole
};