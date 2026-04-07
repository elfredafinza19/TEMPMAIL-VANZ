# Temporary Email Generator

## Setup Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/elfredafinza19/TEMPMAIL-VANZ.git
   ```
2. Navigate to the project directory:
   ```bash
   cd TEMPMAIL-VANZ
   ```
3. Install the required dependencies:
   ```bash
   npm install
   ```

## API Documentation
- **GET /generate**: Generate a temporary email address.
  - **Response**: A JSON object containing the email address and its expiration information.

- **GET /check/{email}**: Check if a specific temporary email has received any messages.
  - **Response**: A JSON object containing the message count and message details if available.

## Features
- Generate temporary email addresses easily.
- Check for incoming messages.
- User-friendly interface and easy integration.

## Deployment Guide
1. Ensure you have Node.js and npm installed.
2. Set up your production environment variables as needed.
3. Start the server:
   ```bash
   npm start
   ```
4. Access the application via your browser at `http://localhost:3000`.

---

### Last Updated: 2026-04-07 14:53:59 UTC