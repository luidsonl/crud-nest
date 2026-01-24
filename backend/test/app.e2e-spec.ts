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

  describe('Bookmarks', () => {
    let bookmarkId: string;
    let otherAccessToken: string;

    const bookmarkDto = {
      title: 'First Bookmark',
      description: 'Test Description',
      link: 'https://example.com',
    };

    beforeAll(async () => {
      // Create another user for testing ownership
      const otherUser = {
        email: 'other@example.com',
        password: '123',
        confirmPassword: '123',
        name: 'Other User',
      };

      await request(app.getHttpServer()).post('/auth/signup').send(otherUser);
      const res = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({ email: otherUser.email, password: otherUser.password });
      otherAccessToken = res.body.access_token;
    });

    describe('Create bookmark', () => {
      it('should create a bookmark', () => {
        return request(app.getHttpServer())
          .post('/bookmark')
          .set('Authorization', 'Bearer ' + accessToken)
          .send(bookmarkDto)
          .expect(201)
          .expect((res) => {
            expect(res.body.title).toBe(bookmarkDto.title);
            bookmarkId = res.body.id;
          });
      });
    });

    describe('Get bookmarks', () => {
      it('should get bookmarks for current user', () => {
        return request(app.getHttpServer())
          .get('/bookmark')
          .set('Authorization', 'Bearer ' + accessToken)
          .expect(200)
          .expect((res) => {
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
          });
      });

      it('should get bookmarks by id', () => {
        return request(app.getHttpServer())
          .get(`/bookmark/${bookmarkId}`)
          .set('Authorization', 'Bearer ' + accessToken)
          .expect(200)
          .expect((res) => {
            expect(res.body.id).toBe(bookmarkId);
          });
      });

      it('should not let other user get bookmark by id', () => {
        return request(app.getHttpServer())
          .get(`/bookmark/${bookmarkId}`)
          .set('Authorization', 'Bearer ' + otherAccessToken)
          .expect(403);
      });
    });

    describe('Edit bookmark', () => {
      const updateDto = {
        title: 'Updated Title',
      };

      it('should edit bookmark', () => {
        return request(app.getHttpServer())
          .patch(`/bookmark/${bookmarkId}`)
          .set('Authorization', 'Bearer ' + accessToken)
          .send(updateDto)
          .expect(200)
          .expect((res) => {
            expect(res.body.title).toBe(updateDto.title);
          });
      });

      it('should not let other user edit bookmark', () => {
        return request(app.getHttpServer())
          .patch(`/bookmark/${bookmarkId}`)
          .set('Authorization', 'Bearer ' + otherAccessToken)
          .send(updateDto)
          .expect(403);
      });
    });

    describe('Delete bookmark', () => {
      it('should not let other user delete bookmark', () => {
        return request(app.getHttpServer())
          .delete(`/bookmark/${bookmarkId}`)
          .set('Authorization', 'Bearer ' + otherAccessToken)
          .expect(403);
      });

      it('should delete bookmark', () => {
        return request(app.getHttpServer())
          .delete(`/bookmark/${bookmarkId}`)
          .set('Authorization', 'Bearer ' + accessToken)
          .expect(200);
      });

      it('should return 404 after deleting', () => {
        return request(app.getHttpServer())
          .get(`/bookmark/${bookmarkId}`)
          .set('Authorization', 'Bearer ' + accessToken)
          .expect(404);
      });
    });
  });
});
