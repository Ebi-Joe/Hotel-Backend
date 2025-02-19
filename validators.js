const Joi = require('joi');

const validate = (schema) => (payload) => schema.validate(payload)

const userSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string()
    .pattern(new RegExp('^(?=.*[a-zA-Z])(?=.*\\d)(?=.*[!@#$%^&*.])[A-Za-z\\d!@#$%^&*.]{8,30}$'))
    .required(),
  
  confirmPassword: Joi.string()
    .pattern(new RegExp('^(?=.*[a-zA-Z])(?=.*\\d)(?=.*[!@#$%^&*.])[A-Za-z\\d!@#$%^&*.]{8,30}$'))
    .required(),
  
    role: Joi.string().required(),
});

const roomTypeSchema = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().required(),
    description: Joi.string().required(),
    features: Joi.string().required(),
    info: Joi.string().required(),
    availability: Joi.string().required(),
    bedType: Joi.string().required(),
    rating: Joi.number().required(),
    review: Joi.number().required(),
    roomSize: Joi.string().required(),
    bedSize: Joi.string().required(),
    occupancy: Joi.string().required(),
    location: Joi.string().required(),
    view: Joi.string().required(),
    roomService: Joi.string().required(),
    smoking: Joi.string().required(),
    swimmingPool: Joi.string().required(),
});

const reviewSchema = Joi.object({
    name: Joi.string().required(),
    point: Joi.string().required(),
    description: Joi.string().required(),
    rating: Joi.number().required(),
    date: Joi.string().required()
});

const conciergeSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    phone: Joi.string().required(),
    date: Joi.string().required(),
    description: Joi.string().required()
});

const roomSchema = Joi.object({
    roomType: Joi.string().required(),
    roomNo: Joi.number().required()
})

const availableSchema = Joi.object({
    startDate: Joi.string().required(),
    endDate: Joi.string().required(),
    totalRooms: Joi.number().required(),
});

const contactUsSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    message: Joi.string().required()
})

module.exports.validateUser = validate(userSchema)
module.exports.validateRoomType = validate(roomTypeSchema)
module.exports.validateReview = validate(reviewSchema)
module.exports.validateConcierge = validate(conciergeSchema)
module.exports.validateRoom = validate(roomSchema)
module.exports.validateAvailability = validate(availableSchema)
module.exports.validateContactUs = validate(contactUsSchema)