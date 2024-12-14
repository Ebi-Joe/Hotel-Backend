const Review = require('../models/reviews');
const { validateReview } = require('../validators');


exports.newReview = async (req, res) => {
    const { error } = validateReview(req.body);
    if (error) {
        return res.json(error.details[0].message)
    }

    try{
        let review = await Review.findOne({ description: req.body.description })
        if (review) {
            return res.status(400).json({ message:"Review Already Exists", data: review })
        }

        review = new Review ({
            name: req.body.name,
            point: req.body.point,
            description: req.body.description,
            rating: req.body.rating,
            date: req.body.date,
        })

        const newReviewData =  await review.save();
        return res.status(200).json({ message:"Review Created Successfully", data:newReviewData})
    }catch (error) {
        console.log({ message: error.message })
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.getOneReview = async (req, res) => {
    const { id } = req.body;

    try{
        const review = await Review.findById(id);
        res.json( review )
    }catch (error) {
        console.log({ message: error.message })
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.getAllReview = async (req, res) => {
    try {
      const reviews = await Review.find();
  
      // Map through reviews and format date fields
      const formattedReviews = reviews.map((review) => {
        return {
          ...review._doc, // Spread the original document
          date: new Date(review.date).toDateString(),
        };
      });
  
      res.status(200).json(formattedReviews); // Send formatted response
    } catch (error) {
      console.error({ message: error.message });
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  

exports.updateOneReview = async (req, res) => {
    const { id, updates } = req.body;

    try{
        const updatedReview = await Review.findByIdAndUpdate(id, updates, {new: true, runValidators: true})
        if (!updatedReview) {
            return res.status(404).json({ message: "Review Not Found" })
        }
        return res.status(200).json({ message:"Review Updated Sucessfully", data: updatedReview })
    }catch (error) {
        console.log({ message:error.message })
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.deleteOneReview = async (req, res) => {
    const { id } = req.body;

    try{ 
        const deletedReview = await Review.findByIdAndDelete( id );
        if (!deletedReview) {
            return res.status(404).json({ message: "Review Not Found" })
        }
        return res.status(201).json({ message: "Review Deleted Succesfully", data: deletedReview })
    }catch (error){
        console.log({ message: error.message })
        return res.status(500).json({ message: "Internal Server Error" });
    }
}