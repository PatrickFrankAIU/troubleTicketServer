// Sample ticket data to be loaded on server startup in production environment only
const sampleTickets = [
  {
    id: "T1001",
    ticketType: "computer",
    reqDate: "05/09/2025",
    empID: "A12345",
    fName: "Jane",
    lName: "Doe",
    probDesc: "Monitor displays blue screen intermittently. Contact me at jane.doe@example.com",
    contactEmails: ["jane.doe@example.com"],
    computerModel: "Dell XPS 15",
    serialNumber: "XPS15-9876543"
  },
  {
    id: "T1002",
    ticketType: "software",
    reqDate: "05/08/2025",
    empID: "B54321",
    fName: "John",
    lName: "Smith",
    probDesc: "Cannot access shared network drive. Please email john.smith@example.com for details.",
    contactEmails: ["john.smith@example.com"],
    softwareName: "Windows File Explorer",
    softwareVersion: "11.0"
  },
  {
    id: "T1003",
    ticketType: "network",
    reqDate: "05/07/2025",
    empID: "C98765",
    fName: "Alex",
    lName: "Johnson",
    probDesc: "Wi-Fi keeps disconnecting in meeting room B. alex.j@example.com",
    contactEmails: ["alex.j@example.com"],
    networkLocation: "Building 2, Floor 3",
    macAddress: "AB:CD:EF:12:34:56"
  },
  {
    id: "T1004",
    ticketType: "software",
    reqDate: "05/06/2025",
    empID: "D45678",
    fName: "Maria",
    lName: "Garcia",
    probDesc: "CRM application crashes when generating reports. Contact: m.garcia@example.com",
    contactEmails: ["m.garcia@example.com"],
    softwareName: "SalesPro CRM",
    softwareVersion: "3.2.1"
  },
  {
    id: "T1005",
    ticketType: "computer",
    reqDate: "05/05/2025",
    empID: "E87654",
    fName: "David",
    lName: "Kim",
    probDesc: "Printer not responding to print jobs. Email d.kim@example.com for status.",
    contactEmails: ["d.kim@example.com"],
    computerModel: "HP LaserJet Pro",
    serialNumber: "HP-LJ-5432109"
  }
];

module.exports = sampleTickets;
