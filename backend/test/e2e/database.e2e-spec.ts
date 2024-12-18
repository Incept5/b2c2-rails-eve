import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { DatabaseService } from '../../src/modules/database/database.service';

describe('Database (e2e)', () => {
  let app: INestApplication;
  let dbService: DatabaseService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    dbService = moduleFixture.get<DatabaseService>(DatabaseService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should have example row in database', async () => {
    const result = await dbService.knex('example_table')
      .select('*')
      .where({ name: 'Example Row' })
      .first();
    
    expect(result).toBeDefined();
    expect(result.name).toBe('Example Row');
  });
});