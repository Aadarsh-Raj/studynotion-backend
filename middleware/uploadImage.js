const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { v4: uuidv4 } = require("uuid");

cloudinary.config({
  cloud_name: "dbykv2xgd",
  api_key: "284927691724341",
  api_secret: "-xVJej9uSNNR2fNBVI9qc-tdaNc", // Replace with your API secret
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads",
    format: async (req, file) => {
      // Extract the file extension from the original file name
      const ext = file.originalname.split(".").pop().toLowerCase();
      // Ensure the format is one of the allowed types
      if (["jpg", "jpeg", "png"].includes(ext)) {
        return ext;
      }
      // Default to 'jpg' if the extension is not allowed
      return ["jpg", "jpeg", "png"].includes(ext) ? ext : "jpg";
    },
    public_id: (req, file) =>
      file.originalname.split(".")[0].toLowerCase() + uuidv4().slice(0, 8), // Use filename without extension as public_id
  },
});

const upload = multer({
  storage: storage});

module.exports = { upload };
