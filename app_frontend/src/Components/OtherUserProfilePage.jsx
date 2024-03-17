import React, { useState, useEffect, Fragment } from 'react';
import { useParams } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import './ProfilePage.scss';
import user from '../asserts/user.png'
import axios from 'axios'
import Modal from 'react-bootstrap/Modal'
import { Link } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify';

const OtherUserProfilePage = () => {

    //USER DATA
    const [userData, setUserData] = useState({});

    //USER TWEET
    const [userTweet, setUserTweet] = useState([]);

    //FOLLOW OR UNFOLLOW USER
    const [isFollowing, setIsFollowing] = useState(false);

    //MODEL TO SHOW BOX OF COMMENTS
    const [showComment, setShowComment] = useState(false);
    const handlecommentClose = () => setShowComment(false);
    const [replyContent, setReplyContent] = useState('');
    const [currentTweetID, setCurrentTweetId] = useState(null);


    const { userId } = useParams();

    const loggedInUser = localStorage.getItem("user");
    const loggedInUserObj = JSON.parse(loggedInUser);
    const stateId = loggedInUserObj._id;



    const CONFIG_OBJ = {
        headers: {
            "Content-type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token")
        }
    }

    //FETCH USER USING USERID FROM PARAMS
    const fetchData = async () => {
        try {
            const loggedInUserId = stateId;
            const response = await axios.get(`http://localhost:4000/api/user/${userId}`, CONFIG_OBJ);
            setUserData(response.data.user);
            const isUserFollowing = response.data.user.followers.includes(loggedInUserId);
            setIsFollowing(isUserFollowing)

        } catch (error) {
            console.log('Error fetching user data:', error);
        }
    };
    useEffect(() => {
        if (userId) {
            fetchData()
        }
    }, [userId])

    //GET USER TWEETS
    const getAllPosts = async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/tweet');
            console.log(response);
            if (response.status === 200) {
                const allTweets = response.data.tweets;

                const userTweets = allTweets.filter((tweet) => {
                    return tweet.tweetedBy._id === userId;
                });
                setUserTweet(userTweets);
            }
            else {
                toast.error('cannot retrive all the tweet.')
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occured while fetching tweets.')
        }
    };

    useEffect(() => {
        getAllPosts();
    }, [userId])

    //LIKE OR DISLIKE A TWEET
    const likeDislikePost = async (postId, isLiked) => {
        try {
            const type = isLiked ? 'dislike' : 'like';
            const response = await axios.post(`http://localhost:4000/api/tweet/${postId}/${type}`, {}, CONFIG_OBJ);
            console.log(response);
            if (response.status === 200) {
                toast.success(`Post ${type === 'like' ? 'liked' : 'dislike'} successfully`);
                getAllPosts();
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                if (error.response.data.message === 'You already liked this tweet') {
                    return likeDislikePost(postId, true);
                } else {
                    console.log(error);
                    toast.warning('some error occured');
                }
            }
        }
    }

    //Follow an user
    const followUser = async (userId) => {
        try {
            const response = await axios.put(`http://localhost:4000/api/user/${userId}/follow`, {}, CONFIG_OBJ);
            console.log(response)

            if (response.data.success) {
                setIsFollowing(true);
                fetchData();
                toast.success("Followed");
            } else {
                toast.error('follow operation failed');
            }
        } catch (error) {
            console.log(error.response)
            toast.error('Some follow error occured');
        }
    }

    const unFollowUser = async () => {
        try {
            const response = await axios.put(`http://localhost:4000/api/user/${userId}/unfollow`, {}, CONFIG_OBJ);

            if (response.data.success) {
                setIsFollowing(false);
                fetchData();
                toast.success("Unfollowed");
            } else {
                toast.error('Unfollow operation failed');
            }
        } catch (error) {
            console.log(error)
            toast.error('Some unfollow error occured');
        }
    }
    //REPLY TO A TWEET
    const replyTweet = async (postId) => {
        try {
            const requestData = { content: replyContent }
            const response = await axios.post(`http://localhost:4000/api/tweet/${postId}/reply`, requestData, CONFIG_OBJ);
            console.log(response)
            if (response.status === 200) {
                toast.success('Reply posted succesfully');
                setReplyContent('');
                getAllPosts();
                handlecommentClose();
            }
        } catch (error) {
            console.log(error)
            toast.error('Please try again later');
        }
    }
    const handlecommentShow = (tweetId) => {
        setCurrentTweetId(tweetId);
        setShowComment(true);
    };

    //RETWEET POST
    const retweetPost = async (postId) => {
        try {
            const response = await axios.post(`http://localhost:4000/api/tweet/${postId}/retweet`, {}, CONFIG_OBJ);
            if (response.status === 200) {
                toast.success('Tweet retweeted');
                getAllPosts();
            }
        } catch (error) {
            console.log(error);
            toast.warning('some error occured while retweeting');
        }
    }



    return (
        <div className="profilepage mt-3">
            <ToastContainer />
            <header>
                <h4>Profile</h4>
            </header>
            <div className="userInfo">
                <div className="banner bg-primary mb-3">

                </div>
                <div className="userPic d-flex justify-content-between px-3">
                    <div className="userImage">
                        <img
                            className='bg-light rounded-circle'
                            style={{ objectFit: 'cover' }}
                            src={userData && userData.profilepicture ? `http://localhost:4000/files/${userData.profilepicture}` : user}
                            alt=""
                            height={150} width={150}
                        />
                    </div>

                    <div className="btns">
                        {isFollowing ? <button className='btn btn-dark float-end'
                            onClick={() => unFollowUser(userId)}> Unfollow
                        </button> : <button className='btn btn-dark float-end'
                            onClick={() => followUser(userId)}> Follow
                        </button>}
                    </div>
                </div>

                <div className="userDetails mt-4">
                    <h4 className='fullName'>{userData && userData.name}</h4>
                    <h6 className='userName'>@{userData && userData.username}</h6>
                    <h6 className='email'>{userData && userData.email}</h6>


                    <p className='dobLoc'>
                        <span className='dob'><i className=" me-1 fa-solid fa-cake-candles"></i> {userData && userData.dob ? userData.dob.slice(0, 10) : "Enter your date of birth"}</span>
                        <span className='loc'><i className=" me-1 ms-5 fa-solid fa-location-dot"></i>{userData && userData.location ? userData.location : "Enter location"}</span>

                    </p>

                    <p className='joinedDate'><i className="fa-regular fa-calendar"></i><span className='ms-2'>Joined {userData && userData.createdAt ? userData.createdAt.slice(0, 10) : ""}</span></p>
                </div>

                <div className="followCount d-flex gap-5">
                    <div className="following fw-bold"><span className='me-2'>{userData && userData.following ? userData.following.length : 0}</span><span>Following</span></div>
                    <div className="followers fw-bold"><span className='me-2'>{userData && userData.followers ? userData.followers.length : 0}</span><span>Followers</span></div>
                </div>
            </div>

            <div className="tweetsReplies my-4 text-center">
                <h5>Tweets And Replies</h5>
            </div>
            <div className="tweetDisplay">
                {userTweet.map((tweet) => {
                    const isLiked = tweet.likes.includes(userId);
                    return (
                        <div key={tweet._id} className="tweetbox border border-secondary-light mb-1">
                            <div className="tweetcard">
                                <div className="firstbar" style={{ marginBottom: '-10px' }}>

                                    <p className=''><i className="fa-solid fa-retweet me-2"></i>Retweeted By {
                                        tweet.retweetBy.length > 0 ? (
                                            <Link className='text-dark link-underline link-underline-opacity-0' to={`/home/profilepage/${tweet.retweetBy[0].users._id}`}>
                                                {tweet.retweetBy[0].users.name}
                                            </Link>
                                        ) : 'none'
                                    } {tweet.retweetBy.length > 1 && (<p>and {tweet.retweetBy.length - 1} Others</p>)}</p>
                                </div>
                                <div className="secondbar d-flex justify-content-between">
                                    <div className="leftside d-flex gap-2">
                                        <div className="profilepic rounded-circle" style={{ backgroundColor: 'lightgrey' }}>
                                            <img
                                                className='rounded-circle'
                                                style={{ objectFit: 'cover' }}
                                                src={tweet.tweetedBy && tweet.tweetedBy.profilepicture ? `http://localhost:4000/files/${tweet.tweetedBy.profilepicture}` : user}
                                                alt=""
                                                height={50}
                                                width={50}
                                            />
                                        </div>
                                        <div className="username">
                                            @{tweet.tweetedBy.username}
                                        </div>
                                        <div className="createdAt">
                                            -{tweet.createdAt.slice(0, 10)}
                                        </div>
                                    </div>
                                    {/* delete icon */}
                                    {
                                        tweet.tweetedBy._id == userId ?
                                            <div className="rightside pe-5">
                                                <i
                                                    onClick={() => deletePost(tweet._id)}
                                                    className="fa-solid fa-trash-can"></i>
                                            </div> : ''
                                    }
                                </div>
                                <div className="thirdbar ps-5 pt-2">
                                    <p>{tweet.content}</p>
                                </div>
                                {
                                    tweet.image && (
                                        <div className="fourthbar ps-5 rounded" style={{ width: '600px', height: '400px' }}>
                                            <img className='' src={tweet.image} alt="Post Image" style={{ objectPosition: 'left', objectFit: 'contain' }} width={800} height={400} />
                                        </div>
                                    )
                                }

                                {/* functional-icons  */}
                                <div className="functions_icons mt-3 ps-5">
                                    <i className="fa-regular fa-heart me-3"
                                        onClick={() => likeDislikePost(tweet._id, isLiked)}><span className='ms-1'>{tweet.likes.length}</span></i>




                                    <i className="fa-regular fa-comment me-3" onClick={() => handlecommentShow(tweet._id)}><span className='ms-1'>{tweet.replies.length}</span></i>

                                    <i className="fa-solid fa-retweet me-3"
                                        onClick={() => retweetPost(tweet._id)}
                                    ><span className='ms-1'>{tweet.retweetBy.length}</span></i>
                                </div>
                            </div>
                            {/*---------------- Replies----------- */}
                            {tweet.replies.length > 0 && (
                                <div className="replies-section">
                                    <p className='fw-bold'>Replies</p>
                                    {tweet.replies.map((reply, index) => (
                                        <Fragment key= {reply.replyBy._id}>
                                            <div className="reply d-flex">
                                                <div className="profilepic rounded-circle" style={{ backgroundColor: 'lightgrey' }}>
                                                    <img
                                                        className='rounded-circle'
                                                        style={{ objectFit: 'cover' }}
                                                        src={reply.replyBy && reply.replyBy.profilepicture ? `http://localhost:4000/files/${reply.replyBy.profilepicture}` : user}
                                                        alt=""
                                                        height={50}
                                                        width={50}
                                                    />
                                                </div>
                                                <div className="username">
                                                    @<Link className='text-dark link-underline link-underline-opacity-0' to={`/home/profilepage/${reply.replyBy._id}`}>
                                                        {reply.replyBy.username}
                                                    </Link>
                                                </div>
                                            </div>
                                            <div className="reply-content ps-5" key={index}>
                                                {reply.content}
                                            </div>
                                        </Fragment>
                                    ))}
                                    {tweet.replies.length > 1 && (
                                        <p>{tweet.replies.length - 1} more replies...</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* comment modal  */}
            <Modal
                show={showComment}
                onHide={handlecommentClose}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Tweet your reply</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <textarea className="form-control"
                        placeholder="Add your reply"
                        value={replyContent}
                        onChange={(ev) => setReplyContent(ev.target.value)}></textarea>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handlecommentClose}>
                        Close
                    </Button>
                    <Button variant="primary"
                        onClick={() => replyTweet(currentTweetID)}>Reply</Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default OtherUserProfilePage;
