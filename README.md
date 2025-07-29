Sangam App: Connecting Communities, Empowering Local Businesses 🏘️🛍️
Table of Contents
Introduction

Key Features

Technologies Used

Architecture

Deployment

Getting Started

Prerequisites

Installation (Frontend)

Installation (Backend)

Environment Variables

Running the Application

Testing as a Resident

Contribution

License

Contact

Introduction
Sangam is a comprehensive full-stack community engagement platform designed to bridge gaps within residential societies and empower local businesses. In today's fast-paced world, societies often struggle with disconnected residents and underutilized local resources. Sangam addresses this by providing a centralized digital hub for modern society living, fostering genuine community connections, and boosting the local economy right from your doorstep.

Developed with over 28,000+ lines of code (22,000+ frontend, 6,000+ backend), Sangam aims to revolutionize how societies interact and thrive.

Key Features
Sangam comes packed with a robust set of features to enhance community life and support local commerce:

Real-time Chat & Community Buzz! 💬📸

Engineered a dynamic, real-time chat system using Socket.io.

Supports multimedia messaging, including images, videos, and audio.

Integrated Cloudinary for efficient media storage and delivery.

Utilizes Multer for robust file uploads.

Facilitates vibrant community discussions and instant communication.

Engaging Short-form Video (Reels)! 🎬❤️

Designed and implemented a captivating short-form video (reel) feature.

Includes core social functionalities: likes, comments, shares, and follow/unfollow.

Boosts user engagement by allowing residents to share their society's highlights, talents, and everyday moments.

Hyperlocal E-commerce & Local Business Support! 📍🛒

Built a robust e-commerce module for seamless transactions.

Supports secure online payments via Razorpay integration.

Offers Cash on Delivery (COD) option.

Utilizes GeoJSON for precise location-based product and service filtering, connecting residents with nearby businesses.

Unique Selling Proposition: Sangam empowers local businesses and firms to connect directly with residents, listing their products and services without the app provider needing to manage delivery logistics (unlike large e-commerce giants). This creates a direct, efficient marketplace benefiting both residents and local entrepreneurs.

Secure Authentication & Robust RESTful APIs! 🔒🔑

Implemented ironclad role-based authentication using JWT (JSON Web Tokens).

Ensures secure user sessions with cookie-based sessions.

Developed comprehensive RESTful APIs for all core functionalities, including:

Managing complaints

Broadcasting notices

Conducting polls

Organizing events

Handling user profiles, society management, and more.

Ensures a smooth, secure, and reliable experience for every user.

Modern, Responsive UI & Dark Mode! ✨📱

Crafted a fully responsive and intuitive user interface using React.js.

Styled with Tailwind CSS for utility-first design and rapid development.

Enhanced with Material UI components for a polished look.

Incorporates Framer Motion for smooth animations and transitions, elevating the user experience.

Includes built-in dark mode support for comfortable viewing in any environment.

Performance & Reliability! ⚙️✅

Through rigorous testing and debugging, diagnosed and resolved over 500+ frontend and backend bugs.

Significantly improved application performance, scalability, and overall user experience.

Live & Thriving Deployment! 🌱📊

Proudly deployed and maintained the platform on Render.

Currently serving an active user base of 50+ real society members, demonstrating its real-world applicability and stability.

Technologies Used
Sangam is built on a robust MERN stack with additional powerful tools:

Frontend (22,000+ lines of code):

React.js: For building dynamic and interactive user interfaces.

Tailwind CSS: A utility-first CSS framework for rapid UI development.

Material UI: React components for fast and easy web development.

Framer Motion: A production-ready motion library for React.

Socket.io Client: For real-time communication.

Backend (6,000+ lines of code):

Node.js: JavaScript runtime for server-side logic.

Express.js: Fast, unopinionated, minimalist web framework for Node.js.

MongoDB: NoSQL database for flexible data storage.

Mongoose: MongoDB object data modeling (ODM) for Node.js.

