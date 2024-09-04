const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
const url = process.env.MONGODB_URL;

const connectdb = () => {
    mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 30000,
    })
    .then(() => {
        console.log('Database connection successful');
    })
    .catch((error) => {
        console.error(`Error connecting to MongoDB: ${error.message}`);
    });
};

module.exports = connectdb;
