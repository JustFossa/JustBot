const express = require('express');
const app = express();
const path = require('path');
const port = process.env.PORT || 8080;




app.send("EZ")


app.listen(port, () => {
    console.log(`Ready!`)
})