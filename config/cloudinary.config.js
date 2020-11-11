const cloudinary = require("cloudinary").v2;

module.exports = () => {
  cloudinary.config({
    cloud_name: String(process.env.CLOUDINARY_CLOUD_NAME),
    api_key: String(process.env.CLOUDINARY_CLOUD_API_KEY),
    api_secret: String(process.env.CLOUDINARY_CLOUD_API_SECRET),
  });
};
