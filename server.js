const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors'); // Added cors package

// Add this near the top
const isProduction = process.env.NODE_ENV === 'production';

// In-memory ticket storage for production environments
let ticketsInMemory = [];

// Data file path (only used in development)
const TICKETS_FILE = path.join(__dirname, 'data', 'tickets.json');

// Only create directories/files in development
if (!isProduction) {
    if (!fs.existsSync(path.join(__dirname, 'data'))) {
        fs.mkdirSync(path.join(__dirname, 'data'));
    }

    if (!fs.existsSync(TICKETS_FILE)) {
        fs.writeFileSync(TICKETS_FILE, JSON.stringify([]));
    }

    // Load any existing tickets into memory
    try {
        const data = fs.readFileSync(TICKETS_FILE, 'utf8');
        ticketsInMemory = JSON.parse(data);
    } catch (err) {
        console.error('Error loading tickets:', err);
    }
}

// Create Express app
const app = express();
const PORT = process.env.PORT || 10000; // Changed default port to 10000 for Render

// Middleware
app.use(cors()); // Add CORS support
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Fixed static file serving - create a 'public' folder for static assets
// Be sure to create this directory in your project
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Classes
class Ticket {
    constructor(reqDate, empID, fName, lName, probDesc, ticketType) {
        this.id = 'TK' + Date.now().toString().slice(-6);
        this.reqDate = reqDate;
        this.empID = empID;
        this.fName = fName;
        this.lName = lName;
        this.probDesc = probDesc;
        this.ticketType = ticketType;
        this.status = 'Open';
        this.createdAt = new Date().toISOString();
    }

    // Validate ticket data
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

class User {
    constructor(username, password) {
        this.username = username;
        this.password = password; // In a real app, this would be hashed
    }
    
    // Simulated login (always succeeds if both fields are provided)
    static login(username, password) {
        return !!(username && password);
    }
}

// Utility Functions
function extractEmails(text) {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    return text.match(emailRegex) || [];
}

// API Endpoints
// Get all tickets
app.get('/api/tickets', (req, res) => {
    if (isProduction) {
        return res.json(ticketsInMemory);
    }

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

// Search tickets
app.get('/api/tickets/search', (req, res) => {
    const query = req.query.query || '';
    
    if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
    }
    
    if (isProduction) {
        const results = ticketsInMemory.filter(ticket => 
            ticket.id.includes(query) || 
            ticket.fName.toLowerCase().includes(query.toLowerCase()) || 
            ticket.lName.toLowerCase().includes(query.toLowerCase()) ||
            (ticket.fName + ' ' + ticket.lName).toLowerCase().includes(query.toLowerCase())
        );
        return res.json(results);
    }

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

// Create a new ticket
app.post('/api/tickets', (req, res) => {
    console.log('Received ticket data:', req.body);
    
    const ticketData = req.body;
    
    // Validate ticket data
    const validationErrors = Ticket.validate(ticketData);
    if (validationErrors.length > 0) {
        console.log('Validation errors:', validationErrors);
        return res.status(400).json({ errors: validationErrors });
    }
    
    // Create new ticket
    const newTicket = new Ticket(
        ticketData.reqDate,
        ticketData.empID,
        ticketData.fName,
        ticketData.lName,
        ticketData.probDesc,
        ticketData.ticketType
    );
    
    // Extract emails from problem description
    newTicket.contactEmails = extractEmails(ticketData.probDesc);
    
    if (isProduction) {
        ticketsInMemory.push(newTicket);
        return res.status(201).json(newTicket);
    }

    // Save ticket
    fs.readFile(TICKETS_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading tickets data' });
        }
        
        const tickets = JSON.parse(data);
        tickets.push(newTicket);
        
        fs.writeFile(TICKETS_FILE, JSON.stringify(tickets, null, 2), err => {
            if (err) {
                return res.status(500).json({ error: 'Error saving ticket' });
            }
            res.status(201).json(newTicket);
        });
    });
});

// Error logging middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Server error' });
});

// Start server - FIXED HOST BINDING FOR RENDER.COM
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} at host 0.0.0.0`);
});