// NEW utils/cloudinary.js
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = (buffer) => {
  // Mistake 2 fix: buffer validate karo
  if (!buffer) {
    return Promise.reject(new Error("No file buffer provided"));
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "syndicate_newspaper",
        resource_type: "auto", // Mistake 3 fix: explicit rakho
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error); // debug ke liye
          return reject(error);
        }
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// Mistake 1 fix: cloudinary instance bhi export karo deletion ke liye future mein
module.exports = { uploadToCloudinary, cloudinary };