/**
 * IT Support Ticket System - Server
 * An Express.js backend that serves the application's static files and provides
 * API endpoints for managing IT support tickets.
 */

// Import required modules
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

// Import sample tickets for production use
const sampleTickets = require('./data/sampleTickets');

// Environment configuration
const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
console.log(`Running in ${isProduction ? 'production' : 'development'} mode`);

// In-memory ticket storage (used in both dev and production)
let ticketsInMemory = [];

// Initialize with sample data in production
if (isProduction) {
    console.log('Loading sample tickets for production environment');
    ticketsInMemory = [...sampleTickets];
    console.log(`Loaded ${ticketsInMemory.length} sample tickets`);
}

// Data file path (only used in development)
const TICKETS_FILE = path.join(__dirname, 'data', 'tickets.json');

// Initialize file storage in development mode
if (!isProduction) {
    // Create data directory if it doesn't exist
    if (!fs.existsSync(path.join(__dirname, 'data'))) {
        fs.mkdirSync(path.join(__dirname, 'data'));
    }

    // Create tickets file if it doesn't exist
    if (!fs.existsSync(TICKETS_FILE)) {
        fs.writeFileSync(TICKETS_FILE, JSON.stringify([]));
    }

    // Load any existing tickets into memory
    try {
        const data = fs.readFileSync(TICKETS_FILE, 'utf8');
        ticketsInMemory = JSON.parse(data);
        console.log(`Loaded ${ticketsInMemory.length} tickets from file`);
    } catch (err) {
        console.error('Error loading tickets:', err);
        // Initialize with empty array if there's an error
        ticketsInMemory = [];
    }
}

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
  next();
});

/**
 * Ticket class for creating and validating ticket objects
 */
class Ticket {    /**
     * Create a new ticket
     * @param {string} reqDate - Request date in mm/dd/yyyy format
     * @param {string} empID - Employee ID (letter followed by 5 numbers)
     * @param {string} fName - First name (starts with capital letter)
     * @param {string} lName - Last name (starts with capital letter)
     * @param {string} probDesc - Problem description
     * @param {string} ticketType - Ticket type (computer, software, network)
     * @param {string} [id] - Optional id, if not provided, one will be generated
     */
    constructor(reqDate, empID, fName, lName, probDesc, ticketType, id) {
        this.id = id || 'TK' + Date.now().toString().slice(-6); // Use provided ID or generate one
        this.reqDate = reqDate;
        this.empID = empID;
        this.fName = fName;
        this.lName = lName;
        this.probDesc = probDesc;
        this.ticketType = ticketType;
        this.status = 'Open';
        this.createdAt = new Date().toISOString();
    }

    /**
     * Validate ticket data according to business rules
     * @param {Object} data - Ticket data to validate
     * @returns {Array} Array of validation error messages, empty if valid
     */
    static validate(data) {
        const errors = [];
        
        // Validate reqDate (mm/dd/yyyy)
        if (!data.reqDate || !/^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/.test(data.reqDate)) {
            errors.push('Request date must be in mm/dd/yyyy format');
        }
        
        // Validate empID (letter followed by 5 numbers)
        if (!data.empID || !/^[A-Z]\d{5}$/.test(data.empID)) {
            errors.push('Employee ID must start with a capital letter followed by 5 numbers');
        }
        
        // Validate fName (starts with capital)
        if (!data.fName || !/^[A-Z]/.test(data.fName)) {
            errors.push('First name must start with a capital letter');
        }
        
        // Validate lName (starts with capital)
        if (!data.lName || !/^[A-Z]/.test(data.lName)) {
            errors.push('Last name must start with a capital letter');
        }
        
        // Validate probDesc (required)
        if (!data.probDesc || data.probDesc.trim() === '') {
            errors.push('Problem description is required');
        }
        
        // Validate ticketType
        if (!['computer', 'software', 'network'].includes(data.ticketType)) {
            errors.push('Invalid ticket type');
        }
        
        return errors;
    }
}

/**
 * User class for authentication (simplified for demo)
 */
class User {
    constructor(username, password) {
        this.username = username;
        this.password = password; // In a real app, this would be hashed
    }
    
    /**
     * Simulated login (always succeeds if both fields are provided)
     * @param {string} username - Username
     * @param {string} password - Password
     * @returns {boolean} Whether login was successful
     */
    static login(username, password) {
        return !!(username && password);
    }
}

/**
 * Extract email addresses from text
 * @param {string} text - Text to extract emails from
 * @returns {Array} Array of email addresses found in the text
 */
function extractEmails(text) {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    return text.match(emailRegex) || [];
}

// API ROUTES

/**
 * Get all tickets
 * GET /api/tickets
 */
app.get('/api/tickets', (req, res) => {
    // In production, return in-memory tickets
    if (isProduction) {
        return res.json(ticketsInMemory);
    }

    // In development, read from file
    fs.readFile(TICKETS_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading tickets file:', err);
            return res.status(500).json({ error: 'Server error' });
        }
        
        try {
            const tickets = JSON.parse(data);
            res.json(tickets);
        } catch (err) {
            console.error('Error parsing tickets data:', err);
            return res.status(500).json({ error: 'Server error' });
        }
    });
});

