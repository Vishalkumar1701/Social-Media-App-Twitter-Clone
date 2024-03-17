import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'


import Home from './Pages/Home'
import Login from './Pages/Login'
import Signup from './Pages/Signup'


const App = () => {
  const DynamicRouting = () =>{
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(()=>{
      const userData = JSON.parse(localStorage.getItem("user"));
      
      if(userData) {
        dispatch({type: 'LOGIN_SUCCESS', payload: userData});
        navigate('/home')
      } else{
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        dispatch({type : 'LOGIN_ERROR'});
        navigate('/login');
      }
    }, []);
    return (
      <Routes>
        <Route path='/' element={<Signup />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/home/*' element={<Home />} />        
      </Routes>
    )
  }

  return (
    <Router>
      <DynamicRouting />
    </Router>
  )
}

export default App
