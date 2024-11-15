const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const adminRouter = require('./routes/admin');
const projectRouter = require('./routes/project');
const menuRouter = require('./routes/menu');
const testimonialRouter = require('./routes/testimonial');
const blogRouter = require('./routes/blog');
const app = express();
const connectDB = require("./db/config");
require('dotenv').config();

const PORT = process.env.PORT || 5000; 

// Connect to MongoDB
// mongoose.connect('mongodb://localhost:27017/milkbarDb', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// });

connectDB();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // Allow requests from your React frontend
    credentials: true // Allow credentials (such as cookies or authorization headers)
}));
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '10mb' })); // Adjust limit as needed
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true })); // Adjust limit as needed
app.use(express.static('public'));
app.use(express.json());

// Routes
app.use('/api/admin', adminRouter);
app.use('/api/admin', projectRouter);
app.use('/api/admin', menuRouter);
app.use('/api/admin', testimonialRouter);
app.use('/api/admin', blogRouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
