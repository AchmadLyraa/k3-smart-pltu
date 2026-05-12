import AWS from "aws-sdk";

export const s3 = new AWS.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
  endpoint: process.env.S3_ENDPOINT_URL,
  s3ForcePathStyle: true,
  signatureVersion: "v4",
});
