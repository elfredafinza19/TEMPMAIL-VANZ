const express = require('express');
const router = express.Router();

// Mock data for the example, replace with your actual data retrieval logic
let emails = [
    { id: 1, address: 'example1@mail.com', subject: 'Hello World', content: 'This is the first email.' },
    { id: 2, address: 'example2@mail.com', subject: 'Greetings', content: 'This is the second email.' },
    { id: 3, address: 'example3@mail.com', subject: 'Updates', content: 'This is the third email.' }
];

// GET emails for a specific address
router.get('/emails/:address', (req, res) => {
    const { address } = req.params;
    const result = emails.filter(email => email.address === address);
    res.json(result);
});

// GET a specific email by ID
router.get('/emails/id/:id', (req, res) => {
    const { id } = req.params;
    const email = emails.find(email => email.id === parseInt(id));
    if (email) {
        res.json(email);
    } else {
        res.status(404).send('Email not found');
    }
});

// GET the latest email
router.get('/emails/latest', (req, res) => {
    const latestEmail = emails[emails.length - 1];
    res.json(latestEmail);
});

module.exports = router;