// Cloudinary disabled; provide a minimal stub to avoid import errors
const cloudinary = {
  uploader: {
    async upload() {
      throw new Error("Cloudinary is disabled");
    },
    async destroy() {
      throw new Error("Cloudinary is disabled");
    },
  },
};

export default cloudinary as any;
