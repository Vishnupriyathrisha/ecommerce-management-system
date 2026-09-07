const User = require("../models/User");
const trimallrequest = require("../middleware/trimallrequest");
const validateGetData = require("../helpers/validateGetData");

const authMiddleware = require("../middleware/authMiddleware");

const {
  getUserById,
} = require("../controllers/userController");

const express = require("express");
const router = express.Router();

/* GET users listing. */
router.get("/", function (req, res) {
  res.send("Get All Users");
});

router.post("/add", async function (req, res) {
  const user = new User({
    name: "Vishnu",
    age: 23,
    city: "Madurai",
  });

  await user.save();

  res.send("User Saved Successfully");
});

router.put("/updated/:id", function (req, res) {
  res.send("User updated successfully");
});

router.delete("/delete/:id", function (req, res) {
  res.send("User deleted successfully");
});

router.post(
  "/createdata",
  validateGetData,
  (req, res) => {
    res.status(201).json({
      status: 201,
      result: req.body,
      message: "Data created successfully",
    });
  }
);

// Logged-in user details
router.get(
  "/profile",
  authMiddleware,
  getUserById
);

module.exports = router;