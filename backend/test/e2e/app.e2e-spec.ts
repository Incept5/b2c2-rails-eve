import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { RestClient } from '../utils/rest-client';
import { TestLogger } from '../utils/test-logger';

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
    expect(response.status).toBe(200);
  });
});
