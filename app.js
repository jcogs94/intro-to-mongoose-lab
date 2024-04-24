const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const Customer = require('./models/customer.js');
const prompt = require('prompt-sync')();


const connect = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database...');
    await runQueries();
    await mongoose.disconnect();
    console.log('Disconnected from database...');
}

const createCustomer = async () => {
    console.log('Customer entry created');
}

const viewCustomer = async () => {
    console.log('Customer entry displayed');
}

const updateCustomer = async () => {
    console.log('Customer entry updated');
}

const deleteCustomer = async () => {
    console.log('Customer entry deleted');
}

// Validates user input by determining it is an integer
// between 1-5
const validateInput = (input) => {
    if (parseInt(input) != NaN && 6 > parseInt(input) && parseInt(input) > 0) {
        return true;
    } else {
        return false;
    }
}

// Displays user prompt and repeats until a valid input
// is given
const userPrompt = () => {
    let validInput = false;
    let userInput = '';
    console.clear();
    
    console.log('Welcome to the CRM\n');
    console.log('What would you like to do?\n');
    console.log('  1. Create a customer');
    console.log('  2. View all customers');
    console.log('  3. Update a customer');
    console.log('  4. Delete a customer');
    console.log('  5. Quit\n');
    
    while (validInput === false) {
        userInput = prompt('Number of action you would like to run: ');
        
        if (validateInput(userInput)) {
            validInput = true;
        } else {
            console.log('Invalid input. Try again.');
        }
    }

    switch (userInput) {
        case '1':
            createCustomer();
            break;
        case '2':
            viewCustomer();
            break;
        case '3':
            updateCustomer();
            break;
        case '4':
            deleteCustomer();
            break;
    }
}

const runQueries = async () => {
    console.log('Queries running...');

    // const username = prompt('What is your name? ');
    // console.log(`Your name is ${username}`);
}

const startApp = async () => {
    userPrompt();
    // connect();
}

startApp();
