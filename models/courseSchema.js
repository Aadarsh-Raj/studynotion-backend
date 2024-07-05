const mongoose = require("mongoose");
const ratingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      unique: true
    },
    rating: {
      type: Number,
      require: false,
      default:0
    },
    reviews: {
      type: String,
      require: false,
    },
  },
  { timestamps: true }
);

const courseSchema = new mongoose.Schema(
  {
    courseName: {
      type: String,
      require: true,
    },
    courseDescription: {
      type: String,
      require: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
    },
    whatYouWillLearn: {
      type: String,
      require: true,
    },
    ratingAndReviews: {
      type: [ratingSchema],
      require: false,
    },
    price: {
      type: String,
      require: true,
    },

    thumbnail: {
      type: [],
      require: false,
    },
    studentsEnrolled: {
      type: [mongoose.Schema.Types.ObjectId],
      require: false,
    },
    active: {
      type: Boolean,
      require: false,
      default:true
    },
    courseProgress:{
        type: Number,
        require: false,
        default: 0
    },
    courseDuration:{
      type: String,
      require: false,
      default: 0
    }
  },
  {
    timestamps: true,
  }
);

const CourseModel = mongoose.model("courses", courseSchema);

module.exports = CourseModel;
