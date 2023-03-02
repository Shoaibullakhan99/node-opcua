const express = require('express')
const bodyParser = require('body-parser')
const app = express();

app.listen(3000, ()=> {
    console.log("Live and listening on port 3000");
})

app.use(express.static(__dirname));

app.get("/", (req,res) => {
    res.sendFile(__dirname + "/index.html");
});