Socket.io: For real-time, bidirectional event-based communication.

JWT (JSON Web Tokens): For secure, stateless authentication.

Cloudinary: Cloud-based image and video management.

Multer: Node.js middleware for handling multipart/form-data (file uploads).

Razorpay: Payment gateway integration.

GeoJSON: For handling geographical data and location-based filtering.

Other:

Render: Cloud platform for deployment.

C++ (DSA): Underlying problem-solving and algorithmic foundation.

Architecture
Sangam follows a MERN stack architecture, a popular full-stack development approach:

MongoDB: The NoSQL database stores all application data, including user profiles, society details, chat messages, product listings, and more.

Express.js: The backend web application framework handles API requests, routing, and middleware.

React.js: The frontend library builds the interactive user interface, consuming data from the Express.js API.

Node.js: The JavaScript runtime environment powers both the Express.js server and the build processes for React.

Real-time features are handled by Socket.io, providing a persistent connection between the client and server for instant updates.

Deployment
The Sangam application is currently deployed and maintained on Render.

Frontend Live URL: 🔗https://sangam-frontend-492o.onrender.com/

Android App APK: 🔗https://warehouse.appilix.com/uploads/app-apk-6883dbd6a52b6-1753471958.apk

Getting Started
To get a local copy up and running, follow these simple steps.

Prerequisites
Make sure you have the following installed:

Node.js (v14.x or higher)

npm (v6.x or higher) or Yarn

MongoDB (running locally or a cloud instance like MongoDB Atlas)

Git

Installation (Frontend)
Clone the repository:

git clone <frontend-repo-url>
cd <frontend-repo-directory>

Install NPM packages:

npm install
# or yarn install

Create a .env file in the frontend root directory and add your environment variables (see Environment Variables section).

Installation (Backend)
Clone the repository:

git clone <backend-repo-url>
cd <backend-repo-directory>

Install NPM packages:

npm install
# or yarn install

Create a .env file in the backend root directory and add your environment variables (see Environment Variables section).

Environment Variables
You will need to create .env files in both your frontend and backend directories.

Frontend .env (example):

REACT_APP_BACKEND_URL=http://localhost:5000/api
# Add other frontend specific env variables like Cloudinary keys if used directly

Backend .env (example):

PORT=5000
MONGO_URI=mongodb://localhost:27017/sangam_db
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
# Add any other API keys or secrets

Note: Replace placeholder values with your actual credentials. For production, use secure methods to manage these keys.

Running the Application
Start the Backend Server:
Navigate to the backend directory and run:

npm start
# or node server.js (if your main file is server.js)

The backend server should start on the specified PORT (e.g., http://localhost:5000).

Start the Frontend Development Server:
Navigate to the frontend directory and run:

npm start

The frontend application should open in your browser (usually http://localhost:3000).

Testing as a Resident
You are invited to experience Sangam firsthand!

Access Sangam: Use the web platform or download the Android app.

Login/Sign Up:

New Users: Click "New User" to create an account. You'll receive your user ID via email, which you can then use along with your password to log in.

Alternatively: You can use convenient Google Login.

Join a Society: During the onboarding process, you'll be prompted to join a society.

Enter Society ID: Use this unique Society ID to join the test society: 68636d886a8a0a8ec7c116f9

Await Approval: After requesting to join, please wait for an admin approval email. Once received, you can log in again to gain full access and explore all the features, including the buzzing community feed and the hyperlocal marketplace!

Contribution
Contributions are welcome! If you have suggestions or find issues, please open an issue or submit a pull request.

License
This project is licensed under the MIT License - see the LICENSE.md file for details (if you have one, otherwise remove this line).

Contact
Vishal - [Your LinkedIn Profile URL] (e.g., https://www.linkedin.com/in/your-profile/)

Email: [Your Email Address] (e.g., your.email@example.com)

Project Link: https://github.com/your-github-repo/sangam-app (Replace with your actual GitHub repo)
