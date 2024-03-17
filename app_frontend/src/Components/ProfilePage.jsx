import React, { useState, useEffect, Fragment } from 'react';
import './ProfilePage.scss';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import user from '../asserts/user.png'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify';

const ProfilePage = () => {

  //EDIT MODAL BOX
  const [showEdit, setShowEdit] = useState(false);
  const handleCloseEdit = () => setShowEdit(false);
  const handleShowEdit = () => setShowEdit(true);

  //PROFILE PICTURE MODAL BOX
  const [showPic, setShowPic] = useState(false);
  const handleClosePic = () => setShowPic(false);
  const handleShowPic = () => setShowPic(true);

  //USER DATA
  const [userData, setUserData] = useState({});

  //STATES FOR FORM INPUTS
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [dob, setDob] = useState('');

  //USER TWEET
  const [userTweet, setUserTweet] = useState([]);

  //MODEL TO SHOW BOX OF COMMENTS
  const [showComment, setShowComment] = useState(false);
  const handlecommentClose = () => setShowComment(false);
  const [replyContent, setReplyContent] = useState('');
  const [currentTweetID, setCurrentTweetId] = useState(null);

  //Profile Image
  const [image, setImage] = useState({ preview: '', data: '' })

  const loggedInUser = localStorage.getItem("user");
  const loggedInUserObj = JSON.parse(loggedInUser);
  const userId = loggedInUserObj._id

  const CONFIG_OBJ = {
    headers: {
      "Content-type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("token")
    }
  }

  //get loggedin user details
  const fetchData = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/api/user/${userId}`, CONFIG_OBJ);
      setUserData(response.data.user);

    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (userId) {
      fetchData()
    }
  }, [])

  //LOGGED IN USER TWEETS : 
  const getAllPosts = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/tweet');
      console.log(response)
      if (response.status === 200) {
        const allTweets = response.data.tweets;

        const userTweets = allTweets.filter((tweet) => {
          return tweet.tweetedBy._id === userId || tweet.retweetBy.some((user) => user.users === userId);
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
  }, [])

  //edit user details
  const editUser = async () => {
    // event.preventDefault();
    try {
      const updatedUser = {};
      if (name) {
        updatedUser.name = name;
      }
      if (location) {
        updatedUser.location = location;
      }
      if (dob) {
        updatedUser.dob = dob;
      }
      const response = await axios.put(`http://localhost:4000/api/user/${userId}`, updatedUser, CONFIG_OBJ);
      setUserData(response.data.user);
      setShowEdit(false);
      const updatedUserObj = {
        ...loggedInUserObj,
        ...updatedUser,
      };
      localStorage.setItem("user", JSON.stringify(updatedUserObj));
    } catch (error) {
      console.log(error);
    }
  }

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
  //UPLOAD IMAGE
  const handleFileSelect = (event) => {
    const img = {
      preview: URL.createObjectURL(event.target.files[0]),
      data: event.target.files[0]
    }
    setImage(img);
  }
  const handleImgUpload = async () => {
    if (!image) {
      toast.error('Please select an image');
      return;
    }
    let formData = new FormData();
    formData.append('file', image.data);

    try {
      const response = await axios.post(`http://localhost:4000/api/user/${userId}/uploadProfilePic`, formData);
      toast.success('Profile picture uploaded successfully');
      fetchData();
      setImage({ preview: '', data: '' });
      handleClosePic();
      return response.data
    } catch (error) {
      toast.error('error whiole uploading the image')
    }
  }




  //Delete a post
  const deletePost = async (postId) => {
    try {
      const response = await axios.delete(`http://localhost:4000/api/tweet/${postId}`, CONFIG_OBJ);
      if (response.status === 200) {
        toast.success('Tweet Deleted');
        getAllPosts();
      }
    } catch (error) {
      console.log(error);
      toast.error('Tweet cannot be deleted, please try again later');
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
            <img className='border border-black rounded-circle bg-white' src={`http://localhost:4000/files/${userData && userData.profilepicture}`} alt="" style={{ objectFit: 'cover' }} height={150} width={150} />
          </div>

          <div className="btns">
            <button className='btn btn-dark float-end invisible d-none'>Follow</button>

            <button className='btn btn-outline-dark ms-2 fw-bold float-end' onClick={handleShowEdit}>Edit</button>
            <button className='btn btn-outline-primary fw-bold float-end' onClick={handleShowPic} >Upload Profile Photo</button>
          </div>
        </div>

        <div className="userDetails mt-4">
          <h4 className='fullName'>{userData && userData.name}</h4>
          <h6 className='userName'>@{userData && userData.username}</h6>
          <h6 className='email'>{userData && userData.email}</h6>


          <p className='dobLoc'>
            <span className='dob'><i className=" me-1 fa-solid fa-cake-candles"></i> {userData && userData.dob ? userData.dob.slice(0, 10) : ""}</span>
            <span className='loc'><i className=" me-1 ms-5 fa-solid fa-location-dot"></i>{userData && userData.location}</span>

          </p>

          <p className='joinedDate'><i className="fa-regular fa-calendar"></i><span className='ms-2'>Joined {userData && userData.createdAt ? userData.createdAt.slice(0, 10) : ""}</span></p>
        </div>

        <div className="followCount d-flex gap-5">
          <div className="following fw-bold"><span className='me-2'>{userData && userData.following ? userData.following.length : 10}</span><span>Following</span></div>
          <div className="followers fw-bold"><span className='me-2'>{userData && userData.followers ? userData.followers.length : 10}</span><span>Followers</span></div>
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
                    <p>{tweet.replies.length - 1} more replies...</p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <Modal show={showEdit} onHide={handleCloseEdit}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>

          <form action="">

            <label htmlFor="name" className="form-label">Name</label>
            <input type="text"
              className="form-control mb-3"
              placeholder="Name"
              value={name}
              onChange={(ev) => setName(ev.target.value)}
            />

            <label htmlFor="location" className="form-label">Location</label>
            <input type="text"
              className="form-control mb-3"
              placeholder="Location"
              value={location}
              onChange={(ev) => setLocation(ev.target.value)}
            />

            <label htmlFor="dob" className="form-label">Date of Birth</label>
            <input type="date"
              className="form-control"
              placeholder="dd/mm/yyyy"
              value={dob}
              onChange={(ev) => setDob(ev.target.value)}
            />


          </form>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEdit}>
            Close
          </Button>
          <Button type='submit' variant="primary" onClick={() => editUser()}>
            Edit
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showPic} onHide={handleClosePic}>
        <Modal.Header closeButton>
          <Modal.Title>Upload Profile Pic</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className='bg-primary-subtle text-primary px-3 py-2 rounded'>Note: The image should be square in shape</p>
          <div className="mb-3">
            <input className="form-control" type="file" id="formFile" accept='image/*' onChange={handleFileSelect} />
          </div>
          {image && (
            <img
              src={image.preview}
              alt="Preview"
              style={{ marginTop: '10px', maxWidth: '200px', maxHeight: '200px' }}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClosePic}>
            Close
          </Button>
          <Button variant="primary" onClick={handleImgUpload}>
            Save Profile Pic
          </Button>
        </Modal.Footer>
      </Modal>

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

export default ProfilePage
