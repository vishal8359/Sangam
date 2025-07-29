Sangam: Your Community & Local Commerce Hub 🏘️🛍️

1. About Sangam
Sangam is a comprehensive community platform designed to bridge the gaps in modern society living by fostering genuine connections among residents and empowering local businesses. In today's fast-paced world, communities often struggle with disconnected residents and underutilized local resources. Sangam provides a centralized digital hub that facilitates seamless interaction, offers dynamic content sharing, and creates a direct, hyperlocal marketplace, revitalizing local economies right within your residential complex.

2. Features
Sangam is packed with functionalities to create a vibrant and efficient community environment:

Real-time Communication & Community Buzz

Instant Messaging: Engage in real-time chats with individuals or groups.
Multimedia Sharing: Send and receive images, videos, and audio messages effortlessly.
Socket.io Integration: Powered by Socket.io for seamless, low-latency communication.
Cloudinary & Multer: Robust handling of multimedia uploads and storage.

Engaging Short-form Videos (Reels)
Create & Share Reels: Users can create and upload captivating short-form videos.
Interactive Engagement: Supports likes ❤️, comments 💬, and shares ↗️ to boost user interaction.
Follow Functionality: Users can follow their favorite content creators within the community.

Hyperlocal E-commerce & Local Business Empowerment
Local Marketplace: A dedicated module for local businesses and firms to list and sell their products/services directly to residents.
Razorpay Integration: Secure and seamless online payment processing.
Cash on Delivery (COD): Flexible payment options for users.
GeoJSON for Filtering: Location-based product filtering to ensure relevance for the hyperlocal community.
Direct-to-Consumer Model: Crucially, Sangam empowers local businesses by allowing them to connect directly with residents, listing their offerings without the platform needing to manage delivery services, thereby significantly boosting local economic growth.

Core Society Management Features
Polls: Create and participate in community polls for quick decision-making.

Events: Announce, manage, and view upcoming society events.

Notices: Centralized system for official announcements and important notices.

Complaints Management: Residents can easily lodge complaints, and admins can track and resolve them efficiently.

Custom RESTful APIs: Robust backend support for all core functionalities.

Robust Security & Authentication
Role-Based Authentication: Ensures secure access control based on user roles (e.g., resident, admin).
JWT (JSON Web Tokens): Secure user authentication and authorization.
Cookie-Based Sessions: Maintains user sessions securely.

Google Login: Convenient and fast sign-up/login option.

Modern User Interface
Fully Responsive: Optimized for seamless viewing and interaction across all devices (desktops, tablets, mobiles).
Intuitive Design: Crafted for a smooth and engaging user experience.
Dark Mode Support: Built-in toggle for a comfortable viewing experience in low-light conditions.

3. Technical Stack
Sangam is built using a powerful and modern MERN (MongoDB, Express.js, React.js, Node.js) stack, along with other cutting-edge technologies.

Frontend
React.js: A declarative, component-based JavaScript library for building dynamic user interfaces.
Tailwind CSS: A utility-first CSS framework for rapidly building custom designs.
Material UI: A popular React UI framework implementing Google's Material Design.
Framer Motion: A production-ready motion library for React to add animations and gestures.

Backend
Node.js: A JavaScript runtime for building scalable server-side applications.
Express.js: A fast, unopinionated, minimalist web framework for Node.js.
RESTful APIs: Designed and implemented for efficient data exchange between frontend and backend.
Multer: Middleware for handling multipart/form-data, primarily used for file uploads.

Database
MongoDB: A NoSQL database for flexible, scalable, and high-performance data storage.

Cloud & DevOps
Render: Platform for deploying and maintaining the application, ensuring high availability and scalability.
Cloudinary: Cloud-based image and video management service for multimedia storage and delivery.

4. Performance & Reliability
During development, over 500+ frontend and backend bugs were meticulously diagnosed and resolved, ensuring high performance, scalability, and an overall enhanced user experience. The platform is continuously monitored and maintained to provide reliable service to its active user base.

5. Project Statistics
Total Lines of Code: 28,000+
Frontend: 22,000+ lines
Backend: 6,000+ lines
Current User Base: Serving an active community of 50+ real society members.

7. Live Demo & Testing
Experience Sangam firsthand! You can access the application through the web or my Android app.

Accessing the App
Web Platform: https://sangam-frontend-492o.onrender.com/
Android App: https://warehouse.appilix.com/uploads/app-apk-6883dbd6a52b6-1753471958.apk
Joining a Society for Demo
Login/Sign Up: Open the Sangam app (web or Android). If you're new, click the "New User" button to create an account (you'll get your User ID via email), or simply use Google Login for convenience.
Join a Society: During the onboarding process, you'll be prompted to join a society.
Enter Society ID: Use the following Society ID to join the demo community: 68636d886a8a0a8ec7c116f9
Await Approval: After requesting to join, please wait for an admin approval email. Once approved, log in again to gain full access and explore all the features, including the buzzing community feed and the hyperlocal marketplace!

7. Getting Started (For Developers)
To set up Sangam locally for development or contribution:

Prerequisites
Make sure you have the following installed:

Node.js (LTS version recommended)
npm (comes with Node.js) or Yarn
MongoDB (local instance or cloud service like MongoDB Atlas)
Installation
Clone the repositories:

git clone [https://github.com/YOUR_GITHUB_USERNAME/YOUR_FRONTEND_REPO.git](https://github.com/YOUR_GITHUB_USERNAME/YOUR_FRONTEND_REPO.git)
git clone [https://github.com/YOUR_GITHUB_USERNAME/YOUR_BACKEND_REPO.git](https://github.com/YOUR_GITHUB_USERNAME/YOUR_BACKEND_REPO.git)
(Important: Replace YOUR_GITHUB_USERNAME, YOUR_FRONTEND_REPO, and YOUR_BACKEND_REPO with your actual GitHub username and repository names.)

Navigate to the frontend directory and install dependencies:

cd YOUR_FRONTEND_REPO
npm install # or yarn install
Navigate to the backend directory and install dependencies:

cd ../YOUR_BACKEND_REPO # Go back one level then into backend
npm install # or yarn install
Running the App
Backend Setup:

Create a .env file in the YOUR_BACKEND_REPO directory.
Add your MongoDB connection URI, JWT secret, Cloudinary credentials, Razorpay keys, and any other necessary environment variables (e.g., for email service if used for approval emails):
PORT=5000
MONGO_URI="your_mongodb_connection_string"
JWT_SECRET="your_jwt_secret"
CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
# EMAIL_SERVICE_USER="your_email_user"
# EMAIL_SERVICE_PASS="your_email_pass"

Start the backend server:
npm start # or node server.js (depending on your entry file)
Frontend Setup:

Create a .env file in the YOUR_FRONTEND_REPO directory.
Add your backend API URL (ensure this matches where your backend is running, e.g., if local http://localhost:5000):
REACT_APP_API_URL="http://localhost:5000/api"
Start the frontend development server:
npm start
The app should now be running locally on http://localhost:3000 (or the port specified for your frontend).

8. Contributing
Contributions are always welcome! If you have suggestions for improvements or find any bugs, please feel free to:

Fork the repository.
Create your feature branch (git checkout -b feature/AmazingFeature).
Commit your changes (git commit -m 'Add some AmazingFeature').
Push to the branch (git push origin feature/AmazingFeature).
Open a Pull Request.

## License 
This project is licensed under the [MIT License](LICENSE.md) 

10. Contact
Vishal - [vishalgupta8359@gmail.com] - [https://www.linkedin.com/in/vishal-gupta-65068b257/]
