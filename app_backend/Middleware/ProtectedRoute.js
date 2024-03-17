const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const userModel = mongoose.model("userModel");

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (req,res,next) =>{
    const {authorization} = req.headers;
    if(!authorization){
        return res.status(401).json({error : 'User not logged in'});
    }
    const token = authorization.replace("Bearer ", "");
    jwt.verify(token, JWT_SECRET, (error,payload) =>{
        if(error){
            return res.status(401).json({error : "user not logged in"});
        }
        const {_id} = payload;
        userModel.findById(_id).then((dbUser)=>{
            req.user = dbUser;
            next();
        })
    })
}