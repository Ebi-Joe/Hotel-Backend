const ContactUs = require('../models/contactUs');
const User = require('../models/user');
const {validateContactUs} = require('../validators');

exports.contactUs = async (req, res) => {
    const {error} =  validateContactUs(req.body)
    const { name, email, message } = req.body;

    if (error) {
        return res.json( error.details[0].message )
    }

    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({message: "Email Not Registered"})
        }

        let contact = await ContactUs.findOne({
            $or: [
                {name},
                {email},
                {message}
            ]
        })
        if ( contact ) {
            return res.status(400).json({ message: "Message Already exists", data: contact })
        }
        
        contact = new ContactUs ({
            name,
            email,
            message,
        })
        const newContactus = await contact.save();
        return res.status(201).json({ message: "Succesfully Sent", data: newContactus })
    } catch (error) {
        console.log({ message: error.message })
        return res.status(500).json({ message: "Internal Server Error" });  
    }
}

exports.getAllContact = async (req, res) => {
    try {
        const contact = await ContactUs.find()
        res.json(contact)
    } catch (error) {
        console.log({ message: error.message })
        return res.status(500).json({ message: "Internal Server Error" });  
    }
}