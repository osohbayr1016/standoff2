import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "djvjsyzgw",
  api_key: process.env.CLOUDINARY_API_KEY || "396391753612689",
  api_secret:
    process.env.CLOUDINARY_API_SECRET || "l6JGNuzvd28lEJXTlObDzHDtMIc",
});

export default cloudinary;
