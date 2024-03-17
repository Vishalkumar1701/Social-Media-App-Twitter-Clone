import React, { useEffect, useState, Fragment } from 'react'
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import './Hometweet.scss'
import user from '../asserts/user.png'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios'
import { Link } from 'react-router-dom'


const Hometweet = () => {

    //GETTING USER DETAILS FROM LOCAL STORAGE :
    const loggedInUser = localStorage.getItem("user");
    const loggedInUserObj = JSON.parse(loggedInUser);
    const stateId = loggedInUserObj._id

    //MODEL TO SHOW BOX OF CREATE TWEET
    const [showTweet, setShowTweet] = useState(false);
    const handleTweetClose = () => setShowTweet(false);
    const handleTweetShow = () => setShowTweet(true);

    //MODEL TO SHOW BOX OF COMMENTS
    const [showComment, setShowComment] = useState(false);
    const handlecommentClose = () => setShowComment(false);
    const [replyContent, setReplyContent] = useState('');
    const [currentTweetID, setCurrentTweetId] = useState(null);

    //IMAGE 
    const [content, setContent] = useState("");
    const [image, setImage] = useState({ preview: '', data: '' })

    const [alltweet, setAlltweets] = useState([]);

    const CONFIG_OBJ = {
        headers: {
            "Content-type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token")
        }
    }

    //UPLOAD IMAGE
    const handleFileSelect = (event) => {
        const img = {
            preview: URL.createObjectURL(event.target.files[0]),
            data: event.target.files[0]
        }
        setImage(img);
    }
    const handleImgUpload = async () => {
        let formData = new FormData();
        formData.append('file', image.data);

        try {
            const response = await axios.post('http://localhost:4000/uploadFile', formData)
            return response.data
        } catch (error) {
            toast.error('error whiole uploading the image')
        }
    }


    //CREATE TWEET
    const createTweet = async () => {
        if (content === "") {
            return;
        }
        let imageRes = null;
        if (image.data) {
            imageRes = await handleImgUpload();
            if (!imageRes) {
                return;
            }
        }
        const requestData = {
            image: imageRes ? `http://localhost:4000/files/${imageRes.fileName}` : null,
            content,
        }

        axios.post('http://localhost:4000/api/tweet', requestData, CONFIG_OBJ)
            .then((result) => {
                toast.success('Tweet posted Successfully')
                setContent('');
                setImage({ preview: '', data: '' });
                handleTweetClose();
                getAllPosts();
            }).catch((error) => {
                console.log(error);
                toast.error('error while posting this tweet')
            })
    }

    //VIEW ALL POSTS
    const getAllPosts = async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/tweet');
            if (response.status === 200) {
                setAlltweets(response.data.tweets);
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
    }, [])

    //LIKE OR DISLIKE A TWEET
    const likeDislikePost = async (postId, isLiked) => {
        try {
            const type = isLiked ? 'dislike' : 'like';
            const response = await axios.post(`http://localhost:4000/api/tweet/${postId}/${type}`, {}, CONFIG_OBJ);
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

    //DELETE A POST
    const deletePost = async (postId) => {
        try {
            const response = await axios.delete(`http://localhost:4000/api/tweet/${postId}`, CONFIG_OBJ);
            if (response.status === 200) {
                toast.success('Tweet Deleted')
                getAllPosts();
            }
        } catch (error) {
            console.log(error);
            toast.error('Tweet cannot be deleted, please try again later')
        }
    }


    return (
        <>
            <ToastContainer />
            <div className="tweet-con">
                <div className="topbar d-flex justify-content-between mx-4 mb-2 mt-4">
                    <h4>Home</h4>
                    <button type="button"
                        className="btn btn-primary px-5"
                        onClick={handleTweetShow}>
                        Tweet
                    </button>
                </div>

                {/* Tweet  */}
                {alltweet.map((tweet) => {
                    const isLiked = tweet.likes.includes(stateId);
                    return (
                        <div key={tweet._id} className="tweetbox border border-secondary-light mb-1">
                            <div className="tweetcard">
                                <div className="firstbar">
                                    {tweet.retweetBy.length > 0 ? <p><i className="fa-solid fa-retweet me-2"></i>Retweeted By {
                                        tweet.retweetBy.length > 0 ? (
                                            <Link className='text-dark link-underline link-underline-opacity-0' to={`/home/profilepage/${tweet.retweetBy[0].users._id}`}>
                                                {tweet.retweetBy[0].users.name}
                                            </Link>
                                        ) : ''
                                    } {tweet.retweetBy.length > 1 && (<p>and {tweet.retweetBy.length - 1} Others</p>)}</p> : ''}
                                </div>
                                <div className="secondbar d-flex justify-content-between">
                                    <div className="leftside d-flex gap-2">
                                        <div className="profilepic rounded-circle" style={{ backgroundColor: 'lightgrey' }}>
                                            <img
                                                className='bg-primary rounded-circle'
                                                style={{ objectFit: 'cover' }}
                                                src={tweet.tweetedBy && tweet.tweetedBy.profilepicture ? `http://localhost:4000/files/${tweet.tweetedBy.profilepicture}` : user}
                                                alt=""
                                                height={50}
                                                width={50}
                                            />
                                        </div>
                                        <div className="username">
                                            @< Link className='text-dark link-underline link-underline-opacity-0 text-bold fw-bold' to={tweet.tweetedBy._id !== stateId ? "/home/profilepage/" + tweet.tweetedBy._id : "/home/profilepage"}>
                                                {tweet.tweetedBy.username}
                                            </Link>
                                        </div>
                                        <div className="createdAt">
                                            -{tweet.createdAt.slice(0, 10)}
                                        </div>
                                    </div>
                                    {/* delete icon */}
                                    {
                                        tweet.tweetedBy._id == stateId ?
                                            <div className="rightside pe-5">
                                                <i
                                                    onClick={() => deletePost(tweet._id)}
                                                    className="fa-solid fa-trash-can"></i>
                                            </div> : ''
                                    }

                                </div>
                                <Link to={`/home/hometweet/${tweet._id}`} className='text-dark link-underline link-underline-opacity-0'>
                                    <div className="thirdbar ps-5 pt-2">
                                        <p>{tweet.content}</p>
                                    </div>
                                    {
                                        tweet.image && (
                                            <div className="fourthbar ps-5 rounded" style={{ width: '600px', height: '400px' }}>
                                                <img className='' src={tweet.image} alt="Post Image" style={{ objectPosition: 'left', objectFit: 'contain' }} width={800} height={400} />
                                            </div>
                                        )
                                    }</Link>

                                {/* functional-icons  */}
                                <div className="functions_icons mt-3 ps-5">
                                    <i className="fa-regular fa-heart me-3"
                                        onClick={() => likeDislikePost(tweet._id, isLiked)}><span className='ms-1 '>{tweet.likes.length}</span></i>

                                    <i className="fa-regular fa-comment me-3" onClick={() => handlecommentShow(tweet._id)}><span className='ms-1'>{tweet.replies.length}</span></i>

                                    <i className="fa-solid fa-retweet me-3"
                                        onClick={() => retweetPost(tweet._id)}
                                    ><span className='ms-1'>{tweet.retweetBy.length}</span></i>
                                </div>
                            </div>
                            {/*---------------- Replies----------- */}
                            {
                                tweet.replies.length > 0 && (
                                    <div className="replies-section">
                                        <p className='fw-bold'>Replies</p>
                                        {tweet.replies.slice(0, 1).map((reply, index) => (
                                            <Fragment key={reply.replyBy._id}>
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
                                            <p>{tweet.replies.length - 1} more replies(click on tweet content to view more replies)</p>
                                        )}
                                    </div>
                                )
                            }
                        </div>
                    )
                })}
            </div >

            {/* post a new tweet modal  */}
            < Modal
                show={showTweet}
                onHide={handleTweetClose}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>New Tweet</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <textarea className="form-control"
                        value={content}
                        onChange={(ev) => setContent(ev.target.value)}
                        placeholder="Write your tweet"
                    ></textarea>
                    <label htmlFor="image-upload"><i className="fa-regular fa-image"></i></label>
                    <input type="file" name="file" id='image-upload' accept='.jpg,.png,.jpeg,.gif' style={{ display: 'none' }}
                        onChange={handleFileSelect} />
                    <div className='imagePreviewArea'>
                        {image.preview && <img src={image.preview} style={{ width: '100%' }} height={250} />}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleTweetClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={() => createTweet()} >Tweet</Button>
                </Modal.Footer>
            </Modal >

            {/* comment modal  */}
            < Modal
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
            </Modal >
        </>
    )
}

export default Hometweet
