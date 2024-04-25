const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const Customer = require('./models/customer.js');
const prompt = require('prompt-sync')();

// Class used to create more useable objects, enabling
// a better user experience utilizing tables
class CustomerEntry {
    constructor(entry) {
        this.id = entry.id,
        this.name = entry.name,
        this.age = entry.age
    }
}

const connect = async () => {
    console.clear();
    console.log('Connecting...');
    await mongoose.connect(process.env.MONGODB_URI);
    await runQueries(true);
}

const disconnect = async () => {
    await mongoose.disconnect();
}

// Returns an array of the objects created by CustomerEntry
// class. Enables this array to be used in tables and improve
// user experience
const getEntryArray = async (entries) => {
    let customerDisplayArr = [];
    
    for (let i = 0; i < entries.length; i++) {
        customerDisplayArr.push(new CustomerEntry(entries[i]));
    }

    return customerDisplayArr;
}

const createCustomer = async () => {
    console.clear();
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    console.log('~~~~~Create customer entry~~~~~');
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    
    console.log("\nPlease enter the new customer's information below.");
    
    let name = prompt('Name: ');
    
    let age = '';
    let ageValid = false;
    while (ageValid === false) {
        age = prompt('Age: ');
        if (isNaN(parseInt(age))) {
            console.log('\nInvalid input. Please try again.');
        } else {
            ageValid = true;
        }
    }

    const customerEntry = {
        name: name,
        age: age
    }

    const newCustomer = await Customer.create(customerEntry);
    console.log('\nCustomer created successfully...');
    console.log(`    id: ${newCustomer.id}\n  Name: ${newCustomer.name}\n   Age: ${newCustomer.age}\n\n`);

    prompt('[Enter to continue]');
    runQueries(false);
}

const viewCustomer = async () => {
    console.clear();
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    console.log('~~~~~~~Customer entries~~~~~~~');
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    
    console.log('\nHere is a list of the current customer entries:\n');

    const allCustomers = await Customer.find();
    let allCustomersArr = await getEntryArray(allCustomers);
    console.table(allCustomersArr);

    prompt('[Enter to continue]');
    runQueries(false);
}

const updateEntry = async (data, customerSelection, customerAttr, value) => {
    // Stores the id of the selected entry for easier access
    let id = data[customerSelection].id;

    // Updates the entry based on name/age input
    if (customerAttr === 'name') {
        await Customer.findByIdAndUpdate(id, { name: value });
    } else {
        await Customer.findByIdAndUpdate(id, { age: parseInt(value) });
    }

    // Varifies the entry has been successfully updated based on user input
    let updatedCustomer = await Customer.findById(id);
    if (customerAttr === 'name') {
        if (updatedCustomer.name === value) {
            return true;
        } else { return false };
    } else if (customerAttr === 'age') {
        if (updatedCustomer.age === parseInt(value)) {
            return true;
        } else { return false };
    }
}

const updateCustomer = async () => {
    console.clear();
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    console.log('~~~~~Update Customer Entries~~~~~');
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    
    console.log('\nHere is a list of the current customer entries:\n');

    // Finds all customer entries and displays them in a user-friendly table for selection
    const allCustomers = await Customer.find();
    let allCustomersArr = await getEntryArray(allCustomers);
    console.table(allCustomersArr);

    console.log();
    let userSelection = '';
    let validSelection = false;
    
    // While loop ensures valid entry selection
    while (validSelection === false) {
        userSelection = prompt('Please enter the index of the entry you would like to update: ');
        validSelection = validateInput(userSelection, 'updateCustomer', allCustomersArr);

        if (validSelection === false) {
            console.log('\nInvalid input. Try again.');
        }
    }

    let updateSelection = '';
    validSelection = false;

    console.log('   1. Name');
    console.log('   2. Age');

    // While loop to ensure user enters 1 or 2
    while (validSelection === false) {
        updateSelection = prompt('Select what you would like to update: ');
        validSelection = validateInput(updateSelection, 'updateCustomer2');
        if (validSelection) {
            if (updateSelection === '1') {
                updateSelection = 'name';
            } else if (updateSelection === '2') {
                updateSelection = 'age';
            }
        } else {
            console.log('\nInvalid input. Try again.');
        }
    }

    let updateValue = '';
    validSelection = false;

    // While loop to validate a number is entered for age
    while (validSelection === false) {
        updateValue = prompt(`Enter the new ${updateSelection}: `);
        
        if (updateSelection === 'age') {
            if (isNaN(parseInt(updateValue))) {
                console.log('\nInvalid input. Please try again.');
            } else { validSelection = true };
        } else { validSelection = true };
    }

    // Uses updateEntry() to update the entry with the user input
    let updated = await updateEntry(allCustomersArr, userSelection, updateSelection, updateValue);

    // Gives user feedback if an error occurs
    if (!updated) {
        console.log('\nAn error occurred. Please try again.');
    }

    prompt('[Enter to continue]');
    runQueries(false);
}

const deleteCustomer = async () => {
    console.log('Customer entry deleted');
    prompt('[Enter to continue]');
    runQueries(false);
}

// Validates user input by determining it is an integer
// between 1-5
const validateInput = (input, selectionType, data) => {
    // Validation for multiple functions, ensures user input is valid
    if (selectionType === 'userPrompt') {
        if (isNaN(parseInt(input)) === false && 6 > parseInt(input) && parseInt(input) > 0) {               // ensures user input is a number from 1-5
            return true;
        } else { return false };
    } else if (selectionType === 'updateCustomer') {
        if (isNaN(parseInt(input)) === false && parseInt(input) >= 0 && parseInt(input) < data.length) {    // ensures user input is a valid index within the current entries array
            return true;
        } else { return false };
    } else if (selectionType === 'updateCustomer2') {                                                       // 1 and 2 are the only valid inputs, all else false
        if (parseInt(input) === 1 || parseInt(input) === 2) {
            return true;
        } else { return false };
    }
}

// Displays user prompt and repeats until a valid input
// is given
const userPrompt = () => {
    let validInput = false;
    let userInput = '';
    
    console.log('What would you like to do?\n');
    console.log('  1. Create a customer');
    console.log('  2. View all customers');
    console.log('  3. Update a customer');
    console.log('  4. Delete a customer');
    console.log('  5. Quit\n');
    
    // Uses validateInput() in while loop to ensure user enters
    // a valid action
    while (validInput === false) {
        userInput = prompt('Number of action you would like to run: ');
        
        if (validateInput(userInput, 'userPrompt')) {
            validInput = true;
        } else {
            console.log('Invalid input. Try again.');
        }
    }

    // Runs the desired function with the valid input
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
        case '5':
            console.log('exiting...');
            disconnect();
            break;
    }
}

const runQueries = async (start) => {
    console.clear();
    if (start === true) {
        console.log('Welcome to the CRM\n');
        userPrompt();
    } else {
        userPrompt();
    }
}

connect();
