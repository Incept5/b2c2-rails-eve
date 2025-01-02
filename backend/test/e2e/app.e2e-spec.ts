import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { SwaggerService } from '../../src/modules/swagger/swagger.service';
import { RestClient } from '../utils/rest-client';
import { ensureTestUser } from '../utils/test-auth';
import { TestLogger } from '../utils/test-logger';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let client: RestClient;
  let logger: TestLogger;

  beforeEach(async () => {
    logger = new TestLogger();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useLogger(logger);
      
    // Set up Swagger documentation
    const swaggerService = app.get(SwaggerService);
    swaggerService.setup(app);
    
    await app.init();
    client = new RestClient(app);
  });

  afterEach(async () => {
    await app.close();
    await logger.close();
  });

  it('/api/monitoring/health (GET)', async () => {
    const response = await client.get('/api/monitoring/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  it('should support user authentication flow', async () => {
    const testUser = await ensureTestUser(client);
    expect(testUser.id).toBeDefined();
    expect(testUser.accessToken).toBeDefined();

    // Verify can get token with password grant
    const authResponse = await client.post('/api/auth/token', {
      username: testUser.email,
      password: 'test1234',
      grant_type: 'password'
    }, {
      'Content-Type': 'application/x-www-form-urlencoded'
    }, true);
    
    expect(authResponse.status).toBe(201);
    expect(authResponse.body.access_token).toBeDefined();
    expect(authResponse.body.user_id).toBe(testUser.id);

    // Test invalid content type
    const invalidContentTypeResponse = await client.post('/api/auth/token', {
      username: testUser.email,
      password: 'test1234',
      grant_type: 'password'
    });
    expect(invalidContentTypeResponse.status).toBe(401);
    expect(invalidContentTypeResponse.body.message).toBe('Invalid content type. Must be application/x-www-form-urlencoded');

    // Test invalid grant type
    const invalidGrantResponse = await client.post('/api/auth/token', {
      username: testUser.email,
      password: 'test1234',
      grant_type: 'invalid'
    }, {
      'Content-Type': 'application/x-www-form-urlencoded'
    }, true);
    expect(invalidGrantResponse.status).toBe(401);
    expect(invalidGrantResponse.body.message).toBe('Invalid grant type');
  });

  it('/api/docs-json (GET) should return valid OpenAPI schema', async () => {
    const response = await client.get('/api/docs-json');
    expect(response.status).toBe(200);
    
    const schema = response.body;
    // Verify basic OpenAPI schema structure
    expect(schema).toBeDefined();
    expect(schema.openapi).toBeDefined();
    expect(schema.info).toBeDefined();
    expect(schema.paths).toBeDefined();
    
    // Verify version follows semantic versioning
    expect(schema.openapi).toMatch(/^3\.\d+\.\d+$/);
    
    // Verify required OpenAPI fields
    expect(schema.info.title).toBe('API Documentation');
    expect(schema.info.version).toBe('1.0');
    
    // Verify we have some documented endpoints
    expect(Object.keys(schema.paths)).toContain('/api/monitoring/health');
    expect(Object.keys(schema.paths)).toContain('/api/auth/token');
  });

  it('should return 400 when signing up with invalid data', async () => {
    const invalidSignupTests = [
      {
        payload: {
          // Missing email
          password: 'test1234',
          firstName: 'Test',
          lastName: 'User'
        },
        expectedError: 'email should not be empty'
      },
      {
        payload: {
          email: 'invalid-email',  // Invalid email format
          password: 'test1234',
          firstName: 'Test',
          lastName: 'User'
        },
        expectedError: 'email must be an email'
      },
      {
        payload: {
          email: 'test@example.com',
          password: '123', // Too short password
          firstName: 'Test',
          lastName: 'User'
        },
        expectedError: 'password is too short'
      },
      {
        payload: {
          email: 'test@example.com',
          password: 'test1234',
          // Missing firstName
          lastName: 'User'
        },
        expectedError: 'firstName should not be empty'
      }
    ];

    for (const test of invalidSignupTests) {
      const response = await client.post('/api/auth/signup', test.payload);
      expect(response.status).toBe(400);
      expect(response.body.message).toContain(test.expectedError);
    }
  });

  it('should validate signup data and return 400 for invalid inputs', async () => {
    const testCases = [
      {
        payload: {
          email: 'not-an-email',
          password: 'validpass123',
          firstName: 'Test',
          lastName: 'User'
        },
        expectedError: 'email must be an email'
      },
      {
        payload: {
          email: 'test@example.com',
          password: 'short',  // Less than 8 characters
          firstName: 'Test',
          lastName: 'User'
        },
        expectedError: 'password is too short'
      },
      {
        payload: {
          email: 'test@example.com',
          password: 'validpass123',
          firstName: '',  // Empty firstName
          lastName: 'User'
        },
        expectedError: 'firstName should not be empty'
      },
      {
        payload: {
          email: 'test@example.com',
          password: 'validpass123',
          firstName: 'Test',
          lastName: ''  // Empty lastName
        },
        expectedError: 'lastName should not be empty'
      },
      {
        payload: {
          // Missing email field
          password: 'validpass123',
          firstName: 'Test',
          lastName: 'User'
        },
        expectedError: 'email should not be empty'
      },
      {
        payload: {
          email: 'test@example.com',
          // Missing password field
          firstName: 'Test',
          lastName: 'User'
        },
        expectedError: 'password should not be empty'
      }
    ];

    for (const testCase of testCases) {
      const response = await client.post('/api/auth/signup', testCase.payload);
      expect(response.status).toBe(400);
      expect(response.body.message).toContain(testCase.expectedError);
      expect(response.body.error).toBe('Bad Request');
    }

    // Verify empty payload
    const emptyResponse = await client.post('/api/auth/signup', {});
    expect(emptyResponse.status).toBe(400);
    expect(emptyResponse.body.message).toEqual(expect.arrayContaining([
      'email should not be empty',
      'password should not be empty',
      'firstName should not be empty',
      'lastName should not be empty'
    ]));
  });
});
