# CarePulse: AI-Driven Digital Health Platform

This is a full-stack MERN application (MongoDB, Express.js, React.js, Node.js) with a modern UI built using Tailwind CSS and Framer Motion.

## Prerequisites

Make sure you have the following installed on your machine:
- **Node.js** (v16+)
- **MongoDB** (Running locally or a MongoDB URI)

## How to Run the Project Locally

You will need to start both the backend and frontend servers in separate terminal windows.

### 1. Start the Backend Server

Open a new terminal window and navigate to the `backend` directory:

```bash
cd backend
npm install   # (Only needed the first time)
npm run dev
```

*Note: The backend will run on `http://localhost:5000`. If you have MongoDB running locally, uncomment line 10 (`connectDB();`) in `backend/server.js` to connect to the database.*

### 2. Start the Frontend Server

Open another terminal window and navigate to the `frontend` directory:

```bash
cd frontend
npm install   # (Only needed the first time)
npm run dev
```

*Note: The frontend will be available at `http://localhost:5173`. Open this URL in your browser to view the app.*

## Project Structure

- `/backend`: Contains the Express server, MongoDB models, API routes, and configuration.
- `/frontend`: Contains the Vite React application, Tailwind CSS configuration, and UI components.
