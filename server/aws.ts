// import { PutObjectCommand } from "@aws-sdk/client-s3";
import {
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { awsClient } from "./clients/awsClient";

const bucketName = "aidebate-cli";

export class AwsService {
  private constructor() {}

  public static async createGetPresignedUrl(objectKey: string, download: boolean) {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      ResponseContentDisposition: `${download ? "attachment" : "inline"}; filename="${objectKey}"`,
    });

    // console.log(command)
    return getSignedUrl(awsClient, command, {
      expiresIn: 15 * 60,
    });
  }

  public static async createPutPresignedUrl(objectKey: string, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      ContentType: contentType,
    });

    // console.log(command)
    return getSignedUrl(awsClient, command, {
      expiresIn: 15 * 60,
      signableHeaders: new Set(["content-type"]),
    });
  }

  public static async createDeletePresignedUrl(objectKey: string) {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    });

    // console.log(command)
    return getSignedUrl(awsClient, command, {
      expiresIn: 15 * 60,
    });
  }
}

// Example
// const url = await createGetPresignedUrl("test/test.jpg");
// const url = await AwsService.createPutPresignedUrl("sal-1.png");
// const url = await createDeletePresignedUrl("test/jmi-2.png");

// console.log(url);
