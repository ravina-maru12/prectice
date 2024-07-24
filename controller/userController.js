const con = require("../database/db");
const bcrypt = require("bcrypt");
const generateToken = require("../middlewear/generateToken");
const multer = require("multer");
const { upload } = require("../middlewear/auth");
const { success } = require("../middlewear/response");

const test = (req, res) => {
    // console.log("app is running");
    // console.log(req.user);
    // res.send({ message: "App is working" });
    return success(req, res, "working", "data");
}

//insert
const register = async (req, res) => {
    try {
        const payload = req.body;

        let checkEmail = "SELECT * FROM user WHERE email=?";
        const data = new Promise((resolve, reject) => {
            con.query(checkEmail, payload.email, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    // console.log(result);
                    resolve(result);
                }
            })
        });

        let getEmail = await data;
        // console.log(getEmail.length);
        //Check that inseted email is exists or not
        if (getEmail.length > 0) {
            res.send({ "status": false, "message": "Email is already exists " });
        } else {
            let hashPassword = await bcrypt.hash(req.body.password, 10);
            // console.log(hashPassword);
            const { first_name, last_name, city, phone, email, password, gender, role } = req.body;
            const registerUser = `INSERT INTO user(first_name, last_name, city, phone, email, password, gender, role) VALUES(?,?,?,?,?,?,?,?)`;
            const data = con.query(registerUser, [first_name, last_name, city, phone, email, hashPassword, gender, role], (err, result) => {
                if (err) throw err;
                // console.log(result);
                if (result.affectedRows == 0) {
                    res.status(400).send({ "status": 400, "message": "Data not inserted " });
                } else {
                    // res.status(200).send({ "status": 200, "message": "Data inserted successfully" });
                    return success(req, res, "Data inserted successfully", data.values);
                }
            });
        }
    }
    catch (err) {
        console.log(err);
    }
}

//login
const login = async (req, res) => {
    const payload = req.body;

    if (!payload.email || !payload.password) {
        res.send("email and password is required");
    }
    //select data from database using email
    const q = `SELECT * FROM user where email = ?`;
    const data = new Promise((resolve, reject) => {
        con.query(q, payload.email, (err, result) => {
            if (0 < result.length) {
                resolve(result[0]);
            } else {
                res.status(404).json({ status: 404, message: "This User Is Not Found" });
            }
        });
    })
    let user = await data;

    //if data is not found
    if (!data) {
        res.send({ status: 400, message: "data and password is not exists" });
    } else {
        //payload.password ==> database password, user.password ==> password that passed from postman compare both password
        const checkpassword = await bcrypt.compare(payload.password, user.password);

        if (checkpassword) {
            const token = generateToken({ user });
            req.user = user;
            let updateId = req.user.id;
            let updateStatus = `UPDATE user SET status = '1' WHERE id = ${updateId}`;
            new Promise((resolve, reject) => {
                con.query(updateStatus, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            })
            let activeUser = req.user;
            //Login user's information is stored in cookie
            res.cookie("accessToken", token).send({ message: "User login successfully", token: token, activeUser });

        } else {
            res.send("password is incorrect");
        }
    }
}

//View user & check user is active or not
const viewUser = async (req, res) => {
    try {
        let viewUserToken = req.user.id;
        let viewUser = `SELECT * FROM user WHERE id = ${viewUserToken} AND status = '1'`;
        new Promise((resolve, reject) => {
            con.query(viewUser, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    //if user is active then 1>0 condition is true otherwise false
                    if (result.length > 0) {
                        // resolve(result);
                        res.send({ status: 200, message: "User is Active", data: result[0] });
                    } else {
                        res.send({ status: 400, message: "User is not Active" });
                    }
                }
            });
        });
    } catch (err) {
        console.log(err);
    }
}

//delete
const deleteUser = async (req, res) => {
    try {
        const payload = req.body;
        // console.log(payload.id);
        // const deleteToken = req.user.id;

        const deleteUser = `DELETE FROM emp where email=?`;
        new Promise((resolve, reject) => {
            con.query(deleteUser, payload.email, (err, result) => {
                if (err) {
                    res.send("not deleted");
                    reject(err);
                } else {
                    resolve(result);
                    res.send({ status: 200, message: "User is deleted" })
                }
            });
        })
    }
    catch (err) {
        console.log(err);
    }
}

