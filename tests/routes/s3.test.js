const request = require('supertest');
const s3_client = require('../../aws/s3_client');
const app = require('../../appForTests');

jest.mock('../../aws/s3_client', () => {;
  const actual = jest.requireActual('../../aws/s3_client');
  return {
    ...actual,
    generateUploadUrl: jest.fn((bucketPrefix, filename, _contentType) => {
      return {
        url: `https://mocked-s3-url/${bucketPrefix}/${filename}.mov`,
        filename: `${filename}.mov`,
      };
    })
  };
});

describe('POST /presigned-url', () => {
  it('Successful presigned URL creation', async () => {
    const res = await request(app)
      .post('/presigned-url')
      .send({ 
        objectKey: '61a54a37-6c7a-466a-8100-a6b09daecded',
        contentType: 'video/quicktime',
        objectType: 'application_video'
      });

    expect(s3_client.generateUploadUrl).toHaveBeenCalledWith(
      s3_client.BUCKET_PREFIXES.applications,
      '61a54a37-6c7a-466a-8100-a6b09daecded',
      'video/quicktime'
    );
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('url');
    expect(res.body.url).toBe('https://mocked-s3-url/videos/applications/61a54a37-6c7a-466a-8100-a6b09daecded.mov');
    expect(res.body).toHaveProperty('filename');
    expect(res.body.filename).toBe('61a54a37-6c7a-466a-8100-a6b09daecded.mov');
  });

  it('Return 400 on incomplete payload data', async () => {
    const res = await request(app)
      .post('/presigned-url')
      .send({ objectKey: '61a54a37-6c7a-466a-8100-a6b09daecded'});
    
    expect(s3_client.generateUploadUrl).not.toHaveBeenCalled();

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('Return 400 on invalid objectKey', async () => {
    const res = await request(app)
      .post('/presigned-url')
      .send({ 
        objectKey: 'invalid-objectkey',
        contentType: 'video/quicktime',
        objectType: 'application_video'
      });
    
    expect(s3_client.generateUploadUrl).not.toHaveBeenCalled();
    
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('Return 400 on unsupported objectType', async () => {
    const res = await request(app)
      .post('/presigned-url')
      .send({ 
        objectKey: '61a54a37-6c7a-466a-8100-a6b09daecded',
        contentType: 'video/quicktime',
        objectType: 'something_weird'
      });

    expect(s3_client.generateUploadUrl).not.toHaveBeenCalled();
    
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});