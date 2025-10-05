const express = require("express");
const { respondWithError } = require("./helpers");
const { generateUploadUrl, BUCKET_PREFIXES, MIME_EXTENSION_MAP } = require("../aws/s3_client");
const { validate, version } = require('uuid');
const logger = require('../logger')(__filename);

const router = express.Router();
router.use(express.json());

router.post('/presigned-url', async (req, res) => {
  const { objectKey, contentType, objectType } = req.body;
    
  if (!objectKey || !contentType || !objectType) {
    return respondWithError(res, 400, 'ObjectKey, contentType and objectType are required.');
  }

  try {
    if (!Object.keys(MIME_EXTENSION_MAP).includes(contentType)) {
      return respondWithError(res, 400, 'Unsupported contentType provided.');
    }
    if (!validateObjectKeyIsUuid(objectKey)){
      return respondWithError(res, 400, 'objectKey must be a valid uuid v4.');
    }
    
    var bucketKey;
    switch (objectType) {
      case 'application_video':
        // currently only application videos are supported
        bucketKey = BUCKET_PREFIXES.applications;
        break;
      default:
        return respondWithError(res, 400, 'Invalid objectType provided.');
    }

    result = await generateUploadUrl(bucketKey, objectKey, contentType);
    res.json(result);
    
  } catch (err) {
    logger.error(`Error when trying to get presigned url for object ${objectType}`, err);
    respondWithError(res);
  }
});

function validateObjectKeyIsUuid(objectKey) {
  try {
    return validate(objectKey) && version(objectKey) === 4;
  }
  catch (error) {
    return false;
  }
}

module.exports = router;
