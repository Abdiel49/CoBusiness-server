import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { ApiEnvelopeInterceptor } from '../src/api.js';
import { AppModule } from '../src/app.module.js';

describe('CoBusiness MVP API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalInterceptors(app.get(ApiEnvelopeInterceptor));
    await app.init();
  });

  it('serves the seeded fictional lot through the v1 response envelope', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/lots')
      .expect(200)
      .expect(({ body }) => {
        expect(body.data[0].id).toBe('lot-demo-001');
        expect(body.data[0].termsVersion).toBe(1);
        expect(body.meta.apiVersion).toBe('v1');
      });
  });

  it('serves liveness and database readiness probes', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect(({ body }) => expect(body.data.status).toBe('ok'));
    await request(app.getHttpServer())
      .get('/api/v1/health/ready')
      .expect(200)
      .expect(({ body }) => expect(body.data.database).toBe('connected'));
  });

  afterEach(async () => {
    await app.close();
  });
});
