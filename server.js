const hpp = require("hpp");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const helmet = require("helmet");
const xss = require("xss-clean");
const express = require("express");
const errorHandler = require("./middlewares/error");
const connectDB = require("./config/db");
const configureCloudinary = require("./config/cloudinary.config");

// Route files
const auth = require("./routes/auth.route");
const events = require("./routes/events.route");
const canidates = require("./routes/canidate.route");
const comments = require("./routes/comments.route");

const main = async () => {
  // Load env vars
  dotenv.config({ path: "./config/config.env" });

  // Connect to database
  await connectDB();

  // cloudinary config
  configureCloudinary();

  const app = express();

  // Body parser
  app.use(express.json());

  // Dev logging middleware
  if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  }

  // Set security headers
  app.use(helmet());
  // Prevent XSS attacks
  app.use(xss());
  // Prevent http param pollution
  app.use(hpp());
  // Enable CORS
  app.use(cors());

  // Mount routers
  app.use("/api/v1/auth/", auth);
  app.use("/api/v1/events/", events);
  app.use("/api/v1/canidates/", canidates);
  app.use("/api/v1/comments/", comments);

  app.use(errorHandler);

  app.get("/", (req, res) => {
    res.send("Hello");
  });

  const PORT = process.env.PORT || 5000;

  app.listen(
    PORT,
    console.log(
      `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    )
  );
};

main();

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  // server.close(() => process.exit(1));
});
