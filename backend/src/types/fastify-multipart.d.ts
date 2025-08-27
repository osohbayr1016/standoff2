declare module '@fastify/multipart' {
  import { FastifyPluginAsync } from 'fastify';

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

  const multipart: FastifyPluginAsync<MultipartOptions>;
  export = multipart;
}
