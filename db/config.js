const mongoose = require('mongoose');
const User = require("../models/User");

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/ivey', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    try {
      const checkAdminUser = await User.find({"username": "admin"});
      
      if(checkAdminUser.length === 0){
        const newUser = await new User(
          {
            "username": "admin",
            "password": "admin@123"
          }
        ).save();
        
      }
    } catch (err) {
        console.log("err: ", err);
    }
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