/**
 * Search for tickets by name or ID
 * GET /api/tickets/search?query=searchterm
 */
app.get('/api/tickets/search', (req, res) => {
    const query = req.query.query || '';
    
    if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
    }
    
    // In production, search in-memory tickets
    if (isProduction) {
        const results = ticketsInMemory.filter(ticket => 
            ticket.id.includes(query) || 
            ticket.fName.toLowerCase().includes(query.toLowerCase()) || 
            ticket.lName.toLowerCase().includes(query.toLowerCase()) ||
            (ticket.fName + ' ' + ticket.lName).toLowerCase().includes(query.toLowerCase())
        );
        return res.json(results);
    }

    // In development, search file-based tickets
    fs.readFile(TICKETS_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading tickets data' });
        }
        
        const tickets = JSON.parse(data);
        const results = tickets.filter(ticket => 
            ticket.id.includes(query) || 
            ticket.fName.toLowerCase().includes(query.toLowerCase()) || 
            ticket.lName.toLowerCase().includes(query.toLowerCase()) ||
            (ticket.fName + ' ' + ticket.lName).toLowerCase().includes(query.toLowerCase())
        );
        
        res.json(results);
    });
});

/**
 * Create a new ticket
 * POST /api/tickets
 */
app.post('/api/tickets', (req, res) => {
    console.log('Received ticket data:', req.body);
    
    const ticketData = req.body;
    
    // Validate ticket data
    const validationErrors = Ticket.validate(ticketData);
    if (validationErrors.length > 0) {
        console.log('Validation errors:', validationErrors);
        return res.status(400).json({ errors: validationErrors });
    }
      try {
        // Create new ticket
        const newTicket = new Ticket(
            ticketData.reqDate,
            ticketData.empID,
            ticketData.fName,
            ticketData.lName,
            ticketData.probDesc,
            ticketData.ticketType,
            ticketData.id // Pass ID if provided
        );
          // Extract emails from problem description
        newTicket.contactEmails = extractEmails(ticketData.probDesc);
        
        // Add dynamic fields based on ticket type
        if (ticketData.ticketType === 'computer' && ticketData.computerModel && ticketData.serialNumber) {
            newTicket.computerModel = ticketData.computerModel;
            newTicket.serialNumber = ticketData.serialNumber;
        } else if (ticketData.ticketType === 'software' && ticketData.softwareName && ticketData.softwareVersion) {
            newTicket.softwareName = ticketData.softwareName;
            newTicket.softwareVersion = ticketData.softwareVersion;
        } else if (ticketData.ticketType === 'network' && ticketData.networkLocation && ticketData.macAddress) {
            newTicket.networkLocation = ticketData.networkLocation;
            newTicket.macAddress = ticketData.macAddress;
        }
          // In production, store ticket in memory only
        if (isProduction) {
            // Add additional properties from dynamic fields that might be in the sample data
            if (ticketData.computerModel) newTicket.computerModel = ticketData.computerModel;
            if (ticketData.serialNumber) newTicket.serialNumber = ticketData.serialNumber;
            if (ticketData.softwareName) newTicket.softwareName = ticketData.softwareName;
            if (ticketData.softwareVersion) newTicket.softwareVersion = ticketData.softwareVersion;
            if (ticketData.networkLocation) newTicket.networkLocation = ticketData.networkLocation;
            if (ticketData.macAddress) newTicket.macAddress = ticketData.macAddress;
            
            ticketsInMemory.push(newTicket);
            console.log('Ticket created and stored in memory:', newTicket.id);
            return res.status(201).json(newTicket);
        }

        // In development, save ticket to file
        fs.readFile(TICKETS_FILE, 'utf8', (err, data) => {
            if (err) {
                return res.status(500).json({ error: 'Error reading tickets data' });
            }
            
            try {
                const tickets = JSON.parse(data);
                tickets.push(newTicket);
                
                fs.writeFile(TICKETS_FILE, JSON.stringify(tickets, null, 2), err => {
                    if (err) {
                        return res.status(500).json({ error: 'Error saving ticket' });
                    }
                    res.status(201).json(newTicket);
                });
            } catch (parseError) {
                console.error('Error parsing tickets data:', parseError);
                return res.status(500).json({ error: 'Error parsing tickets data' });
            }
        });
    } catch (error) {
        console.error('Server error creating ticket:', error);
        return res.status(500).json({ error: 'Server error creating ticket' });
    }
});

/**
 * Get a simple API test endpoint
 * GET /api/ping
 */
app.get('/api/ping', (req, res) => {
  res.json({ success: true, message: 'API is working!' });
});

// Serve static files from the 'public' directory
// This must come AFTER all API routes
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all route for API endpoints that don't exist
// This ensures API routes return JSON, not HTML
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Route to serve the main HTML file for any other routes
// This enables client-side routing for single-page applications
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Server error' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} at host 0.0.0.0`);
});