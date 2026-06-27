# Employee Management System

A full-stack, real-time employee directory built with modern web technologies. This application allows you to manage employees, view their details, export data to Excel, and see a live stream of administrative actions using WebSockets.

## Tech Stack
- **Frontend**: React, Vite, Socket.io-client, SheetJS (for Excel exports)
- **Backend**: Node.js, Express, Socket.io
- **Database**: MySQL

## Prerequisites
- Node.js installed
- MySQL installed and running locally

## Local Setup Instructions

### 1. Database Setup
1. Create a local MySQL database named `emp_db02`.
2. The necessary tables (`activities` and `employees`) will be created automatically by the backend setup script or upon connection.

### 2. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` folder with your MySQL credentials (e.g., Aiven Cloud DB):
   ```
   DB_HOST=mysql-1fce6a6c-...aivencloud.com
   DB_USER=avnadmin
   DB_PASS=your_aiven_password
   DB_NAME=defaultdb
   DB_PORT=25434
   ```
4. Start the backend server:
   ```bash
   npm start
   ```
   The backend should now be running on `http://localhost:5000`.

### 3. Frontend Setup
1. Open a **new** terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open the displayed local URL (typically `http://localhost:5173`) in your browser to view the app!

## Features
- **Real-time Activity Feed**: A slide-out drawer showing recent administrative actions synced across all connected clients via WebSockets.
- **Excel Exports**: Click to instantly export the employee directory to an Excel spreadsheet with premium styling, visible borders, and perfectly formatted currency/dates.
- **CRUD Operations**: Full ability to create, read, update, and delete employee records securely.
