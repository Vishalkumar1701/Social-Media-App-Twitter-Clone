const express = require('express');
const mongoose = require('mongoose');
const protectedRoute = require('../Middleware/ProtectedRoute');

const router = express.Router();
const tweetModel = mongoose.model('tweetModel');
// const userModel = mongoose.model('userModel');

// Route to create a tweet 
router.post('/api/tweet', protectedRoute, async (req, res) => {
    try {
        const {image, content } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'Content not found' });
        }
        const newTweet = new tweetModel({
            image,
            content,
            tweetedBy: req.user._id,
        })
        await newTweet.save();
        res.status(200).json({ tweet: newTweet });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Some error occured' });
    }
})

//Route to like a tweet
router.post('/api/tweet/:id/like', protectedRoute, async (req, res) => {
    try {
        const tweetId = req.params.id;
        const tweet = await tweetModel.findById(tweetId);
        if (!tweet) {
            return res.status(404).json({ error: 'Tweet not found' })
        }
        if (tweet.likes.includes(req.user._id)) {
            return res.status(400).json({ message: 'You already liked this tweet' })
        }
        tweet.likes.push(req.user._id);
        await tweet.save();
        res.status(200).json({ success: 'true', tweet });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Some error occured' })
    }
})

//Route to dislike a tweet
router.post('/api/tweet/:id/dislike', protectedRoute, async (req, res) => {
    try {
        const tweetId = req.params.id;
        const userId = req.user.id;

        const result = await tweetModel.findByIdAndUpdate(tweetId, {$pull: {likes: userId}});

        if(!result){
            return res.status(404).json({error : 'tweet not found'});
        }
        res.status(200).json({success: result});
    }catch(error){

    }
})
//Reply on a tweet
router.post('/api/tweet/:id/reply', protectedRoute, async (req, res) => {
    try {
        const tweetId = req.params.id;
        const { content } = req.body;

        const tweet = await tweetModel.findById(tweetId);
        if (!tweet) {
            return res.status(404).json({ error: 'Tweet not found' });
        }
        const replyTweet = {
            content: content,
            replyBy: req.user._id,
        };
        tweet.replies.push(replyTweet);
        await tweet.save();
        res.status(200).json({success : replyTweet });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Some error Occured' })
    }
})

//Get a single tweet details :
router.get('/api/tweet/:id',protectedRoute ,async(req,res)=>{
    try{
        const tweetId = req.params.id;

        const tweet = await tweetModel.findById(tweetId)
        .populate('tweetedBy replies.replyBy').exec();
        
        if(!tweet){
            return res.status(400).json({error : 'tweet not found'});
        }
        res.status(200).json({tweet : tweet})
    }catch(error){
        console.log(error);
        return res.status(500).json({error : 'Some error occured'})
    }
})

//Get all tweet details : 
router.get('/api/tweet',async(req,res)=>{
    try{
        const tweets = await tweetModel.find()
        .sort({createdAt: -1})
        .populate({
            path: 'tweetedBy likes retweetBy.users replies.replyBy',
            select : '-password',
        }).exec();

        res.status(200).json({tweets : tweets});
    }catch(error){
        console.log(error);
        return res.status(500).json({error : 'Some error occured'})
    }
})

//retweet a post
router.post('/api/tweet/:id/retweet',protectedRoute,async(req,res)=>{
    try{
        const tweetId = req.params.id;
        const tweet = await tweetModel.findById(tweetId);

        if(!tweet){
            return res.status(404).json({error : 'Tweet not found'});
        }
        if(tweet.retweetBy.some(user => user.users.equals(req.user._id))){
            return res.status(400).json({error : 'you have already retweeted'});
        }
        tweet.retweetBy.push({ users: req.user._id});
        await tweet.save();
        res.status(200).json({tweet: tweet});
    }catch(error){
        console.log(error);
        return res.status(500).json({error : 'Some error occured'})
    }
})

//delete a tweet
router.delete('/api/tweet/:id',protectedRoute,async(req,res)=>{
    try{
        const tweetId = req.params.id

        const tweet = await tweetModel.findById(tweetId)
        if(!tweet){
            return res.status(404).json({error : 'Tweet not found'});
        }
        if(!tweet.tweetedBy || req.user._id.toString() !== tweet.tweetedBy.toString()){
            return res.status(403).json({error : 'You dont have permission to delete this tweet'})
        }
        await tweetModel.deleteOne({_id : tweetId});
        res.status(200).json({message : 'tweet deleted successfully'})
    }catch(error){
        console.log(error);
        return res.status(500).json({error : 'Some error occured'});
    }
})

module.exports = router;