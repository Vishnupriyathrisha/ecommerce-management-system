const Student = require("../models/studentModel");

// POST - Create Student
exports.createStudent = async (req, res) => {
    try {
        const student = new Student(req.body);
        const data = await student.save();

        res.json(data);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// GET - Get all students
exports.getStudents = async (req, res) => {
    try {
        const data = await Student.find();

        res.json(data);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
// POST - Update student
exports.updateStudent = async (req, res) => {
    try {

        const data = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(data);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.createStudent = async (req, res) => {
    try {
        const student = new Student(req.body);

        const data = await student.save();

        res.json({
            message: "Data stored successfully",
            data: data
        });

    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};