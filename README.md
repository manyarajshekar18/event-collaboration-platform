# 🎉 Event Collaboration Platform

## 📌 Project Overview
The Event Collaboration Platform is a full-stack web application that helps **organizers and service providers collaborate efficiently** while managing events.

Instead of using multiple tools, this platform brings **event creation, applications, communication, and management into one place**.

---

## 🎯 Problem Statement
Organizing events is challenging because:
- Difficult to find reliable service providers
- Communication happens across multiple platforms
- Managing tasks and coordination is complex

---

## 💡 Solution
This platform solves the problem by:
- Connecting organizers and providers
- Providing a structured application system
- Enabling direct communication (chat)
- Managing everything in a single dashboard

---

## 👥 User Roles

### 👤 Organizer
- Create and manage events
- View provider applications
- Accept providers
- Chat with participants

### 👷 Provider
- Browse available events
- Apply with proposal & budget
- Communicate with organizers

---

## 🚀 Key Features

- ✅ Event creation & management  
- ✅ Provider application system  
- ✅ Event-based chat system  
- ✅ Role-based authentication    
- ✅ Responsive UI  

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Tailwind CSS

### Backend
- Node.js
- Express.js

### Database
- MongoDB Atlas

### Authentication
- JWT (JSON Web Token)

---

## 🏗️ Project Architecture

### 🔹 Backend Structure
- **Models** → Database structure (User, Event, Message)
- **Controllers** → Business logic
- **Routes** → API endpoints
- **Middleware** → Authentication & validation

### 🔹 Frontend Structure
- **Pages** → Dashboard, Events, Chat
- **Components** → Sidebar, UI elements
- **Services** → API communication

---

## 🔄 Application Flow

1. User registers/login
2. Organizer creates event
3. Providers browse and apply
4. Organizer reviews applications
5. Participants communicate using chat

---

## 💬 Chat System
- Event-based messaging
- Only participants can chat
- Messages stored in MongoDB
- Polling used for updates


---

## 🌐 Local Run

Backend:

1. Start backend
   npm run dev
http://localhost:5000

Frontend:

2. Start frontend
   npm start
http://localhost:3000

3. Open browser:
   http://localhost:3000


