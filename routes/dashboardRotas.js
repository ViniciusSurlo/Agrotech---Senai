const express = require('express')
const router = express.Router()
const BD = require('../db')

router.get("/", (req,res) =>{
    res.render("admin/realdshboard")
})

module.exports = router