const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Data file path
const TICKETS_FILE = path.join(__dirname, 'data', 'tickets.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

// Ensure tickets file exists
if (!fs.existsSync(TICKETS_FILE)) {
    fs.writeFileSync(TICKETS_FILE, JSON.stringify([]));
}

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
    const { query } = req.query;
    
    if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
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
    const ticketData = req.body;
    
    // Validate ticket data
    const validationErrors = Ticket.validate(ticketData);
    if (validationErrors.length > 0) {
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

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});