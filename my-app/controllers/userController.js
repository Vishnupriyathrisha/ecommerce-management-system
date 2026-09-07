const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");
// =======================
// REGISTER USER
// =======================
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check all fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(
      100000 + Math.random() * 900000
    );

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      otp,
    });

    // Send OTP email
    await sendEmail(
      email,
      "Email Verification OTP",
      otp
    );
   return res.status(201).json({
    message: "User registered successfully. OTP sent to email.",
    user: {
    name: user.name,
    email: user.email,
    isVerified: user.isVerified,
  },
});

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};


// =======================
// VERIFY OTP
// =======================
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    // Find user using email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check OTP
    if (user.otp !== Number(otp)) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    // Update verification status
    user.isVerified = true;
    user.otp = null;

    await user.save();

    return res.status(200).json({
      message: "Email verified successfully",
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};


// =======================
// LOGIN USER
// =======================
const loginUser = async (req, res) => {
try {

const { email, password } = req.body;

const user = await User.findOne({ email });


if (!user) {
 return res.status(404).json({
  message:"User not found"
 });
}


if(user.password !== password){
 return res.status(400).json({
  message:"Incorrect password"
 });
}


// Generate Login OTP
const otp = Math.floor(
 100000 + Math.random() * 900000
);


// Save OTP
user.loginOtp = otp;
user.loginOtpExpiry = Date.now() + 5 * 60 * 1000;

await user.save();


// Send OTP
await sendEmail(
 email,
 "Login OTP",
 otp
);


return res.status(200).json({

message:"Password verified. OTP sent to email",

email:user.email

});


}
catch(error){

return res.status(500).json({
message:error.message
});

}

};


const verifyLoginOtp = async(req,res)=>{

try{

const {email,otp}=req.body;


const user = await User.findOne({email});


if(!user){
return res.status(404).json({
message:"User not found"
});
}


// Check OTP

if(user.loginOtp !== Number(otp)){

return res.status(400).json({
message:"Invalid OTP"
});

}


// Check expiry

if(Date.now() > user.loginOtpExpiry){

return res.status(400).json({
message:"OTP expired"
});

}


// Clear OTP

user.loginOtp=null;
user.loginOtpExpiry=null;

await user.save();


// Generate Token

const token = jwt.sign(

{
_id:user._id,
email:user.email,
role:user.role || "user"
},

process.env.JWT_SECRET,

{
expiresIn:"1d"
}

);



res.status(200).json({

message:"Login successful",

token,

user:{
name:user.name,
email:user.email,
role:user.role || "user"
}

});


}
catch(error){

res.status(500).json({
message:error.message
});

}

}

// =======================
// GET ALL USERS
// =======================
const getUsers = async (req, res) => {
  try {
    const users = await User.find();

    return res.status(200).json({
      message: "Users fetched successfully",
      users,
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};


// =======================
// GET USER BY ID
// =======================
const getUserById = async (req, res) => {
  try {
     const userId = req.userDetails._id;
    const user = await User.findById(userId).select(
      "-_id -password -otp"
);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "User fetched successfully",
      user,
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};


// =======================
// UPDATE USER
// =======================
const updateUser = async (req, res) => {
  try {
    const { id, name, email } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      {
        name,
        email,
      },
      {
        new: true,
      }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "User updated successfully",
      user,
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};


// =======================
// DELETE USER
// =======================
const deleteUser = async (req, res) => {
  try {
    const { id } = req.body;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "User deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};


// =======================
// EXPORT ALL FUNCTIONS
// =======================
module.exports = {
  registerUser,
  verifyOtp,
  loginUser,
  verifyLoginOtp,
  getUsers,
  updateUser,
  getUserById,
  deleteUser,
};