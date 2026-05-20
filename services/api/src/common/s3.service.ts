/**
 * S3-compatible object storage (MinIO locally). Presigned PUTs let clients
 * upload directly to storage; the API only ever sees metadata + a HEAD check.
 * Object key pattern (blueprint Module 4):
 *   tenants/{tenant_id}/projects/{project_id}/uploads/{upload_id}/{filename}
 */
import { HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly client: S3Client;
  readonly bucket = process.env.S3_BUCKET ?? "migration-tower";

  constructor() {
    this.client = new S3Client({
      region: process.env.S3_REGION ?? "us-east-1",
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
      },
    });
  }

  objectKey(tenantId: string, projectId: string, uploadId: string, filename: string): string {
    // Strip path separators from the client-supplied filename.
    const safe = filename.replace(/[/\\]/g, "_");
    return `tenants/${tenantId}/projects/${projectId}/uploads/${uploadId}/${safe}`;
  }

  /** 15-minute (default) presigned PUT URL. */
  async presignPut(key: string, contentType: string, expiresInSeconds = 900): Promise<string> {
    return getSignedUrl(
      this.client,
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: contentType,
      }),
      { expiresIn: expiresInSeconds },
    );
  }

  /** True if the object exists; used by uploads/complete to verify the PUT. */
  async objectExists(key: string): Promise<boolean> {
    try {
      await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
      return true;
    } catch (err) {
      const code = (err as { name?: string }).name;
      if (code === "NotFound" || code === "NoSuchKey" || code === "403") {
        return false;
      }
      this.logger.warn({ err, key }, "HEAD object failed");
      return false;
    }
  }
}
