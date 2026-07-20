# 🏨 QuickStay – Backend Services

QuickStay Backend is a scalable RESTful backend system for a hotel reservation and payment platform.
It handles user authentication, hotel listings, booking management, and secure payment processing,
designed with a modular architecture for production-grade reliability.

---

## 🚀 Backend Features

- RESTful APIs for users, hotels, and bookings
- Secure authentication and authorization using Clerk
- Stripe payment gateway integration with tokenized transactions
- Idempotent payment handling to prevent duplicate charges
- Centralized error handling and validation
- MongoDB-based persistent storage
- Modular, scalable backend architecture

---

## 🧠 Backend Responsibilities

- User session and access control management  
- Hotel and booking CRUD operations  
- Secure payment processing and validation  
- Data consistency and transactional reliability  
- Structured JSON responses for frontend clients  

---

## 🛠️ Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- Clerk (Authentication)
- Stripe (Payments)
- REST APIs

---

## 🔄 Backend Workflow

Client Request  
→ Authentication & Authorization  
→ Validation  
→ Business Logic  
→ Database Operations  
→ Payment Processing (Stripe)  
→ JSON Response  

---

## ▶️ How to Run

1. Install dependencies  
   npm install

2. Configure environment variables (.env)  
   PORT=5000  
   MONGO_URI=your_mongodb_uri  
   STRIPE_SECRET_KEY=your_stripe_key  
   CLERK_SECRET_KEY=your_clerk_key  

3. Start server  
   npm run dev

Backend runs on http://localhost:5000

---

## 🎯 Design Goals

- Clean separation of concerns
- Secure and reliable payment handling
- Scalable API-driven backend
- Production-ready architecture
