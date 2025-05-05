![image](https://github.com/PatrickFrankAIU/GradeManagerProject/assets/134087916/b5d814bf-e38f-456f-8f9c-cb5a98fb52fa)

## Student repository for exercises and testing for ITWEB300-2502B.    
Patrick Frank, Instructor

The front end of this project is hosted at this URL: https://troubleticketserver.onrender.com
- Login: This is just simulated. Use your first name and anything for the password. 
- _Note: The application may take a couple minutes to start if it hasn't been run in a while. _

# IT Support Ticket System - Documentation

## Overview

This project is a simple IT Support Ticket System that allows users to create, search, and view support tickets. It demonstrates a full-stack web application with a Node.js/Express backend and a vanilla JavaScript frontend.

## Project Structure

```
it-support-ticket-system/
├── public/                  # Static files served by Express
│   ├── index.html           # Main HTML file
│   ├── main.css             # Stylesheet
│   ├── main.js              # Client-side JavaScript
├── server.js                # Node.js/Express server
├── package.json             # Project dependencies and scripts
```

## Features

1. **User Authentication (Simulated)**
   - Simple login/logout functionality (no actual authentication)
   - Session persistence is simulated

2. **Ticket Management**
   - Create new support tickets with validation
   - Different ticket types (computer, software, network) with dynamic fields
   - View all tickets with sorting options
   - Search for tickets by name or ticket ID

3. **Data Validation**
   - Client and server-side validation for all ticket fields
   - Format validation for dates, employee IDs, names, etc.

4. **Data Storage**
   - In-memory storage for production environment
   - File-based storage for development environment

## Technical Implementation

### Backend (server.js)

The server is built with Express.js and provides:

1. **API Endpoints**
   - `GET /api/tickets` - Retrieve all tickets
   - `GET /api/tickets/search` - Search for tickets
   - `POST /api/tickets` - Create a new ticket
   - `GET /api/ping` - Simple API test endpoint

2. **Environment Handling**
   - Development mode: Uses file-based storage
   - Production mode: Uses in-memory storage

3. **Middleware**
   - CORS support for cross-origin requests
   - JSON body parsing
   - Static file serving
   - Error handling
   - Two custom classes: Ticket and User

### Frontend (public/*)

The frontend is built with vanilla JavaScript and provides:

1. **User Interface**
   - Login form
   - Tabbed interface for ticket operations
   - Forms with dynamic fields based on ticket type

2. **Client-Side Validation**
   - Form validation before submission
   - Error display for validation failures

3. **API Integration**
   - Fetch API for all server communication
   - Error handling for network issues

### Production Deployment on Render.com

1. **Create a new Web Service on Render.com**
   - Connect your Git repository

2. **Configure the service**
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Environment Variables:
     - `NODE_ENV=production`
     - `PORT=10000` (or let Render set it automatically)

3. **Deploy**
   - Render will automatically build and deploy your application
   - Access your application at the URL provided by Render

## Important Code Aspects

### Dynamic Form Fields

The application dynamically changes form fields based on the selected ticket type:
- Computer Hardware: Shows fields for computer model and serial number
- Software: Shows fields for software name and version
- Network: Shows fields for network location and MAC address

### Data Validation Rules

All ticket data is validated according to these rules:
- Request Date: Must be in mm/dd/yyyy format
- Employee ID: Must be a capital letter followed by 5 numbers (e.g., A12345)
- First Name: Must start with a capital letter
- Last Name: Must start with a capital letter
- Problem Description: Required

### Email Extraction

The application automatically extracts email addresses from the problem description and includes them in the ticket details.

## Limitations and Educational Purpose

This application is designed for educational purposes and has several limitations:

1. **No Real Authentication**: The login system is simulated and doesn't provide actual security
2. **Limited Data Persistence**: Production mode uses in-memory storage which is cleared when the server restarts
3. **No Database**: A real application would use a proper database instead of in-memory or file storage
4. **Basic Error Handling**: A production application would need more robust error handling

## Future Enhancements

Potential enhancements to implement:

1. Add a real authentication system with user accounts
2. Implement a database backend (MongoDB, PostgreSQL, etc.)
3. Add ticket status updates and comments
4. Create an admin interface for managing tickets
5. Implement email notifications for new tickets
6. Add file attachments for tickets
