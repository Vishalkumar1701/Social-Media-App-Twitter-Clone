import React, { useState, useEffect } from 'react'
import user from '../asserts/user.png'
import './Sidebar.scss'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faHome} from '@fortawesome/free-solid-svg-icons'
import {faComments} from '@fortawesome/free-solid-svg-icons'
import {faUser} from '@fortawesome/free-solid-svg-icons'
import {faRightFromBracket} from '@fortawesome/free-solid-svg-icons'


const sidebar = () => {

    const [userData, setUserData] = useState({});

    const dispatch = useDispatch();
    const navigate = useNavigate();

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

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        dispatch({ type: "LOGIN_ERROR" });
        navigate("/login");
    }
    return (
        <div className="menu-con d-flex flex-column justify-content-between">
            <div className="menu-item">
                <FontAwesomeIcon icon={faComments} className='fs-2 mt-2' style={{color: 'blue'}}/>
                <div className="menu-content">
                    <div className="home-menu d-flex flex-column gap-1 mt-3">
                        <Link to="/home/hometweet" className='link-underline link-underline-opacity-0 fw-bold fs-4' style={{color: 'darkslategray'}}><FontAwesomeIcon icon={faHome}/><span className='ps-2'>Home</span></Link>
                        <Link to="/home/profilepage" className='link-underline link-underline-opacity-0 fw-bold fs-4' style={{color: 'darkslategray'}}><FontAwesomeIcon icon={faUser}/><span className='ps-2'>Profile</span></Link>
                        <Link onClick={() => logout()} to="/login" className='link-underline link-underline-opacity-0 fw-bold fs-4' style={{color: 'darkslategray'}}><FontAwesomeIcon icon={faRightFromBracket}/><span className='ps-2'>Logout</span></Link>
                    </div>
                </div>
            </div>

            <div className="user-area d-flex gap-3 align-items-center bg-secondary-subtle p-2 rounded mb-3">
                <div className="image">
                    <img
                        className='bg-primary rounded-circle'
                        style={{ objectFit: 'cover' }}
                        src={userData && userData.profilepicture ? `http://localhost:4000/files/${userData.profilepicture}` : user}
                        alt=""
                        height={50}
                        width={50}
                    />
                </div>
                <div className="details">
                    <h5 className='fullname'>{userData.name}</h5>
                    <h6 className='username'>@{userData.username}</h6>
                </div>
            </div>
        </div>
    )
}

export default sidebar
