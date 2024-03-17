import React, { useState } from 'react'
import axios from 'axios'
import './Login.scss'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const Login = () => {
    const [username, setUserName] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const login = (event) => {
        event.preventDefault();
        setLoading(true);
        const requestData = { username, password }

        axios.post('http://localhost:4000/API/auth/login', requestData)
            .then((result) => {
                if (result.status == 200) {
                    setLoading(false)
                    toast.success("Welcome!!")
                    localStorage.setItem("token", result.data.result.token);
                    localStorage.setItem("user", JSON.stringify(result.data.result.user));

                    dispatch({ type: 'LOGIN_SUCCESS', payload: result.data.result.user });
                    navigate('/home');
                }
            }).catch((error) => {
                console.log(error);
                setLoading(false);
                toast.error("User does'nt exist")
            })
    }
    return (
        <>
            <ToastContainer />
            <div className="login container-fluid p-1">
                <div className="container d-flex justify-content-center align-items-center">
                    <div className="row shadow">
                        <div className="image-con col-md-5 d-flex justify-content-center align-items-center flex-column">
                            <h3 className='mb-5 text-light'>Welcome Back</h3>
                            <i className="fa-solid fa-comments fa-2xl text-light"></i>
                        </div>

                        <div className="form-con col-md-7 justify-content-center d-flex flex-column px-5 py-5">
                            <h4 className='mb-3 fw-bolder'>Login</h4>
                            <form action="" onSubmit={(e) => login(e)}>
                                {loading ? <div className='col-md-12 mt-3 text-center'>
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div> : ''}
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
                                <button type='submit' className='rounded px-4 py-1 fw-bold border border-black bg-dark my-3 text-light'>Login</button>

                                <p>Don't have an account? <span><Link to="/signup">Register here</Link></span></p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Login
