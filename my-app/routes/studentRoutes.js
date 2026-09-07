const express = require("express");
const router = express.Router();

const studentController = require("../controllers/studentController");

router.post("/students", studentController.createStudent);

router.get("/students", studentController.getStudents);

router.post("/students/update/:id", studentController.updateStudent);
module.exports = router;
