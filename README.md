# RSRVR

## Setup Instructions for frontend:

1. Open terminal and navigate to frontend directory 
    ```bash 
    cd frontend
    ```
2. Install packages
    ```bash 
    npm install
    ```
3. Run application
    ```bash
    npm run dev
    ```
4. Paste local url into web browser

## Setup Instructions for backend:

1. Open terminal and navigate to backend directory
    ```bash 
    cd backend
    ```

2. Install packages
    ```bash 
    npm install
    ```
3. Make sure local MongoDB instance is running
    ```
    brew services start mongodb-community
    brew install mongosh
    mongosh
    use scheduler 
    ```
4. Start the backend server
    ```
    node server.js
    ```