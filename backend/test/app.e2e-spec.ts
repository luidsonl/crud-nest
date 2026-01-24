import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    const dto = {
      email: 'test@example.com',
      password: '123',
      confirmPassword: '123',
      name: 'Test',
    };

    it('should signup', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send(dto)
        .expect(201);
    });

    it('should signin', () => {
      return request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: dto.email,
          password: dto.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          accessToken = res.body.access_token;
        });
    });
  });

  describe('User', () => {
    it('should get current user', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'Bearer ' + accessToken)
        .expect(200)
        .expect((res) => {
          expect(res.body.user.email).toBe('test@example.com');
          expect(res.body.user.name).toBe('Test');
        });
    });

    it('should edit user', () => {
      const dto = {
        name: 'Updated Name',
        email: 'test@example.com',
      };
      return request(app.getHttpServer())
        .patch('/users/edit')
        .set('Authorization', 'Bearer ' + accessToken)
        .send(dto)
        .expect(200)
        .expect((res) => {
          expect(res.body.user.name).toBe(dto.name);
        });
    });
  });
});
