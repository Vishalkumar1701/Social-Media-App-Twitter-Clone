const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const UserModel = new mongoose.Schema({
    name: {
        type: String,
        required : true
    },
    username : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    profilepicture : {
        type : String,
    },
    location : {
        type : String,
    },
    dob : {
        type : Date,
    },
    followers : [
        {
            type : ObjectId,
            ref : "userModel",
        }
    ],
    following : [
        {
            type : ObjectId,
            ref : "userModel"
        }
    ]
},{
    timestamps : true
})

mongoose.model("userModel",UserModel);