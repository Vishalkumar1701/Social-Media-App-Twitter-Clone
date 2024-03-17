const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const protectedRoute = require('../Middleware/ProtectedRoute');

dotenv.config();
const userModel = mongoose.model('userModel');
const tweetModel = mongoose.model('tweetModel');
const router = express.Router();

//Get a single user details:
router.get('/api/user/:id', protectedRoute, async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await userModel.findById(userId)
            .select('_id name username email following followers createdAt updatedAt dob location profilepicture ')

        if (!user) {
            return res.status(404).json({ error: 'User Not Found' })
        }
        res.status(200).json({ success: 'true', user });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'some error occurred' })
    }
})

//edit User Details:
router.put('/api/user/:id', protectedRoute, async (req, res) => {
    try {
        const userId = req.params.id;
        const { name, dob, location } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'user not found' })
        }
        //to update user details:
        if (name) {
            user.name = name;
        }
        if (dob) {
            user.dob = dob;
        }
        if (location) {
            user.location = location;
        }
        await user.save();
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.log(error);
        return res.status(404).json({ error: 'some error occured' })
    }
})

//Route to follow user
router.put('/api/user/:id/follow', protectedRoute, async (req, res) => {
    try {
        const userId = req.user.id;
        const followUserId = req.params.id;
        const user = await userModel.findById(userId);
        const followUser = await userModel.findById(followUserId);
        if (!followUser || !user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (user.following.includes(followUserId)) {
            return res.status(400).json({ error: 'Already following this user' });
        }
        user.following.push(followUserId);
        followUser.followers.push(user);

        await user.save();
        await followUser.save();

        return res.status(200).json({ success: true, user: followUser });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Some error occured' })
    }
})

//Route to unfollow user
router.put('/api/user/:id/unfollow', protectedRoute, async (req, res) => {
    try {
        const userId = req.user.id;
        const unfollowUserId = req.params.id;

        const user = await userModel.findById(userId);
        const unfollowUser = await userModel.findById(unfollowUserId);

        if (!user || !unfollowUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (!user.following.includes(unfollowUserId)) {
            return res.status(400).json({ error: 'Not following this user' });
        }
        user.following.pull(unfollowUserId)
        unfollowUser.followers.pull(userId)

        await user.save();
        await unfollowUser.save();
        return res.status(200).json({ success: true, user: unfollowUser})
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Some error occured' })
    }
})

//Route to get user tweet
router.get('/api/user/:id/tweets', protectedRoute, async (req, res) => {
    try {
        const userId = req.params.id;

        const tweets = await tweetModel.find({ user: userId });
        return res.status(200).json({ Usertweets: tweets });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Some error occured' })
    }
})
module.exports = router