const mongoose = require("mongoose");
const ratingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
    },
    rating: {
      type: Number,
      require: true,
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
    Instructor: {
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
      type: String,
      require: false,
    },
    studentsEnrolled: {
      type: [mongoose.Schema.Types.ObjectId],
      require: false,
    },
    active: {
      type: Boolean,
      require: true,
    },
    courseProgress:{
        type: Number,
        require: true
    }
  },
  {
    timestamps: true,
  }
);

const CourseModel = mongoose.model("courses", courseSchema);

module.exports = CourseModel;
