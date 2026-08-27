import { cloudinary, isCloudinaryConfigured } from "../config/cloudinary.js";

// Takes the file multer kept in memory and streams it to Cloudinary,
// then hands back the URL so the frontend can put it in imageUrl.
const uploadImage = async (req, res) => {
  try {
    if (!isCloudinaryConfigured()) {
      return res.status(503).json({
        message:
          "Image upload is not configured. Add the CLOUDINARY_* variables to the server environment.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Please choose an image to upload",
      });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "lostlink",
          resource_type: "image",
        },
        (error, uploaded) => {
          if (error) {
            reject(error);
          } else {
            resolve(uploaded);
          }
        }
      );

      stream.end(req.file.buffer);
    });

    res.status(201).json({
      message: "Image uploaded successfully",
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.log("Upload error:", error.message);

    res.status(500).json({
      message: "Could not upload the image",
    });
  }
};

export { uploadImage };
