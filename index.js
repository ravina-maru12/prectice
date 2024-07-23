const express = require("express");
const router = require("./routes/userRoutes");
const app = express();
const cookieParser = require('cookie-parser');
const path = require("path");

app.use(express.json());  //to parse json data
app.use(cookieParser()); //to parse cookie
app.use(express.urlencoded({extended: false}));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/", router);

app.listen("8080", ()=> {
    console.log("app is listening on port 8080");
});