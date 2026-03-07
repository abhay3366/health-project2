const express = require("express");
const app = express();


require('dotenv').config();

const PORT = process.env.PORT || 5001;

// auth



app.get("/", (req, res) => {
    res.send("connected to database");
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
});