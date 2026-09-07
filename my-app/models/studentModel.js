const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    name: String,
    age: Number,
    number: String,
    address: String
});

module.exports = mongoose.model("Student", studentSchema);
