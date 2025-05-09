# Planorama

![planorama](https://github.com/user-attachments/assets/806542d8-32b1-4ac2-81d5-99284b8900a6)

Planorama is a scheduling and booking application designed to streamline event management. It provides a user-friendly interface for creating, managing, and viewing bookings.

Link to application: [TBA]

## Features

- User-friendly frontend built with modern web technologies.
- Backend powered by Node.js and MongoDB for efficient data handling.
- Real-time updates and seamless integration between frontend and backend.
- Easy setup and deployment instructions.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB (v4.4 or higher)

## Setup Instructions for running Frontend locally

1. Open terminal and navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2. Install the required packages:
    ```bash
    npm install
    ```
3. Run the application:
    ```bash
    npm run dev
    ```
4. Open the local URL provided in the terminal in your web browser.

## Setup Instructions for running Backend locally

1. Open terminal and navigate to the backend directory:
    ```bash
    cd backend
    ```
2. Install the required packages:
    ```bash
    npm install
    ```
3. Ensure your local MongoDB instance is running (for Mac):
    ```bash
    brew services start mongodb-community
    brew install mongosh
    mongosh
    use scheduler
    ```
4. Start the backend server:
    ```bash
    node server.js
    ```

## Project Structure

The project is organized into the following directories and files:

```
planorama-slides.pdf
README.md
backend/
    allisonkey.txt
    dummyEvents.json
    package.json
    server.js
    vercel.json
    weather.js
frontend/
    eslint.config.js
    index.html
    package.json
    README.md
    tsconfig.app.json
    tsconfig.json
    tsconfig.node.json
    vite.config.ts
    public/
        vite.svg
    src/
        App.js
        App.tsx
        index.css
        index.js
        main.tsx
        vite-env.d.ts
        assets/
            hunter-campus-2001415976.jpg
            react.svg
        pages/
            AssistantSidebar.tsx
            BookingForm.tsx
            Calendar.tsx
```

### Key Files and Directories

- **backend/**: Contains server-side code and configurations.
  - `server.js`: Main backend server file.
  - `dummyEvents.json`: Sample data for testing.
  - `weather.js`: Handles weather-related functionalities.

- **frontend/**: Contains client-side code and configurations.
  - `src/`: Source code for the frontend application.
    - `App.tsx`: Main application component.
    - `pages/`: Contains individual page components like `BookingForm.tsx` and `Calendar.tsx`.
  - `public/`: Public assets like images and icons.

- **planorama-slides.pdf**: Presentation slides for the project.
- **README.md**: Documentation for the project.

## Usage

To verify that events are being added to the local backend database:

1. Open `mongosh` in your terminal.
2. Switch to the `scheduler` database:
    ```bash
    use scheduler
    ```
3. View the bookings collection:
    ```bash
    db.bookings.find()
    ```

## Contributing

We welcome contributions! To contribute:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes and push them to your branch.
4. Submit a pull request with a detailed description of your changes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
