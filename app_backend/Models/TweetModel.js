const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types;

const TweetModel = new mongoose.Schema({
    content : {
        type : String,
        required : true
    },
    tweetedBy : {
        type : ObjectId,
        ref : "userModel",
        required : true
    },
    likes : [
        {
            type : ObjectId,
            ref : "userModel"
        }
    ],
    retweetBy : [{
        users : {
            type : ObjectId,
            ref : 'userModel'
        }
    }],
    image : {
        type : String,
    },
    replies :[
        {
            content : String,
            replyBy : {
                type : ObjectId,
                ref : 'userModel',
                required: true,
            }
        }
    ],
    author: {
        type: ObjectId,
        ref: "userModel"
    }
},{
    timestamps : true
});

mongoose.model('tweetModel', TweetModel);