//update  user using token
const updateUser = async (req, res) => {
    try {
        const payload = req.body;
        // let token = req.header("Authorization");
        // console.log(token);
        // console.log(updatedToken);

        // let d = jwt.decode(updatedToken, "abc111");
        // let editData = req.user.id;
        // console.log(editData);
        // return false;
        let editUser = `UPDATE user SET first_name = ? WHERE email = '${req.body.email}'`;
        new Promise((resolve, reject) => {
            con.query(editUser, payload.first_name, (err, result) => {
                if (err) {
                    res.send("not updated");
                    reject(err);
                } else {
                    resolve(result);
                    res.send({ status: 200, message: "Data updated Successfully" });
                }
            })
        });
    } catch (err) {
        console.log(err);
    }
}

//logout
const logout = (req, res) => {
    res.clearCookie("accessToken").status(400).send({ status: 400, message: "User logout Successfully" });
}

//for upload file using ejs
const selectFile = (req, res) => {
    res.render("home.ejs");
}

// //Roles and permissions
// const getUser = async (req, res) => {
//     let selectUser = "SELECT * FROM emp";
//     const user = new Promise((resolve, reject) => {
//         con.query(selectUser, (err, result) => {
//             if(err){
//                 reject()
//             }else{
//                 resolve(result);
//             }
//         })
//     });
//     let data = await user;
//     req.user = data;
//     // console.log(req.user);

// }

//for upload single file using multer
//for single file upload
const singleFile = upload.single('image');    //to upload single image

const singleFileUpload = (req, res) => {
    singleFile(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            res.status(400).json({ status: 400, message: "multiple file uploaded" });
        } else {
            res.status(200).json({ status: 200, message: "file uploaded successfully" });
        }
    })
}

//to upload multiple image using multer limit => 5
const multipleFile = upload.array('files', 5);

const uploadMultipleFile = (req, res) => {
    multipleFile(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            res.status(400).json({ status: 400, message: err.message });
        } else {
            res.status(200).json({ status: 200, message: "All file uploaded successfully" });
        }
    })
}

// const adminAccess = (req, res) => {
//     if (req.user.role == req.body.role) {
//         res.json({ message: 'You have access' });
//     } else {
//         res.send("not access");
//     }
// }

const getAllUser = async (req, res) => {
    try {
        let userAccess = "SELECT * FROM emp";
        const data = new Promise((resolve, reject) => {
            con.query(userAccess, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        })
        let user = await data;
        // console.log(user);
        res.send(user);
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    test,
    register,
    viewUser,
    deleteUser,
    updateUser,
    login,
    logout,
    selectFile,
    singleFileUpload,
    uploadMultipleFile,
    getAllUser
}

// const login = async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         if (!email || !password) {
//             res.send("email and password is required");
//         } else {
//             let data = req.body.email;
//             if (!data) {
//                 res.send("email not matched")
//             }
//             else {
//                 if (bcrypt.compare(await bcrypt.compare(password, data.password))) {
//                     let q5 = "SELECT * FROM user WHERE email = ?";
//                     con.query(q5, email, (err, result) => {
//                         if (err) throw err;
//                         console.log(result);
//                         const token = generateToken(data);
//                         console.log(token);
//                         res.cookie("accessToken", token).send("user login successfully");  //accessToken is cookie name
//                     });
//                     // const token = generateToken(data);
//                     // console.log(token);

//                 }
//             }
//             // bcrypt.compare(await bcrypt.compare(password, data.password));
//             // console.log(data);
//             // // return false;
//             // let q5 = "SELECT * FROM user WHERE email = ?";
//             // con.query(q5, email, (err, result) => {
//             //     if (err) throw err;
//             //     // console.log(result);
//             // });

//             // const token = generateToken(data);
//             // console.log(token);

//             // res.cookie("accessToken", token).send("user login successfully");  //accessToken is cookie name
//         }
//     }
//     catch (err) {
//         console.log(err);
//     }
// }