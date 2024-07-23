const mysql = require("mysql2");
// const express = require("express");
// const app = express();

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: "",
    database: 'my_project'
});

con.connect((err) => {
    if(!err){
        console.log("connected");
    } 
    else{
        console.log("not connected");
    }
});

module.exports = con;