const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const path = require("path");

// Initialize Express app
const app = express();
dotenv.config();

const port = process.env.PORT || 5000;

const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;
const sessionKey = process.env.SESSION_KEY;

// MongoDB Connection

mongoose
  .connect(`mongodb+srv://${username}:${password}@cluster0.fkqg6vm.mongodb.net/LifeLine?retryWrites=true&w=majority`)
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// Use the session middleware
app.use(
  session({
    secret: sessionKey,
    resave: false,
    saveUninitialized: false,
  })
);

// Define Schemas
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneNumber: { type: Number, required: true },
  password: { type: String, required: true },
});

const hospitalUserSchema = new mongoose.Schema({
  hospName: { type: String, required: true },
  hospID: { type: Number, required: true },
  password: { type: String, required: true },
});

const donorDetailsSchema = new mongoose.Schema({
  donorName: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  location: { type: String, required: true },
  phoneNumber: { type: Number, required: true },
});

const pendingRequestSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  phoneNumber: { type: Number, required: true },
  hospitalName: { type: String, required: true },
  hospitalID: { type: Number, required: true },
  bloodGroup: { type: String, required: true },
  location: { type: String, required: true },
  validationStatus: { type: Number, default: 0 }
});

// Create Models
const User = mongoose.model("User", userSchema);
const HospitalUser = mongoose.model("HospitalUser", hospitalUserSchema);
const Pending = mongoose.model("Pending", pendingRequestSchema);
const Donor = mongoose.model("Donor", donorDetailsSchema);

// Request Route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "UserSignIn.html"));
});

app.get("/signin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "UserSignIn.html"));
});

app.post("/login", async (req, res) => {
  const { phoneNumber, password } = req.body;

  try {
    const loggedInUser = await User.findOne({ phoneNumber: phoneNumber });

    if (loggedInUser) {
      const passwordMatch = await bcrypt.compare(
        password,
        loggedInUser.password
      );

      if (passwordMatch) {
        req.session.userLoggedIn = true;
        req.session.userNumber = phoneNumber;
        res.redirect("/UserDashboard");
      } else {
        res.send(
          `<script>alert("Invalid phone number or password. Please try again."); window.location.href = "/";</script>`
        );
      }
    } else {
      res.send(
        `<script>alert("Invalid phone number or password. Please try again."); window.location.href = "/";</script>`
      );
    }
  } catch (err) {
    console.error("Error during login:", err.message);
    res.send(
      `<script>alert("An unexpected error occurred. Please try again later."); window.location.href = "/";</script>`
    );
  }
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "UserSignUp.html"));
});

app.post("/signup", async (req, res) => {
  const { firstName, lastName, phoneNumber, password } = req.body;
  if (!phoneNumber || phoneNumber.length !== 10) {
    res.send(
      `<script>alert("Phone number must be exactly 10 digits."); window.location.href = "/signup";</script>`
    );
    return;
  }

  try {
    const existingUser = await User.findOne({ phoneNumber: phoneNumber });

    if (existingUser) {
      res.send(
        `<script>alert("Phone number already exists. Please choose a different phone number."); window.location.href = "/signup";</script>`
      );
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        firstName,
        lastName,
        phoneNumber,
        password: hashedPassword,
      });

      await newUser.save();
      res.redirect("/");
    }
  } catch (err) {
    console.error("Error during signup:", err.message);
    res.send(
      `<script>alert("An unexpected error occurred. Please try again later."); window.location.href = "/signup";</script>`
    );
  }
});

// Route for signing out
app.get("/signout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    }
    res.redirect("/");
  });
});

app.get("/UserDashboard", async (req, res) => {
  try {
    const userNumber = req.session.userNumber;

    if (!userNumber) {
      res.send(
        `<script>alert("You need to sign in first."); window.location.href = "/signin";</script>`
      );
      return;
    }

    // Retrieve user data from the database
    const user = await User.findOne({ phoneNumber: userNumber });

    if (!user) {
      console.error("User not found:", userNumber);
      res.status(404).send("User not found.");
      return;
    }

    const pendingRequests = await Pending.find({ phoneNumber: userNumber });
    const validationStatusdPendingRequests = await Pending.find({
      phoneNumber: userNumber,
      validationStatus: 1,
    });

    let donors = [];

    if (validationStatusdPendingRequests.length > 0) {
      const bloodGroups = validationStatusdPendingRequests.map(
        (request) => request.bloodGroup
      );
      donors = await Donor.find({
        bloodGroup: { $in: bloodGroups },
        phoneNumber: { $ne: userNumber },
      });
    }

    // Retrieve hospitals data from the database
    const hospitals = await HospitalUser.find({}, "hospID hospName"); // Fetch only hospID and hospName fields
    // Assuming Hospital is your hospital model

    res.render("UserDashboard", {
      user,
      pendingRequests,
      donors: JSON.stringify(donors),
      userNumber,
      showFindSection: validationStatusdPendingRequests.length > 0,
      hospitals: hospitals, // Pass hospitals data to the template
    });
  } catch (err) {
    console.error("Error fetching data:", err);
    res
      .status(500)
      .send("An error occurred while fetching data. Please try again later.");
  }
});

