// src/api/auth.js

const express = require('express');
const crypto = require('crypto');
const router = express.Router();

// Mock database for API keys
let apiKeys = {};

// Function to generate a unique API key
const generateApiKey = () => {
    return crypto.randomBytes(20).toString('hex');
};

// Endpoint for API key generation
router.post('/generate-api-key', (req, res) => {
    const userId = req.body.userId; // assume userId is sent in the request body
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    const apiKey = generateApiKey();
    apiKeys[userId] = apiKey;
    return res.status(201).json({ apiKey });
});

// Endpoint for API key authentication
router.get('/auth-api-key', (req, res) => {
    const apiKey = req.headers['x-api-key']; // assume the API key is sent in the header
    const userId = Object.keys(apiKeys).find(key => apiKeys[key] === apiKey);
    if (userId) {
        return res.status(200).json({ message: 'Authentication successful', userId });
    } else {
        return res.status(401).json({ message: 'Invalid API key' });
    }
});

module.exports = router;