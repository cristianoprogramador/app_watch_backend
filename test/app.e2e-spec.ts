// test\app.e2e-spec.ts

import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import * as request from "supertest";

describe("AuthController (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  it("/auth/register-new-client (POST)", async () => {
    const response = await request(app.getHttpServer())
      .post("/auth/register-new-client")
      .send({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
        type: "client",
        typeDocument: "CPF",
        document: "12345678901",
      })
      .expect(201);

    console.log(response.body);
    expect(response.body).toHaveProperty("accessToken");
    expect(response.body.userData).toHaveProperty("email", "test@example.com");
  });
});
