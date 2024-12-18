import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { RestClient } from '../utils/rest-client';
import { TestLogger } from '../utils/test-logger';
import { ensureTestUser } from '../utils/test-auth';

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
    await app.init();
    client = new RestClient(app);
  });

  afterEach(async () => {
    await app.close();
    await logger.close();
  });

  it('/api/monitoring/health (GET)', async () => {
    const response = await client.get('/api/monitoring/health');
    expect(response.status).toBe('ok');
  });

  it('should support user authentication flow', async () => {
    const testUser = await ensureTestUser(client);
    expect(testUser.id).toBeDefined();
    expect(testUser.accessToken).toBeDefined();

    // Verify can get token with password grant
    const auth = await client.post('/api/auth/token', {
      email: testUser.email,
      password: 'test1234',
      grant_type: 'password'
    });
    expect(auth.access_token).toBeDefined();
    expect(auth.user_id).toBe(testUser.id);
  });
});
