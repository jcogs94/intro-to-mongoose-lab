const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const Customer = require('./models/customer.js');

const connect = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database...');
    await runQueries();
    await mongoose.disconnect();
    console.log('Disconnected from database...');
}

const runQueries = async () => {
    console.log('Queries running...');


    // const prompt = require('prompt-sync')();
    // const username = prompt('What is your name? ');
    // console.log(`Your name is ${username}`);
}

connect();
