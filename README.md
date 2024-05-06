# Rakuten Script

## Overview
A Node.js-based multi-threaded web scraping tool that leverages worker threads and Puppeteer to collect data concurrently from the account page after logging in to Rakuten.com. The tool navigates using proxies and exports results to a CSV file.

## Features
- **Concurrent Web Scraping**: Utilizes worker threads for efficient data collection.
- **Proxy Support**: Connects to web pages through a series of proxies provided via a CSV file.
- **CSV Export**: Aggregates the results into an easily analyzable CSV file.

## Prerequisites
- Node.js >= 14.x
- npm >= 6.x
- A CSV file containing a list of proxies in the format: `ip:port:username:password`

## Setup and Usage
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/vuids/Rakuten-Script.git

2. **Navigate to the Project Directory**:
   ```bash
   cd Rakuten-Script
   
3. **Install Dependencies**:
   ```bash
   npm install

5. **Prepare Proxies**:
   Ensure that your proxies.csv file is in the required format.
   IP:Port:Username:Password

6. **Execute the Script**:
   Adjust the CSV file path and set a task limit as desired.
   For example using the proxies.csv file from the project and 10 tasks:
   ```bash
   node main.js ./proxies.csv 10

8. **Check Output**:
   Review the generated output.csv file for the collected results.

