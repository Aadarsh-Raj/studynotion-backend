const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
    },
    phoneNumber: {
      type: Number,
      require: false,
    },
    password: {
      type: String,
      require: true,
    },
    role: {
      type: String,
      require: true,
    },
    token: {
      type: String,
      require: false,
    },
    active: {
      type: String,
      require: false,
      default: true,
    },
    gender: {
      type: String,
      require: false,
    },
    dob: {
      type: Date,
      require: false,
    },
    about: {
      type: String,
      require: false,
    },
    wishlist: {
      type: [mongoose.Schema.Types.ObjectId],
      require: false,
      ref:"courses",
      defualt: [],
    },
    photo: {
      type: String,
      require: false,
    }
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", function (next) {
  if (this.isModified("password") || this.isNew) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(this.password, salt);
    this.password = hash;
  }
  next();
});
const UserModel = mongoose.model("users", userSchema);
module.exports = UserModel;
