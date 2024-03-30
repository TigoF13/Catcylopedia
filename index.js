const express = require("express");
const app = express();

const port = 3000;

app.set("view engine", "ejs");

// static

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index.ejs", {title : "Catcyclopedia"})
})

app.get("/adopt", (req, res) => {
    res.render("adopt.ejs", {title : "Catcyclopedia"})
})
app.get("/register", (req, res) => {
    res.render("register.ejs", {title : "Catcyclopedia"})
})

app.listen(port, () => {
    console.log(`Webserver app listening on port ${port}`);
})