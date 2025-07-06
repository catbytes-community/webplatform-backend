const request = require('supertest');
const applicationService = require('../../services/applications_service');
const mailer_service = require('../../services/mailer_service');

const mockedUserId = 123;

jest.mock('../../services/applications_service');
jest.mock('../../services/mailer_service');
jest.mock('../../middleware/authorization', () => {
    const actual = jest.requireActual('../../middleware/authorization');
    return {
      ...actual,
      verifyRole: jest.fn(() => (req, res, next) => next()),
    };
  });

jest.mock('../../middleware/authentication', () => {
	return {
		authenticate: jest.fn(() => (req, res, next) => {
			req.userId = mockedUserId;
			next();
		}),
	};
});
  
const app = require('../../appForTests');

describe('GET /applications', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Return all applications success', async () => {
    const mockApplications = [{ id: 1, name: 'Test Application' }];
    applicationService.getAllApplications.mockResolvedValue(mockApplications);

    const res = await request(app).get('/applications');

    expect(applicationService.getAllApplications).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body.applications).toEqual(mockApplications);
  });
});

describe('POST /applications', () => {
	afterEach(() => {
			jest.clearAllMocks();
		});

	const applicationPayload = {
			name : 'Test Application',
			about: 'This is a test application',
			email: 'test@mail.com',
			video_link: 'http://example.com/video',
			discord_nickname: 'TestUser'
	};
		
	it('Create new application success', async () => {
		applicationService.createNewApplication.mockResolvedValue({ id: 1, ...applicationPayload });
		const res = await request(app)
			.post('/applications')
			.send(applicationPayload);
		
		expect(applicationService.createNewApplication).toHaveBeenCalledWith(
			applicationPayload.name,
			applicationPayload.about,
			applicationPayload.email,
			applicationPayload.video_link,
			applicationPayload.discord_nickname
		);
		expect(res.statusCode).toBe(201);
		expect(res.body).toEqual({ id: 1, ...applicationPayload });
	});

	it('Create new application unique constraint violation', async () => {
		const constraintError = new Error('Unique constraint violation');
		constraintError.constraint = 'applications_email_key';
		constraintError.code = '23505';

		applicationService.createNewApplication.mockRejectedValue(constraintError);
		const res = await request(app)
			.post('/applications')
			.send(applicationPayload);
		
		expect(applicationService.createNewApplication).toHaveBeenCalledWith(
			applicationPayload.name,
			applicationPayload.about,
			applicationPayload.email,
			applicationPayload.video_link,
			applicationPayload.discord_nickname
		);
		expect(res.statusCode).toBe(409);
		expect(res.body.error).toContain('already exists');
	});

	it('Create new application notnull constraint violation', async () => {
		const constraintError = new Error('Notnull constraint violation');
		constraintError.constraint = 'applications_email_key';
		constraintError.code = '23502';

		applicationService.createNewApplication.mockRejectedValue(constraintError);
		const res = await request(app)
			.post('/applications')
			.send(applicationPayload);
		
		expect(applicationService.createNewApplication).toHaveBeenCalledWith(
			applicationPayload.name,
			applicationPayload.about,
			applicationPayload.email,
			applicationPayload.video_link,
			applicationPayload.discord_nickname
		);
		expect(res.statusCode).toBe(400);
		expect(res.body.error).toContain('email is required');
	});

	it('Create new application unexpected error', async () => {
		applicationService.createNewApplication.mockRejectedValue(new Error('Unexpected error'));
		const res = await request(app)
			.post('/applications')
			.send(applicationPayload);
		
		expect(applicationService.createNewApplication).toHaveBeenCalledWith(
			applicationPayload.name,
			applicationPayload.about,
			applicationPayload.email,
			applicationPayload.video_link,
			applicationPayload.discord_nickname
		);
		expect(res.statusCode).toBe(500);
		expect(res.body.error).toContain('Internal Server Error');
	});
});

describe('PUT /applications/:id', () => {
	afterEach(() => {
			jest.clearAllMocks();
	});

	const applicationId = '1';
	const updatePayload = { status: 'approved', comment: 'Looks good!' };

	it('Change application status success', async () => {
		const mockedApplication = {
			id: applicationId,
			name: 'Test Application',
			email: 'test@test.com',
			status: 'pending'
		};
		applicationService.getApplicationById.mockResolvedValue(mockedApplication);
		applicationService.updateApplicationStatus.mockResolvedValue({ id: applicationId, ...mockedApplication, ...updatePayload });

		const res = await request(app)
			.put(`/applications/${applicationId}`)
			.send(updatePayload);

		expect(applicationService.getApplicationById).toHaveBeenCalledWith(applicationId);
		expect(applicationService.updateApplicationStatus).toHaveBeenCalledWith(
			applicationId, 
			updatePayload.status, 
			updatePayload.comment, 
			mockedUserId,
			expect.any(Date)
		);
		expect(mailer_service.sendEmailOnApplicationStatusChange).toHaveBeenCalledWith(
			mockedApplication.email,
			mockedApplication.name,
			updatePayload.status
		);
		expect(res.statusCode).toBe(200);
		expect(res.body.id).toBe(applicationId);
		expect(res.body.status).toBe(updatePayload.status);
	});
	
	it('Update application status not found', async () => {
		applicationService.getApplicationById.mockResolvedValue(null);

		const res = await request(app)
			.put(`/applications/${applicationId}`)
			.send(updatePayload);

		expect(applicationService.getApplicationById).toHaveBeenCalledWith(applicationId);
		expect(applicationService.updateApplicationStatus).not.toHaveBeenCalled();
		expect(res.statusCode).toBe(404);
		expect(res.body.error).toBe('Application not found');
	});
	
	it('Update application status already rejected', async () => {
		applicationService.getApplicationById.mockResolvedValue({ id: applicationId, status: 'rejected' });

		const res = await request(app)
			.put(`/applications/${applicationId}`)
			.send(updatePayload);

		expect(applicationService.getApplicationById).toHaveBeenCalledWith(applicationId);
		expect(applicationService.updateApplicationStatus).not.toHaveBeenCalled();
		expect(mailer_service.sendEmailOnApplicationStatusChange).not.toHaveBeenCalled();
		expect(res.statusCode).toBe(400);
		expect(res.body.error).toBe('Application is already in rejected status.');
	});
	
	it('Update application invalid status provided', async () => {
		const invalidPayload = { ...updatePayload, status: 'invalid_status' };

		const res = await request(app)
			.put(`/applications/${applicationId}`)
			.send(invalidPayload);

		expect(applicationService.getApplicationById).not.toHaveBeenCalled();
		expect(mailer_service.sendEmailOnApplicationStatusChange).not.toHaveBeenCalled();
		expect(res.statusCode).toBe(400);
		expect(res.body.error).toBe('Invalid status provided');
	});
	
	it('Update application rejected without comment', async () => {
		const invalidPayload = { status: 'rejected' };

		const res = await request(app)
			.put(`/applications/${applicationId}`)
			.send(invalidPayload);
		
		expect(applicationService.getApplicationById).not.toHaveBeenCalled();
		expect(applicationService.updateApplicationStatus).not.toHaveBeenCalled();
		expect(mailer_service.sendEmailOnApplicationStatusChange).not.toHaveBeenCalled();
		expect(res.statusCode).toBe(400);
		expect(res.body.error).toBe('Comment is required for rejected applications');
	});
});