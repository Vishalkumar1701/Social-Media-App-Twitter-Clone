import React, { useState } from 'react';
import './Signup.scss';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
    const [name, setname] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const signup = (event) => {
        event.preventDefault();
        setLoading(true);
        const requestData = {
            name, email, username, password
        }
        axios.post('http://localhost:4000/API/auth/register', requestData)
            .then((result) => {
                if (result.status == 201) {
                    setLoading(false);
                    toast.success('User registered successfully');
                    navigate('/login')
                }
                setEmail('');
                setname('');
                setUserName('');
                setPassword('');

            }).catch((error) => {
                console.log(error);
                setLoading(false);
                toast.error('Please try again later')
            })

    }
    return (
        <>
            <ToastContainer />
            <div className="signup container-fluid p-1">
                <div className="container d-flex justify-content-center align-items-center">
                    <div className="row shadow">
                        <div className="image-con col-md-5 d-flex justify-content-center align-items-center flex-column">
                            <h3 className='mb-5 text-light'>Join Us</h3>
                            <i className="fa-solid fa-comments fa-2xl text-light"></i>
                        </div>

                        <div className="form-con col-md-7 justify-content-center d-flex flex-column px-5 py-5">
                            <h4 className='mb-3 fw-bolder'>Register</h4>
                            <form action="" onSubmit={(e) => signup(e)}>
                                {loading ? <div className='col-md-12 mt-3 text-center'>
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div> : ''}
                                <label htmlFor="fullname"></label>
                                <input type="text"
                                    value={name}
                                    onChange={(ev) => setname(ev.target.value)}
                                    className="form-control"
                                    placeholder="Full Name" />

                                <label htmlFor="email"></label>
                                <input type="email"
                                    value={email}
                                    onChange={(ev) => setEmail(ev.target.value)}
                                    className="form-control"
                                    placeholder="E-Mail" />

                                <label htmlFor="username"></label>
                                <input type="text"
                                    value={username}
                                    onChange={(ev) => setUserName(ev.target.value)}
                                    className="form-control"
                                    placeholder="Username" />

                                <label htmlFor="password"></label>
                                <input type="password"
                                    value={password}
                                    onChange={(ev) => setPassword(ev.target.value)}
                                    className="form-control"
                                    placeholder="Password" />

                                <label htmlFor="submit" ></label>
                                <button type='submit' className='rounded px-4 py-1 fw-bold border border-black bg-dark my-3 text-light'>Register</button>

                                <p>Already Registered?<span><Link to="/login">Login here</Link></span></p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Signup;
