declare module '@fastify/multipart' {
  import { FastifyPluginAsync, FastifyRequest } from 'fastify';

  interface MultipartOptions {
    limits?: {
      fileSize?: number;
      files?: number;
      fieldSize?: number;
      fields?: number;
      parts?: number;
      headerPairs?: number;
    };
    attachFieldsToBody?: boolean;
    throwFileSizeLimit?: boolean;
  }

  interface MultipartFile {
    toBuffer(): Promise<Buffer>;
    file: {
      bytesRead: number;
    };
    mimetype: string;
    filename: string;
  }

  interface FastifyRequestWithFile extends FastifyRequest {
    file(): Promise<MultipartFile | undefined>;
  }

  const multipart: FastifyPluginAsync<MultipartOptions>;
  export = multipart;
}
