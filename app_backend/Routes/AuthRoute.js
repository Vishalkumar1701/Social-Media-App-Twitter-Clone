const express = require('express');
const mongoose = require('mongoose');
const userModel = mongoose.model('userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

const router = express.Router();
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

//register Api :
router.post('/API/auth/register', (req, res) => {
    const { name, email, username, password } = req.body;
    if (!name || !email || !username || !password) {
        return res.status(400).json({ error: "one or more manditory fields are empty" });
    }
    userModel.findOne({ email, username })
        .then((userInDb) => {
            if (userInDb) {
                return res.status(500).json({ error: "User already registered" })
            }
            bcrypt.hash(password, 16)
                .then((hashedPassword) => {
                    const newUser = new userModel({
                        name,
                        email,
                        username,
                        password: hashedPassword
                    });
                    newUser.save()
                    res.status(201).json({ result: "User Registered Sucessfully" });
                });
        })
        .catch((error) => {
            console.log(error);
        })
})

//Login api : 
router.post('/API/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "one or more fields are empty" });
    }
    userModel.findOne({ username: username})
        .then((userInDb) => {
            if (!userInDb) {
                return res.status(401).json({ error: "Invalid Credential" });
            }
            bcrypt.compare(password, userInDb.password)
                .then((passwordMatched) => {
                    if (passwordMatched) {
                        const jwtToken = jwt.sign({_id : userInDb._id},JWT_SECRET);
                        const userInfo = {
                            "_id": userInDb._id,
                            'email' : userInDb.email,
                            'fullname' : userInDb.name,
                            'username' : userInDb.username
                        }
                        res.status(200).json({ result : {
                            token : jwtToken,
                            user : userInfo
                        }});
                    } else{
                        res.status(401).json({error : "Invalid Credentials"});
                    }
                }).catch((error)=>{
                    console.log(error);
                })
        })
        .catch((error)=>{
            console.log(error);
        })
});

module.exports = router;