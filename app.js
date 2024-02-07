const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const contactsRouter = require("./routes/api/contacts");
const app = express();

// mongoose
const db = mongoose.connection;
mongoose.connect(
  "mongodb+srv://bazky:Bazky99%25@cluster0.p42j4od.mongodb.net/db-contacts",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

db.once("open", () => {
  console.log("Database connection successful");
});

db.on("error", (err) => {
  console.error("Database connection error:", err);
  process.exit(1);
});

// app
const formatsLogger = app.get("env") === "development" ? "dev" : "short";
app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

app.use("/api/contacts", contactsRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

module.exports = app;
