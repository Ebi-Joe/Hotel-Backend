const Concierge = require('../models/concierge');
const { validateConcierge } = require('../validators');
const cloudinary = require('../config/cloudinary');

exports.newConcierge = async (req, res) => {
    const { error } = validateConcierge(req.body);

    if ( error ) {
        return res.json( error.details[0].message )
    }

    if (!req.files || req.files.length == 0) {
        return res.status(400).json({ message: "No Images Uploaded" })
    }

    const images = []
    for ( const file of req.files) {
        try {
            const result = await cloudinary.uploader.upload(`data:${file.mimetype};base64,${file.buffer.toString('base64')}`);
            images.push({ img: result.secure_url })
        }catch (error) {
            console.log("Image Upload Error", uploadError)
            return res.status(500).json({ message: "Image Upload Failed", error: uploadError.message })
        }
    }

    try {
        let concierge = await Concierge.findOne({
            $or: [
                { email: req.body.email},
                { phone: req.body.phone }
            ]
        })
        if ( concierge ) {
            return res.status(400).json({ message: "Concierge Already Exists", data:concierge })
        }
    
        concierge = new Concierge ({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            date: req.body.date,
            description: req.body.description,
            images: images,
        })
    
        const new_concierge = await concierge.save();
        return res.status(201).json({ message:"Concierge Created Successfully", data: new_concierge })
    } catch (error) {
        console.log({ message: error.message })
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.getOneConcierge = async (req, res) => {
    const { id } = req.body;

    try {
        const concierge = await Concierge.findById( id )
        res.json( concierge )
    } catch (error) {
        console.log({ message: error.message })
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.getAllConcierge = async (req, res) => {
    try {
        const concierge = await Concierge.find()
        res.json( concierge )
    } catch ( error) {
        console.log({ message: error.message })
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.deleteOneConcierge = async (req, res) => {
    const { id } = req.body

    try {
        const deletedConcierge = await Concierge.findByIdAndDelete( id )
        if ( !deletedConcierge) {
            return res.status(404).json({ message: "Concierge Not found" })
        }
        return res.status(201).json({ message:"User Deleted Successfully" , data: deletedConcierge })
    } catch {
        console.log({ message: error.message})
         return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.updateOneConcierge = async (req, res) => {
    const { id, updates} = req.body;

    try {
        const updatedConcierge = await Concierge.findByIdAndUpdate( id, updates, {new: true, runValidators: true})
        if ( !updatedConcierge ) {
            return res.status(404).json({ message: "Concierge Not Found" })
        }
        return res.status(200).json({ message:"Concierge Updated Successfully", data: updatedConcierge })
    } catch (error) {
        console.log({ message: error.message })
         return res.status(500).json({ message: "Internal Server Error" });
    }
}