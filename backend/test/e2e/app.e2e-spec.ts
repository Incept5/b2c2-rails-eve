import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { RestClient } from '../utils/rest-client';
import { TestLogger } from '../utils/test-logger';
import { ensureTestUser } from '../utils/test-auth';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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
    const config = new DocumentBuilder()
      .setTitle('API Documentation')
      .setDescription('The API description')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      jsonDocumentUrl: '/api/docs-json',
      yamlDocumentUrl: '/api/docs-yaml'
    });
    
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

  it('/api/docs-json (GET) should return valid OpenAPI schema', async () => {
    const schema = await client.get('/api/docs-json');
    
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
});
