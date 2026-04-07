// src/api/domains.js

const express = require('express');
const router = express.Router();

// Simulated database for domains
let domains = [];

// POST: Add a new domain
router.post('/add', (req, res) => {
    const { domain } = req.body;
    if (!domain) {
        return res.status(400).json({ message: 'Domain is required' });
    }
    domains.push(domain);
    return res.status(201).json({ message: 'Domain added', domain });
});

// GET: List all domains
router.get('/', (req, res) => {
    return res.status(200).json(domains);
});

// DELETE: Remove a domain
router.delete('/:domain', (req, res) => {
    const { domain } = req.params;
    domains = domains.filter(d => d !== domain);
    return res.status(200).json({ message: 'Domain removed', domain });
});

// POST: Verify MX records (simulated)
router.post('/verify', (req, res) => {
    const { domain } = req.body;
    if (!domain) {
        return res.status(400).json({ message: 'Domain is required' });
    }
    // Simulate MX record verification
    const mxRecordsVerified = true;  // This should involve a real DNS check
    return res.status(200).json({ message: 'MX records verified', domain, mxRecordsVerified });
});

module.exports = router;