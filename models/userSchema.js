const mongoose = require("mongoose");
const bcrypt = require("bcryptjs")

const userSchema =new mongoose.Schema({
    name:{
        type: String,
        require: true
    },
    email:{
        type: String,
        require: true,
        unique: true
    },
    phoneNumber: {
        type: String,
        require: false,
    },
    password: {
        type:String,
        require: true
    },
    role:{
        type:String,
        require: true
    },
    active:{
        type: String,
        require: false,
    },
    gender:{
        type: String, 
        require: false
    },
    dob:{
        type: Date,
        require: false,
    },
    about:{
        type: String,
        require: false
    }
},{
    timestamps: true
});

userSchema.pre("save", function(){
const salt = bcrypt.genSaltSync(10)
const hash = bcrypt.hashSync(this.password, salt);
this.password = hash;
})
const UserModel = mongoose.model("users",userSchema);


module.exports = UserModel;