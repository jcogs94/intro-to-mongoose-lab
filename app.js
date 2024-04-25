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
    let id = data[customerSelection].id;

    if (customerAttr === 'name') {
        await Customer.findByIdAndUpdate(id, { name: value });
    } else {
        await Customer.findByIdAndUpdate(id, { age: parseInt(value) });
    }

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

    const allCustomers = await Customer.find();
    let allCustomersArr = await getEntryArray(allCustomers);
    console.table(allCustomersArr);

    console.log();
    let userSelection = '';
    let validSelection = false;
    
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

    while (validSelection === false) {
        updateValue = prompt(`Enter the new ${updateSelection}: `);
        
        if (updateSelection === 'age') {
            if (isNaN(parseInt(updateValue))) {
                console.log('\nInvalid input. Please try again.');
            } else { validSelection = true };
        } else { validSelection = true };
    }

    let updated = await updateEntry(allCustomersArr, userSelection, updateSelection, updateValue);

    if (updated) {
        console.log('\n\nCustomer entry updated');
    } else {
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
    if (selectionType === 'userPrompt') {
        if (isNaN(parseInt(input)) === false && 6 > parseInt(input) && parseInt(input) > 0) {
            return true;
        } else { return false };
    } else if (selectionType === 'updateCustomer') {
        if (isNaN(parseInt(input)) === false && parseInt(input) >= 0 && parseInt(input) < data.length) {
            return true;
        } else { return false };
    } else if (selectionType === 'updateCustomer2') {
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
    
    while (validInput === false) {
        userInput = prompt('Number of action you would like to run: ');
        
        if (validateInput(userInput, 'userPrompt')) {
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
