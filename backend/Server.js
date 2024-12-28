const express = require('express');
const cors = require('cors');
const csvtojson = require('csvtojson');
const path = require('path');

const app = express();
app.use(cors());

// Load and parse the CSV file
const CSV_FILE = path.join(__dirname, 'cleaned_dump.csv');
let companyData = [];

csvtojson()
  .fromFile(CSV_FILE)
  .then((data) => {
    companyData = data;
    console.log('CSV file loaded successfully');
  })
  .catch((err) => console.error('Error loading CSV file:', err));

// API to get a list of companies (minimal data)
app.get('/api/companies', (req, res) => {
  const companies = companyData
    .map((row) => row.index_name) // Extract only the company names
    .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
  res.json(companies);
});

// API to get details for a specific company (minimal data)
app.get('/api/companies/:name', (req, res) => {
  const company = companyData
    .filter((row) => row.index_name === req.params.name)
    .map((row) => ({
      index_date: row.index_date,
      closing_index_value: row.closing_index_value,
    }));
  if (company.length === 0) {
    return res.status(404).json({ error: 'Company not found' });
  }
  res.json(company);
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
