const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const config = require("config");

const awsConfig = config.aws;
const s3 = new S3Client({ region: awsConfig.aws_region });

const BUCKET_PREFIXES = {
  applications: "videos/applications",
  // images and-or other video categories will be added later
};

const MIME_EXTENSION_MAP = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/ogg": "ogv",
  "video/quicktime": "mov",
};

async function generateUploadUrl(bucketPrefix, filename, contentType) {
  if (!Object.values(BUCKET_PREFIXES).includes(bucketPrefix)) {
    throw new Error("Invalid bucket prefix");
  }

  filename = `${filename}.${MIME_EXTENSION_MAP[contentType]}`;
  const fullKey = buildFullObjectKey(bucketPrefix, filename);

  const command = new PutObjectCommand({
    Bucket: awsConfig.s3_bucket,
    Key: fullKey,
    ContentType: contentType,
    StorageClass: "INTELLIGENT_TIERING", // Cheapest option, auto-moves to colder storage based on access patterns
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
  return {
    url,
    filename,
  };
}

async function getDownloadUrl(bucketPrefix, filename) {
  if (!Object.values(BUCKET_PREFIXES).includes(bucketPrefix)) {
    throw new Error("Invalid bucket prefix");
  }

  const command = new GetObjectCommand({
    Bucket: awsConfig.s3_bucket,
    Key: buildFullObjectKey(bucketPrefix, filename)
  });

  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
  return signedUrl;
}

function buildFullObjectKey(bucketPrefix, filename) {
  return `${bucketPrefix}/${filename}`;
}

module.exports = {
  BUCKET_PREFIXES,
  MIME_EXTENSION_MAP,
  generateUploadUrl,
  getDownloadUrl,
};