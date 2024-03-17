const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose')
const app = express();

dotenv.config();
const PORT = process.env.PORT;
const MONGODB_URL = process.env.MONGODB_URL;

mongoose.connect(MONGODB_URL);

mongoose.connection.on('connected',()=>{
    console.log('Database Connected');
})

mongoose.connection.on('error',(error)=>{
    console.log(error);
    console.log('some error while connecting to database');
})

app.use(cors());
app.use(express.json());

//Models :
require('./Models/UserModel');
require('./Models/TweetModel');

//Routes : 
app.use(require('./Routes/AuthRoute'));
app.use(require('./Routes/UserRoute'));
app.use(require('./Routes/TweetRoute'));
app.use(require('./Routes/Image_fileRoute'));




app.listen(PORT, ()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
})