import React from 'react'
import Sidebar from '../Components/Sidebar';
import Hometweet from '../Components/Hometweet';
import ProfilePage from '../Components/ProfilePage';
import OtherUserProfilePage from '../Components/OtherUserProfilePage';
import TweetDetails from '../Components/TweetDetails';
import { Route, Routes } from 'react-router-dom';

const Home = () => {

    return (
        <>
            <div className="container-fluid">
                <div className="container">
                    <div className="row">
                        <div className="col-3 ">
                            <Sidebar />
                        </div>
                        <div className="col-9 border border-secondary-subtle ">
                            <Routes>
                                <Route path='/' element={<Hometweet />} index />
                                <Route exact path='/profilepage' element={<ProfilePage />} />
                                <Route path='/profilepage/:userId' element={<OtherUserProfilePage />} />
                                <Route exact path='/hometweet' element={<Hometweet />} />
                                <Route path='/hometweet/:tweetId' element={<TweetDetails />} />
                            </Routes>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}

export default Home
