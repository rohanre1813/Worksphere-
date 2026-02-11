# WorkSphere - Office Management System

WorkSphere is a comprehensive MERN stack application designed to streamline office management, employee tracking, and real-time communication. It features role-based access control for Admins and Employees, real-time location tracking via Socket.io, and detailed analytics.

## 🚀 Features

### 👑 Admin Module
*   **Dashboard**: Overview of office activity and employee stats.
*   **Employee Management**: Add, edit, and remove employees.
*   **Real-time Map**: Visualize employee locations within the office zones.
*   **Analytics**: diverse charts showing office usage, peak times, and employee attendance.
*   **Announcements**: Post globally visible announcements.
*   **Zone Management**: Monitor specific office zones (e.g., Meeting Room, Cafeteria).

### 👷 Employee Module
*   **Dashboard**: Personal stats and announcements.
*   **QR Scanner**: Scan zone QR codes to log location/attendance.
*   **Profile**: View and manage personal details.
*   **Real-time Updates**: Receive instant notifications and announcements.

## 🛠️ Tech Stack

*   **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Lucide React, Axios.
*   **Backend**: Node.js, Express.js, Socket.io (for real-time features).
*   **Database**: MongoDB Atlas (Mongoose).
*   **Authentication**: JWT (JSON Web Tokens).
*   **Deployment**: Vercel (Frontend), Render (Backend).

## ⚙️ Installation & Local Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/worksphere.git
    cd worksphere
    ```

2.  **Backend Setup**
    ```bash
    cd backend
    npm install
    ```
    *   Create a `.env` file in the `backend` directory:
        ```env
        PORT=5000
        MONGO_URI=your_mongodb_connection_string
        JWT_SECRET=your_secret_key
        ```
    *   Start the backend:
        ```bash
        npm run dev
        ```

3.  **Frontend Setup**
    ```bash
    cd frontend
    npm install
    ```
    *   Create a `.env` file in the `frontend` directory (optional for local, defaults to localhost):
        ```env
        VITE_API_URL=http://localhost:5000
        ```
    *   Start the frontend:
        ```bash
        npm run dev
        ```

## 🌍 Deployment

### Backend (Render)
*   **Build Command**: `npm install`
*   **Start Command**: `npm start`
*   **Env Variables**: `MONGO_URI`, `JWT_SECRET`, `PORT` (set to 10000).

### Frontend (Vercel)
*   **Framework**: Vite
*   **Root Directory**: `frontend`
*   **Env Variables**: `VITE_API_URL` (Set to your Render Backend URL).
*   **Configuration**: Includes `vercel.json` for SPA routing.

## 📂 Project Structure

```
worksphere/
├── backend/            # Express server & API routes
│   ├── src/
│   │   ├── config/     # DB connection
│   │   ├── controllers/# Logic for API endpoints
│   │   ├── models/     # Mongoose Schemas
│   │   ├── routes/     # API Routes
│   │   └── server.js   # Entry point
│   └── .env            # Backend secrets
│
├── frontend/           # React application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page views
│   │   ├── hooks/      # Custom React hooks (Socket.io)
│   │   └── api.js      # Centralized API config
│   └── vercel.json     # Deployment config
```

## 🤝 Contributing

Contributions are welcome! Please fork the repository and create a pull request.

## 📄 License

This project is licensed under the MIT License.
