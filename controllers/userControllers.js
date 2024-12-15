const User = require('../models/user')
const transporter = require("../config/email")
const bcrypt = require('bcryptjs');
const { validateUser } = require('../validators');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const user = require('../models/user');
dotenv.config()

exports.signup = async (req, res) => {
    const { firstName, lastName, email, password, confirmPassword, role } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    // Validate user input
    let { error } = validateUser (req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    try {
        // Check if user already exists
        let user  = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists!", data: user });
        }
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(password, salt);
        
        // Creating a new user
        user = new User({ 
            firstName, 
            lastName,
            email, 
            password:hashedPassword,
            role, 
            isverified: false
        });
        
        
        // Hash the password
        // const salt = await bcrypt.genSalt(10);
        // user.password = await bcrypt.hash(user.password, salt);


        const verifyToken = user.generateVerifyToken();
        const verifyUrl = `${process.env.FRONTEND_URL}/api/userVerification/${verifyToken}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Welcome to Hotel - Verify Your Email",
            html: `
            <div style="
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: auto;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                background-color: #ffffff;
                overflow: hidden;">
                
                <!-- Header Section -->
                <div style="
                    background-color: #6dc234;
                    color: white;
                    text-align: center;
                    padding: 15px 0;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Welcome to Hotel</h1>
                </div>
                
                <!-- Body Section -->
                <div style="padding: 20px; color: #333;">
                    <p style="font-size: 16px; margin-bottom: 10px; text-align: center;">Dear <strong>${user.firstName}</strong>,</p>
                    <p style="margin-bottom: 15px; text-align: center;">
                        Thank you for choosing Hotel. We're excited to have you onboard!
                    </p>
                    <p style="font-size: 14px; text-align: center;">
                        To complete your registration, please verify your email by clicking the button below:
                    </p>
                    
                    <!-- Verification Button -->
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="${verifyUrl}" style="
                            display: inline-block;
                            background-color: #6dc234;
                            color: white;
                            padding: 12px 25px;
                            text-decoration: none;
                            border-radius: 5px;
                            font-weight: bold;
                            font-size: 16px;
                            transition: background-color 0.3s ease;">
                            Verify Your Email
                        </a>
                    </div>
        
                    <p style="font-size: 14px; color: #555; text-align: center;">
                        This link is valid for 24 hours only. Make sure to complete your verification promptly.
                    </p>
                    
                    <p style="font-size: 14px; color: #777; margin-top: 20px; text-align: center;">
                        If you did not sign up for this account, please ignore this email or contact our support team.
                    </p>
        
                    <p style="font-size: 14px; color: black; margin-top: 20px; text-align: center;">
                        Best Regards,
                    </p>
        
                    <p style="font-size: 14px; color: black; margin-top: 10px; text-align: center;">
                        The <strong>Hotel</strong> Team
                    </p>
                </div>
                
                <!-- Footer Section -->
                <div style="
                    background-color: #f4f4f4;
                    text-align: center;
                    padding: 10px;
                    font-size: 12px;
                    color: #777;">
                    <p style="margin: 0;">Hotel | Your Stay, Our Priority</p>
                    <p style="margin: 0;">03 Avenue Street, Ikeja City, Lagos</p>
                    <p style="margin: 0;">Phone: +234-901-243-7740 | Email: <a href="mailto:ebijoe911@gmail.com" style="color: #6dc234; text-decoration: none;">support@hotel.com</a></p>
                </div>
        
                <!-- Inline Style for Hover -->
                <style>
                    a:hover {
                        background-color: #5cb027;
                    }
                </style>
            </div>
            `
        };
        


        try {
            await transporter.sendMail(mailOptions)
            console.log("Email sent")
        } catch (error) {
            console.log("Email not sent")
        }
        // Save the user to the database
        await user.save();

        // Send response without sensitive data
        res.status(200).json({ message: "User Has Been Registered Successfully", data: user });

    } catch (error) {
        console.error("Signup error:", error.message); // Log error for debugging
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


exports.verifyEmail = async(req, res) => {
    const { token } = req.body;
    try {
        if(!token){
            return res.status(400).json("Invalid Token")
        }    
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
            
        const user = await User.findById(decoded.id)
        if (!user) {
            return res.status(404).json("User Not found")
        }else{
            user.isverified = true;
        }

        await user.save()

        return res.status(200).json({ message: "User verified Successfully!..", data:user})

    } catch (error) {
        console.log({ message: error.message })
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.login = async (req, res) => {
    const { email, password} = req.body
    
    try {
        const user = await User.findOne({ email })
        if(!user) {
            return res.status(404).json({ message:"Email Not Registered" })
        }

        if (!user.isverified) {
            const verificationToken = user.generateVerifyToken();
            const verifyUrl = `${process.env.FRONTEND_URL}/api/verify/${verificationToken}`;
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: "Welcome to Hotel - Verify Your Email",
                html: `
                <div style="
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: auto;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    background-color: #ffffff;
                    overflow: hidden;">
                    
                    <!-- Header Section -->
                    <div style="
                        background-color: #6dc234;
                        color: white;
                        text-align: center;
                        padding: 15px 0;">
                        <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Welcome to Hotel</h1>
                    </div>
                    
                    <!-- Body Section -->
                    <div style="padding: 20px; color: #333;">
                        <p style="font-size: 16px; margin-bottom: 10px; text-align: center;">Dear <strong>${user.firstName}</strong>,</p>
                        <p style="margin-bottom: 15px; text-align: center;">
                            Thank you for choosing Hotel. We're excited to have you onboard!
                        </p>
                        <p style="font-size: 14px; text-align: center;">
                            To complete your registration, please verify your email by clicking the button below:
                        </p>
                        
                        <!-- Verification Button -->
                        <div style="text-align: center; margin: 20px 0;">
                            <a href="${verifyUrl}" style="
                                display: inline-block;
                                background-color: #6dc234;
                                color: white;
                                padding: 12px 25px;
                                text-decoration: none;
                                border-radius: 5px;
                                font-weight: bold;
                                font-size: 16px;
                                transition: background-color 0.3s ease;">
                                Verify Your Email
                            </a>
                        </div>
            
                        <p style="font-size: 14px; color: #555; text-align: center;">
                            This link is valid for 24 hours only. Make sure to complete your verification promptly.
                        </p>
                        
                        <p style="font-size: 14px; color: #777; margin-top: 20px; text-align: center;">
                            If you did not sign up for this account, please ignore this email or contact our support team.
                        </p>
            
                        <p style="font-size: 14px; color: black; margin-top: 20px; text-align: center;">
                            Best Regards,
                        </p>
            
                        <p style="font-size: 14px; color: black; margin-top: 10px; text-align: center;">
                            The <strong>Hotel</strong> Team
                        </p>
                    </div>
                    
                    <!-- Footer Section -->
                    <div style="
                        background-color: #f4f4f4;
                        text-align: center;
                        padding: 10px;
                        font-size: 12px;
                        color: #777;">
                        <p style="margin: 0;">Hotel | Your Stay, Our Priority</p>
                        <p style="margin: 0;">03 Avenue Street, Ikeja City, Lagos</p>
                        <p style="margin: 0;">Phone: +234-901-243-7740 | Email: <a href="mailto:ebijoe911@gmail.com" style="color: #6dc234; text-decoration: none;">support@hotel.com</a></p>
                    </div>
            
                    <!-- Inline Style for Hover -->
                    <style>
                        a:hover {
                            background-color: #5cb027;
                        }
                    </style>
                </div>
                `
            };

            try {
                await transporter.sendMail(mailOptions);
                console.log("Verification email sent");
            } catch (error) {
                console.log("Error sending verification email:", error);
                return res.status(500).json({ message: "Error sending verification email" });
            }
      
            return res.status(403).json({ message: "User  account is not verified. A verification email has been sent." });
        }

        const validatePassword = await bcrypt.compare( password, user.password)
        if(!validatePassword) {
            return res.status(400).json({ message:"Incorrect Password" })
        }

        const token = user.generateLoginToken();
        res.header("auth-token", token).json({ token, user })

    } catch (error) {
        console.log({ message: error.message })
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.forgetPassword = async (req, res) => {
    const { email } = req.body;

    try{
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ message:"Email Not Registered" })
        } 

        const resetToken = user.generatePasswordResetToken();
        const resetUrl = `${process.env.FRONTEND_URL}/api/reset-password/${resetToken}`
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Password Reset Request - Your Account",
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff; overflow: hidden;">
                <!-- Header Section -->
                <div style="background-color: #ff4d4d; color: white; text-align: center; padding: 15px 0;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Reset Your Password</h1>
                </div>
        
                <!-- Body Section -->
                <div style="padding: 20px; color: #333;">
                    <p style="font-size: 16px; margin-bottom: 10px;">
                        Dear <strong>${user.firstName}</strong>,
                    </p>
                    <p style="margin-bottom: 15px;">
                        We received a request to reset your password. If you made this request, please click the button below to reset your password.
                    </p>
        
                    <!-- Reset Password Button -->
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="${resetUrl}" style="
                            display: inline-block;
                            background-color: #ff4d4d; /* Red button */
                            color: white;
                            padding: 12px 25px;
                            text-decoration: none;
                            border-radius: 5px;
                            font-weight: bold;
                            font-size: 16px;
                            transition: background-color 0.3s ease;">
                            Reset Password
                        </a>
                    </div>
        
                    <p style="font-size: 14px; color: #555;">
                        Or copy and paste this link into your browser:
                    </p>
                    <p style="
                        word-wrap: break-word;
                        font-size: 14px;
                        color: #ff4d4d;
                        background-color: #f9f9f9;
                        padding: 10px;
                        border-radius: 4px;
                        text-align: center;
                        margin-top: 10px;
                        ">
                        ${resetUrl}
                    </p>
        
                    <p style="font-size: 14px; color: #555; margin-top: 20px;">
                        This link will expire in <strong>15 minutes</strong>. If you did not request a password reset, you can safely ignore this email. We recommend changing your password if you suspect unauthorized access.
                    </p>
        
                    <p style="font-size: 14px; color: black; margin-top: 20px;">
                        Best regards,
                    </p>
                    <p style="font-size: 14px; color: black; margin-top: 10px;">
                        The <strong>HOTEL</strong> Team
                    </p>
                </div>
        
                <!-- Footer Section -->
                <div style="
                    background-color: #f4f4f4;
                    text-align: center;
                    padding: 10px;
                    font-size: 12px;
                    color: #777;
                ">
                    <p style="margin: 0;">Hotel | Your Stay, Our Priority</p>
                    <p style="margin: 0;">03 Avenue Street, Ikeja City, Lagos</p>
                    <p style="margin: 0;">Phone: +234-901-243-7740 | Email: <a href="mailto:ebijoe911@gmail.com" style="color: #6dc234; text-decoration: none;">support@hotel.com</a></p>
                </div>
        
                <!-- Inline Style for Hover -->
                <style>
                    a:hover {
                        background-color: #e63939; /* Slightly darker red on hover */
                    }
                </style>
            </div>
            `
        };        

        try{
            await transporter.sendMail(mailOptions)
            console.log("Reset Email Sent")
            return res.status(200).json({ message:"Password Reset Link Has Been Sent To Your Email" })
        } catch(error) {
            console.log("Email Not Sent")
            return res.status(500).json({ message:"An Error Has Been Encountered When Trying To Send The Email" })
        }

    } catch (error) {
        console.log("Email Not Sent")
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.resetPassword = async ( req, res ) => {
    const { token, newPassword, confirmPassword } = req.body;

    if ( newPassword !== confirmPassword) {
        return res.status(400).json({ message: "Passwords Do Not Match" })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        const user = await User.findById( decoded.id )
        if ( !user ) {
            return res.status(400).json({ message: "Invalid Token" })
        }

        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(newPassword, salt)
        await user.save();

        return res.status(200).json({ message: "Password Reset Successful!!", data: user })
    } catch ( error ) {
        console.log({ message: error.message })
        return res.status(500).json({ message: "Internal Server Error" });
    }
}


exports.getOneUser = async (req, res) => {
    const { id } = req.body;

    try {
        const user = await User.findById( id )
        res.json({ data: user})
    } catch (error) {
        console.log({ message: error.message })
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.getTheUser = async(req, res)=>{
    try {
        const user = await User.findById(req.user.id)
        res.json({ data: user})
    } catch (error) {
        console.log({ message: error.message })
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.getAllUser = async (req, res) => {
    try {
        const users = await User.find();
        const userNo = users.length;
        const userPasswords = await Promise.all(users.map(async (user) => {
            const hashedPassword = await bcrypt.hash(user.password, 10); // Use the same salt rounds as when creating users
            return {
                ...user.toObject(),
                password: hashedPassword 
            };
        }));

        res.json({ message:"All Users Available", no: userNo, data: userPasswords});
    } catch (error) {
        console.log({ message:"No Registered Users Available" })
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.updateOneUser = async (req, res) => {
    const { id, firstName, lastName } = req.body;
    
    try{
        let updateFields = { firstName, lastName };

        const updatedUser = await User.findByIdAndUpdate( id, updateFields, {new: true, runValidators: true});
        if(!updatedUser) {
            return res.status(400).json({ message: "User Not Found!.." })
        }
        const salt = await bcrypt.genSalt(10)
        updatedUser.password = await bcrypt.hash(updatedUser.password, salt)
        return res.status(200).json({ message: "User Updated Succesfully!..", data: updatedUser })
    }catch (error){
        console.log({ message: error.message })
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.deleteOneUser = async (req, res) => {
    const { id, password } = req.body;

    try {
        const user = await User.findById( id ) 
        if(!user) {
            return res.status(404).json({ message: "User Not Found" })
        }

        const validatePassword = await bcrypt.compare(password, user.password)
        if (!validatePassword) {
            return res.status(400).json({ message:"Incorrect Password" })
        }

        await User.findByIdAndDelete( id );
        
        return res.status(201).json({ message:"User Deleted Successfully", data: user })
    } catch (error) {
        console.log({ message:error.message })
        return res.status(500).json({ message: "Internal Server Error" });
    }
}