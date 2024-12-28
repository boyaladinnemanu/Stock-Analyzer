import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { Line } from 'react-chartjs-2';
// Importing necessary components from Chart.js
import { Chart as ChartJS, CategoryScale, LinearScale, Title, Tooltip, Legend, LineElement, PointElement } from 'chart.js';

// Register the components with Chart.js
ChartJS.register(CategoryScale, LinearScale, Title, Tooltip, Legend, LineElement, PointElement);

const App = () => {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // State to track search input

  // Fetch company list
  useEffect(() => {
    axios.get('http://localhost:5000/api/companies')
      .then((response) => {
        console.log(response.data); // Debug log
        setCompanies(response.data);
        setFilteredCompanies(response.data); // Initially set filtered companies to the full list
      })
      .catch((error) => console.error('Error fetching companies:', error));
  }, []);

  // Handle company search
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    const filtered = companies.filter(company =>
      company.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCompanies(filtered); // Update filtered list based on search query
  };

  // Fetch data for a selected company
  const handleCompanyClick = (company) => {
    axios.get(`http://localhost:5000/api/companies/${company}`)
      .then((response) => {
        setSelectedCompany(company);

        // Prepare data for the chart
        const labels = response.data.map((row) => row.index_date);
        const values = response.data.map((row) => row.closing_index_value);

        setChartData({
          labels,
          datasets: [
            {
              label: `Closing Index Value for ${company}`,
              data: values,
              borderColor: '#4bc0c0',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderWidth: 2,
              tension: 0.4,
            },
          ],
        });
      })
      .catch((error) => console.error(`Error fetching data for ${company}:`, error));
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h2 className="sidebar-title">Companies</h2>

        {/* Search Bar */}
        <input
          type="text"
          className="search-bar"
          placeholder="Search companies..."
          value={searchQuery}
          onChange={handleSearchChange}
        />

        <div className="company-list-container">
          <ul className="company-list">
            {filteredCompanies.length === 0 ? (
              <p>No companies found.</p>
            ) : (
              filteredCompanies.map((company) => (
                <li
                  key={company}
                  onClick={() => handleCompanyClick(company)}
                  className="company-list-item"
                >
                  {company}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <h2 className="selected-company-title">{selectedCompany || 'Select a company'}</h2>
        {chartData ? (
          <Line
            data={chartData}
            options={{
              responsive: true,
              scales: {
                x: {
                  type: 'category', // Explicitly set the type to 'category'
                  title: { display: true, text: 'Date' },
                },
                y: {
                  type: 'linear', // Explicitly set the type to 'linear'
                  title: { display: true, text: 'Closing Index Value' },
                },
              },
            }}
          />
        ) : (
          <p className="no-data-text">Select a company to view its data.</p>
        )}
      </div>
    </div>
  );
};

export default App;
