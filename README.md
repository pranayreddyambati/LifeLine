# LifeLine Application
<p>Visit the live site: <a href="https://lifeline-bloodbank-jyn6.onrender.com/">LifeLine-BloodBank</a></p>

## Overview
LifeLine is a web application designed to facilitate blood donation and manage blood requests for patients. It connects donors with patients and hospitals, providing a seamless experience for users to sign up, log in, make requests, and donate blood.

## Features
- User Registration and Login
- Hospital Registration and Login
- Blood Donation by Donors
- Blood Request Creation by Users
- Hospital Dashboard for Managing Requests
- User Dashboard for Viewing Pending Requests and Finding Donors

## Tech Stack
- Node.js
- Express.js
- MongoDB
- Mongoose
- EJS
- bcrypt
- dotenv
- body-parser
- express-session

## Prerequisites
- Node.js installed
- MongoDB Atlas account or local MongoDB setup

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo/lifeline.git
   ```

2. Navigate to the project directory:
   ```sh
   cd lifeline
   ```

3. Install dependencies:
   ```sh
   npm install
   ```

4. Set up environment variables:
   Create a `.env` file in the root directory with the following content:
   ```env
   MONGODB_USERNAME=your_mongodb_username
   MONGODB_PASSWORD=your_mongodb_password
   SESSION_KEY=your_session_secret_key
   ```

5. Start the server:
   ```sh
   npm start
   ```

## Usage

1. Open a browser and go to `http://localhost:5000`.
2. Sign up as a user or hospital.
3. Log in with your credentials.
4. Users can create blood requests and donate blood.
5. Hospitals can manage requests from the dashboard.

## Folder Structure

```
/lifeline
│
├── public
│   ├── UserSignIn.html
│   ├── UserSignUp.html
│   ├── HospitalSignIn.html
│   ├── HospitalSignUp.html
│
├── views
│   ├── UserDashboard.ejs
│   ├── HospitalDashboard.ejs
│
├── .env
├── .gitignore
├── server.js
├── package.json
├── package-lock.json
└── README.md
```

## Routes

### User Routes

- `GET /`: Render the sign-in page.
- `GET /signin`: Render the sign-in page.
- `GET /signup`: Render the sign-up page.
- `POST /signup`: Handle user sign-up.
- `POST /login`: Handle user login.
- `GET /UserDashboard`: Render the user dashboard.
- `POST /request`: Handle blood request creation.
- `POST /donate`: Handle blood donation.
- `GET /signout`: Handle user sign-out.

### Hospital Routes

- `GET /hospital`: Render the hospital sign-in page.
- `GET /hospitals/signin`: Render the hospital sign-in page.
- `GET /hospitals/signup`: Render the hospital sign-up page.
- `POST /hospitals/signup`: Handle hospital sign-up.
- `POST /hospitals/signin`: Handle hospital sign-in.
- `GET /hospitals/dashboard`: Render the hospital dashboard.
- `POST /approve`: Handle request approval by hospitals.
- `POST /reject`: Handle request rejection by hospitals.
- - `GET /signout`: Handle hospital sign-out.

## Contributors
<ul>
         <li><a href="https://github.com/VenkatreddyPadala">Venkat Reddy Padala</a></li>
         <li><a href="https://github.com/pranayreddyambati">Pranay Reddy Ambati</a></li>
         <li><a href="https://github.com/ordr-github">Deepak Reddy Obulareddy</a></li>
         <li><a href="https://github.com/revanth0514">Revanth Chowdary Garapati</a></li>
         <li><a href="https://github.com/print-keer">Keerthi Manoja</a></li>
         <li><a href="https://github.com/Sravanthikurumoju">Sravanthi Vani</a></li>
      </ul>
