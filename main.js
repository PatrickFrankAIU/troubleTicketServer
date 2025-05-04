// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    let loginForm = document.getElementById('login-form');
    let loginSection = document.getElementById('login-section');
    let mainSection = document.getElementById('main-section');
    let userWelcome = document.getElementById('user-welcome');
    let logoutBtn = document.getElementById('logout-btn');
    let ticketForm = document.getElementById('ticket-form');
    let ticketSuccess = document.getElementById('ticket-success');
    let ticketDetails = document.getElementById('ticket-details');
    let newTicketBtn = document.getElementById('new-ticket-btn');
    let formErrors = document.getElementById('form-errors');
    let loginError = document.getElementById('login-error');
    let ticketType = document.getElementById('ticketType');
    let dynamicFields = document.getElementById('dynamic-fields');
    let searchInput = document.getElementById('search-input');
    let searchBtn = document.getElementById('search-btn');
    let searchResults = document.getElementById('search-results');
    let tabBtns = document.querySelectorAll('.tab-btn');
    let tabContents = document.querySelectorAll('.tab-content');
    let allTicketsContainer = document.getElementById('all-tickets-container');
    let sortById = document.getElementById('sort-by-id');
    let sortByName = document.getElementById('sort-by-name');
    let sortByDate = document.getElementById('sort-by-date');
    let refreshTickets = document.getElementById('refresh-tickets');

    // Handle login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let username = document.getElementById('username').value.trim();
        let password = document.getElementById('password').value.trim();
        
        if (username === '' || password === '') {
            loginError.textContent = 'Username and password are required.';
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
            return;
        }
        
        // Simulated login (always succeeds)
        loginSection.classList.add('hidden');
        mainSection.classList.remove('hidden');
        userWelcome.textContent = 'Hello, ' + username;
    });
    
    // Handle logout
    logoutBtn.addEventListener('click', function() {
        loginSection.classList.remove('hidden');
        mainSection.classList.add('hidden');
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        loginError.textContent = '';
    });
    
    // Tab switching
    tabBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            tabBtns.forEach(function(b) {
                b.classList.remove('active');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Hide all tab contents
            tabContents.forEach(function(content) {
                content.classList.add('hidden');
            });
            
            // Show the selected tab content
            let tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.remove('hidden');
            
            // Load tickets when the all-tickets tab is selected
            if (tabId === 'all-tickets') {
                fetchAllTickets();
            }
        });
    });
    
    // Dynamic fields based on ticket type
    ticketType.addEventListener('change', function() {
        let type = this.value;
        dynamicFields.innerHTML = '';
        
        if (type === 'computer') {
            dynamicFields.innerHTML = `
                <div class="dynamic-field">
                    <div class="form-group">
                        <label for="computerModel">Computer Model:</label>
                        <input type="text" id="computerModel" name="computerModel" required>
                    </div>
                    <div class="form-group">
                        <label for="serialNumber">Serial Number:</label>
                        <input type="text" id="serialNumber" name="serialNumber" required>
                    </div>
                </div>
            `;
        } else if (type === 'software') {
            dynamicFields.innerHTML = `
                <div class="dynamic-field">
                    <div class="form-group">
                        <label for="softwareName">Software Name:</label>
                        <input type="text" id="softwareName" name="softwareName" required>
                    </div>
                    <div class="form-group">
                        <label for="softwareVersion">Version:</label>
                        <input type="text" id="softwareVersion" name="softwareVersion" required>
                    </div>
                </div>
            `;
        } else if (type === 'network') {
            dynamicFields.innerHTML = `
                <div class="dynamic-field">
                    <div class="form-group">
                        <label for="networkLocation">Network Location:</label>
                        <input type="text" id="networkLocation" name="networkLocation" required>
                    </div>
                    <div class="form-group">
                        <label for="macAddress">MAC Address:</label>
                        <input type="text" id="macAddress" name="macAddress" required>
                    </div>
                </div>
            `;
        }
    });
    
    // Validate ticket data
    function validateTicket(data) {
        let errors = [];
        
        // Validate reqDate (mm/dd/yyyy)
        if (!/^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/.test(data.reqDate)) {
            errors.push('Request date must be in mm/dd/yyyy format');
        }
        
        // Validate empID (letter followed by 5 numbers)
        if (!/^[A-Z]\d{5}$/.test(data.empID)) {
            errors.push('Employee ID must start with a capital letter followed by 5 numbers');
        }
        
        // Validate fName (starts with capital)
        if (!/^[A-Z]/.test(data.fName)) {
            errors.push('First name must start with a capital letter');
        }
        
        // Validate lName (starts with capital)
        if (!/^[A-Z]/.test(data.lName)) {
            errors.push('Last name must start with a capital letter');
        }
        
        // Validate probDesc (required)
        if (data.probDesc.trim() === '') {
            errors.push('Problem description is required');
        }
        
        return errors;
    }
    
    // Extract emails from text
    function extractEmails(text) {
        let emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        return text.match(emailRegex) || [];
    }
    
    // Handle ticket form submission
    ticketForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        let ticketData = {
            reqDate: document.getElementById('reqDate').value.trim(),
            empID: document.getElementById('empID').value.trim(),
            fName: document.getElementById('fName').value.trim(),
            lName: document.getElementById('lName').value.trim(),
            probDesc: document.getElementById('probDesc').value.trim(),
            ticketType: document.getElementById('ticketType').value
        };
        
        // Add dynamic fields based on ticket type
        if (ticketData.ticketType === 'computer') {
            ticketData.computerModel = document.getElementById('computerModel').value.trim();
            ticketData.serialNumber = document.getElementById('serialNumber').value.trim();
        } else if (ticketData.ticketType === 'software') {
            ticketData.softwareName = document.getElementById('softwareName').value.trim();
            ticketData.softwareVersion = document.getElementById('softwareVersion').value.trim();
        } else if (ticketData.ticketType === 'network') {
            ticketData.networkLocation = document.getElementById('networkLocation').value.trim();
            ticketData.macAddress = document.getElementById('macAddress').value.trim();
        }
        
        // Validate ticket
        let validationErrors = validateTicket(ticketData);
        
        if (validationErrors.length > 0) {
            formErrors.innerHTML = validationErrors.map(function(error) {
                return '<p>' + error + '</p>';
            }).join('');
            return;
        }
        
        // Extract emails from problem description
        let emails = extractEmails(ticketData.probDesc);
        ticketData.contactEmails = emails;
        
        // Submit ticket using fetch with async/await
        try {
            let response = await fetch('/api/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ticketData)
            });
            
            if (response.status === 201) {
                let ticket = await response.json();
                
                // Show success message with ticket details
                ticketForm.reset();
                dynamicFields.innerHTML = '';
                formErrors.innerHTML = '';
                
                let detailsHTML = '<p><strong>Ticket ID:</strong> ' + ticket.id + '</p>' +
                    '<p><strong>Type:</strong> ' + ticket.ticketType + '</p>' +
                    '<p><strong>Submitted by:</strong> ' + ticket.fName + ' ' + ticket.lName + ' (' + ticket.empID + ')</p>' +
                    '<p><strong>Date:</strong> ' + ticket.reqDate + '</p>' +
                    '<p><strong>Problem:</strong> ' + ticket.probDesc + '</p>';
                
                if (emails.length > 0) {
                    detailsHTML += '<p><strong>Contact Emails:</strong> ' + emails.join(', ') + '</p>';
                }
                
                ticketDetails.innerHTML = detailsHTML;
                ticketForm.classList.add('hidden');
                ticketSuccess.classList.remove('hidden');
            } else {
                let errorData = await response.json();
                formErrors.innerHTML = '<p>Error creating ticket: ' + 
                    (errorData.errors ? errorData.errors.join(', ') : 'Unknown error') + '</p>';
            }
        } catch (error) {
            formErrors.innerHTML = '<p>Network error. Please try again.</p>';
            console.error('Error:', error);
        }
    });
    
    // Create new ticket button
    newTicketBtn.addEventListener('click', function() {
        ticketSuccess.classList.add('hidden');
        ticketForm.classList.remove('hidden');
    });
    
    // Search for tickets
    searchBtn.addEventListener('click', async function() {
        let query = searchInput.value.trim();
        
        if (query === '') {
            searchResults.innerHTML = '<p>Please enter a search term</p>';
            return;
        }
        
        try {
            let response = await fetch('/api/tickets/search?query=' + encodeURIComponent(query));
            
            if (response.ok) {
                let tickets = await response.json();
                
                if (tickets.length === 0) {
                    searchResults.innerHTML = '<p>No tickets found</p>';
                    return;
                }
                
                let resultsHTML = '';
                tickets.forEach(function(ticket) {
                    resultsHTML += 
                        '<div class="ticket-item">' +
                        '<h3>Ticket ' + ticket.id + '</h3>' +
                        '<p><strong>Type:</strong> ' + ticket.ticketType + '</p>' +
                        '<p><strong>Submitted by:</strong> ' + ticket.fName + ' ' + ticket.lName + '</p>' +
                        '<p><strong>Date:</strong> ' + ticket.reqDate + '</p>' +
                        '<p><strong>Problem:</strong> ' + ticket.probDesc + '</p>' +
                        '</div>';
                });
                
                searchResults.innerHTML = resultsHTML;
            } else {
                searchResults.innerHTML = '<p>Error searching tickets</p>';
            }
        } catch (error) {
            searchResults.innerHTML = '<p>Network error. Please try again.</p>';
            console.error('Error:', error);
        }
    });
    
    // Track current sort method
    let currentSort = 'id';
    
    // Function to fetch and display all tickets
    async function fetchAllTickets() {
        allTicketsContainer.innerHTML = '<p>Loading tickets...</p>';
        
        try {
            let response = await fetch('/api/tickets');
            
            if (response.ok) {
                let tickets = await response.json();
                
                if (tickets.length === 0) {
                    allTicketsContainer.innerHTML = '<p>No tickets found</p>';
                    return;
                }
                
                // Sort tickets based on current sort method
                sortTickets(tickets, currentSort);
                
                // Display tickets
                displayAllTickets(tickets);
            } else {
                allTicketsContainer.innerHTML = '<p>Error loading tickets</p>';
            }
        } catch (error) {
            allTicketsContainer.innerHTML = '<p>Network error. Please try again.</p>';
            console.error('Error:', error);
        }
    }
    
    // Function to sort tickets
    function sortTickets(tickets, sortBy) {
        if (sortBy === 'id') {
            // Sort by ticket ID (alphanumeric)
            tickets.sort(function(a, b) {
                return a.id.localeCompare(b.id);
            });
        } else if (sortBy === 'name') {
            // Sort by last name, then first name
            tickets.sort(function(a, b) {
                let lastNameCompare = a.lName.localeCompare(b.lName);
                if (lastNameCompare === 0) {
                    return a.fName.localeCompare(b.fName);
                }
                return lastNameCompare;
            });
        } else if (sortBy === 'date') {
            // Sort by request date (newest first)
            tickets.sort(function(a, b) {
                // Convert mm/dd/yyyy to Date objects for comparison
                let dateA = new Date(a.reqDate.split('/').reverse().join('/'));
                let dateB = new Date(b.reqDate.split('/').reverse().join('/'));
                return dateB - dateA;
            });
        }
    }
    
    // Function to display tickets
    function displayAllTickets(tickets) {
        let ticketsHTML = '<div class="ticket-list">';
        
        tickets.forEach(function(ticket) {
            ticketsHTML += 
                '<div class="ticket-item">' +
                '<h3>Ticket ' + ticket.id + '</h3>' +
                '<p><strong>Type:</strong> ' + ticket.ticketType + '</p>' +
                '<p><strong>Submitted by:</strong> ' + ticket.fName + ' ' + ticket.lName + ' (' + ticket.empID + ')</p>' +
                '<p><strong>Date:</strong> ' + ticket.reqDate + '</p>' +
                '<p><strong>Status:</strong> ' + ticket.status + '</p>' +
                '<p><strong>Problem:</strong> ' + ticket.probDesc + '</p>' +
                '</div>';
        });
        
        ticketsHTML += '</div>';
        allTicketsContainer.innerHTML = ticketsHTML;
    }
    
    // Event listeners for sort buttons
    sortById.addEventListener('click', function() {
        setActiveSort(this);
        currentSort = 'id';
        fetchAllTickets();
    });
    
    sortByName.addEventListener('click', function() {
        setActiveSort(this);
        currentSort = 'name';
        fetchAllTickets();
    });
    
    sortByDate.addEventListener('click', function() {
        setActiveSort(this);
        currentSort = 'date';
        fetchAllTickets();
    });
    
    // Function to set active sort button
    function setActiveSort(button) {
        document.querySelectorAll('.sort-btn').forEach(function(btn) {
            btn.classList.remove('active');
        });
        button.classList.add('active');
    }
    
    // Event listener for refresh button
    refreshTickets.addEventListener('click', function() {
        fetchAllTickets();
    });
});