app.post("/request", async (req, res) => {
  const userNumber = req.session.userNumber;

  if (!userNumber) {
      res.send(`<script>alert("You need to sign in first."); window.location.href = "/signin";</script>`);
      return;
  }

  const { patientName, hospitalID, hospitalName, bloodGroup, location } = req.body;


  try {
      const hospital = await HospitalUser.findOne({ hospID: hospitalID });

      if (!hospital) {
          res.send(`<script>alert("Invalid Hospital ID. Please enter a valid Hospital ID."); window.location.href = "/success";</script>`);
          return;
      }

      const newPending = new Pending({
          patientName,
          phoneNumber: userNumber,
          hospitalName,
          hospitalID,
          bloodGroup,
          location,
          validationStatus: 0,
      });

      await newPending.save();
      res.redirect("/UserDashboard");
  } catch (error) {
      console.error("Error creating pending request:", error);
      res.status(500).send("An error occurred while creating the pending request.");
  }
});

app.post("/donate", async (req, res) => {
  const { donorName, bloodGroup, location, phoneNumber } = req.body;
  const newDonor = new Donor({
    donorName,
    bloodGroup,
    location,
    phoneNumber,
  });
  try {
    await newDonor.save();
    res.redirect("/UserDashboard");
  } catch (error) {
    console.error("Error saving donor:", error);
    res.status(500).send("An error occurred while saving the donor.");
  }
});

app.get("/hospital", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "HospitalSignIn.html"));
});

app.post("/hospitals/signin", async (req, res) => {
  const { hospID, password } = req.body;

  try {
    // Find hospital user by ID
    const hospital = await HospitalUser.findOne({ hospID: hospID });

    if (hospital) {
      // Compare passwords
      const passwordMatch = await bcrypt.compare(password, hospital.password);

      if (passwordMatch) {
        // Set session variables
        req.session.hospitalLoggedIn = true;
        req.session.hospitalLoggedInID = hospID;
        res.redirect("/hospitals/dashboard");
      } else {
        res.send(
          `<script>alert("Invalid hospital ID or password. Please try again."); window.location.href = "/hospitals/signin";</script>`
        );
      }
    } else {
      res.send(
        `<script>alert("Invalid hospital ID or password. Please try again."); window.location.href = "/hospitals/signin";</script>`
      );
    }
  } catch (err) {
    console.error("Error during hospital sign-in:", err.message);
    res.send(
      `<script>alert("An unexpected error occurred. Please try again later."); window.location.href = "/hospitals/signin";</script>`
    );
  }
});

app.get("/hospitals/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "HospitalSignUp.html"));
});

app.post("/hospitals/signup", async (req, res) => {
  const { hospName, docName, hospID, password } = req.body;

  try {
    // Check if hospital ID already exists
    const existingHospital = await HospitalUser.findOne({ hospID: hospID });

    if (existingHospital) {
      res.send(
        `<script>alert("Hospital ID already exists. Please choose a different ID."); window.location.href = "/hospitals/signup";</script>`
      );
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new hospital user
      const newHospital = new HospitalUser({
        hospName,
        docName,
        hospID,
        password: hashedPassword,
      });

      // Save new hospital user
      await newHospital.save();
      res.redirect("/hospital");
    }
  } catch (err) {
    console.error("Error during hospital signup:", err.message);
    res.send(
      `<script>alert("An unexpected error occurred. Please try again later."); window.location.href = "/hospitals/signup";</script>`
    );
  }
});

// Hospital dashboard route with improved error handling
app.get("/hospitals/dashboard", authenticateHospital, async (req, res) => {
  try {
    const hospital = await HospitalUser.findOne({
      hospID: req.session.hospitalLoggedInID,
    });

    if (!hospital) {
      res.redirect("/hospitals/signin");
      return;
    }

    const pendingRequests = await Pending.find({
      hospitalID: hospital.hospID,
      validationStatus: 0,
    });
    const approvedRequests = await Pending.find({
      hospitalID: hospital.hospID,
      validationStatus: 1,
    });
    const rejectedRequests = await Pending.find({
      hospitalID: hospital.hospID,
      validationStatus: -1,
    });

    res.render("HospitalDashboard", {
      pendingRequests,
      approvedRequests,
      rejectedRequests,
    });
  } catch (err) {
    console.error("Error fetching hospital dashboard data:", err.message);
    res.status(500).send("An error occurred while fetching data.");
  }
});
// Approval and rejection routes with improved error handling
app.post("/approve", authenticateHospital, async (req, res) => {
  try {
    const requestId = req.body.requestId;
    await Pending.findByIdAndUpdate(requestId, { validationStatus: 1 });
    res.redirect("/hospitals/dashboard");
  } catch (err) {
    console.error("Error approving request:", err.message);
    res.status(500).send("An error occurred while approving the request.");
  }
});

app.post("/reject", authenticateHospital, async (req, res) => {
  try {
    const requestId = req.body.requestId;
    await Pending.findByIdAndUpdate(requestId, { validationStatus: -1 });
    res.redirect("/hospitals/dashboard");
  } catch (err) {
    console.error("Error rejecting request:", err.message);
    res.status(500).send("An error occurred while rejecting the request.");
  }
});

app.get("/hospitals/signout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    }
    res.redirect("/hospitals/signin");
  });
});

// Middleware to authenticate hospital
function authenticateHospital(req, res, next) {
  if (req.session.hospitalLoggedIn) {
    next();
  } else {
    res.redirect("/hospitals/signin");
  }
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
