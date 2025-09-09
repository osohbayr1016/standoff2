declare module "cloudinary" {
  interface UploadApiResponse {
    secure_url: string;
    public_id: string;
    url: string;
    width: number;
    height: number;
    format: string;
    resource_type: string;
  }

  interface UploadApiOptions {
    folder?: string;
    resource_type?: string;
    transformation?: Array<{
      width?: number;
      height?: number;
      crop?: string;
      gravity?: string;
      quality?: string;
    }>;
  }

  interface CloudinaryConfig {
    cloud_name: string;
    api_key: string;
    api_secret: string;
  }

  interface CloudinaryInstance {
    config: (config: CloudinaryConfig) => void;
    uploader: {
      upload: (
        file: string,
        options?: UploadApiOptions
      ) => Promise<UploadApiResponse>;
      destroy: (publicId: string) => Promise<any>;
    };
  }

  export const v2: CloudinaryInstance;
  export = { v2: CloudinaryInstance };
}
