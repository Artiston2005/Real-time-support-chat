# Real-Time Support Chat Application

## Internship Details
- **Intern ID:** CITS1467
- **Full Name:** Ashwin Yadav
- **No. of Weeks:** 8 Weeks
- **Project Name:** Real-Time Support Chat
- **Project Scope:** Development of a full-stack real-time customer support chat application. The system features a Next.js frontend with a floating customer widget, an agent dashboard for handling multiple support tickets concurrently, and a Node.js/Express backend powered by Socket.io for low-latency WebSocket communication. It utilizes MongoDB for persistent storage of chat sessions, tickets, and messages.

---

## Project Contents

### 1. Source Code
The repository is structured as a monorepo containing two main parts:
- **`frontend/`**: Contains the Next.js (App Router) application, built with React, Tailwind CSS, and Zustand for state management. It includes both the Customer Widget and the Agent Dashboard.
- **`backend/`**: Contains the Node.js API server using Express.js and Socket.io. It handles real-time WebSocket events and REST API endpoints, backed by MongoDB.

### 2. README File
This file serves as the core documentation for the project, providing an overview of the stack, architecture, and setup instructions.

### 3. Screenshots & Output Images
<img width="2560" height="1240" alt="Screenshot 2026-06-03 at 14-45-48 Create Next App" src="https://github.com/user-attachments/assets/d5d9da56-1ed6-44aa-96b4-2a06ea7d1fcb" />
<img width="2560" height="1240" alt="Screenshot 2026-06-03 at 14-45-39 Create Next App" src="https://github.com/user-attachments/assets/6adeddbc-ee59-415c-af8e-f7e6048ac089" />

- **Customer Widget:** Showing the collapsed and expanded states of the chat bubble.
- **Agent Dashboard:** Showcasing the sidebar with active sessions and the main chat view.
- **Real-Time Sync:** A side-by-side output image of the customer and agent chatting seamlessly.

### 4. Documentation
**Tech Stack:**
- **Frontend:** Next.js, React, Tailwind CSS, Zustand, socket.io-client
- **Backend:** Node.js, Express.js, Socket.io
- **Database:** MongoDB (via Mongoose)

**How to Run Locally:**
1. **Start the Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   *The backend will run on port `5000` (or spin up an in-memory database automatically if local MongoDB is unavailable).*

2. **Start the Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *The frontend will run on port `3000`.*
   - Customer View: [http://localhost:3000](http://localhost:3000)
   - Agent View: [http://localhost:3000/agent](http://localhost:3000/agent)
