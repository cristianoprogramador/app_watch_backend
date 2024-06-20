// src/users/users.service.spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { UsersRepository } from "./users.repository";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { HttpException, HttpStatus } from "@nestjs/common";
import { UserType } from "@prisma/client";
import * as bcrypt from "bcrypt";

describe("UsersService", () => {
  let service: UsersService;
  let usersRepository: UsersRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            findOne: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get<UsersRepository>(UsersRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a new user", async () => {
      const createUserDto: CreateUserDto = {
        email: "test@example.com",
        password: "password",
        userDetailsUuid: "1",
        type: "client",
      };

      const hashedPassword = await service.encryptPassword(
        createUserDto.password
      );

      const createdUser: any = {
        uuid: "1",
        ...createUserDto,
        password: hashedPassword,
        userDetails: {},
      };

      jest.spyOn(prismaService.user, "create").mockResolvedValue(createdUser);

      expect(await service.create(createUserDto)).toEqual(createdUser);
      expect(prismaService.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            email: createUserDto.email,
            password: expect.any(String), // Expect any string for the hashed password
            type: createUserDto.type,
            userDetailsUuid: createUserDto.userDetailsUuid,
          },
          include: { userDetails: true },
        })
      );
    });
  });

  describe("findByEmail", () => {
    it("should return a user by email", async () => {
      const user: any = {
        uuid: "1",
        email: "test@example.com",
        password: "password",
      };

      jest.spyOn(prismaService.user, "findUnique").mockResolvedValue(user);

      expect(await service.findByEmail("test@example.com")).toEqual(user);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
        include: { userDetails: true },
      });
    });

    it("should throw an exception if user is not found", async () => {
      jest.spyOn(prismaService.user, "findUnique").mockResolvedValue(null);

      await expect(service.findByEmail("test@example.com")).rejects.toThrow(
        new HttpException("User not found", HttpStatus.NOT_FOUND)
      );
    });
  });

  describe("findByEmailGoogle", () => {
    it("should return a user by email for Google login", async () => {
      const user: any = {
        uuid: "1",
        email: "test@example.com",
        password: "password",
      };

      jest.spyOn(prismaService.user, "findUnique").mockResolvedValue(user);

      expect(await service.findByEmailGoogle("test@example.com")).toEqual(user);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
        include: { userDetails: true },
      });
    });

    it("should return null if user is not found", async () => {
      jest.spyOn(prismaService.user, "findUnique").mockResolvedValue(null);

      expect(await service.findByEmailGoogle("test@example.com")).toBeNull();
    });
  });

  describe("findOne", () => {
    it("should return a user by uuid", async () => {
      const user: any = {
        uuid: "1",
        email: "test@example.com",
        password: "password",
      };

      jest.spyOn(usersRepository, "findOne").mockResolvedValue(user);

      expect(await service.findOne("1")).toEqual(user);
      expect(usersRepository.findOne).toHaveBeenCalledWith("1");
    });
  });

  describe("findAll", () => {
    it("should return an array of users", async () => {
      const usersArray: any[] = [
        {
          uuid: "1",
          email: "test@example.com",
          password: "password",
          type: UserType.client,
          disabled: false,
          createdAt: new Date(),
          userDetailsUuid: "1",
          userDetails: {},
        },
      ];

      jest.spyOn(usersRepository, "findAll").mockResolvedValue({
        total: 1,
        users: usersArray,
      });

      expect(await service.findAll(1, 10)).toEqual({
        total: 1,
        users: usersArray,
      });
      expect(usersRepository.findAll).toHaveBeenCalledWith(1, 10, undefined);
    });
  });

  describe("findByUuid", () => {
    it("should return a user by uuid", async () => {
      const user: any = {
        uuid: "1",
        email: "test@example.com",
        password: "password",
      };

      jest.spyOn(prismaService.user, "findUnique").mockResolvedValue(user);

      expect(await service.findByUuid("1")).toEqual(user);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { uuid: "1" },
        include: { userDetails: true },
      });
    });

    it("should throw an exception if user is not found", async () => {
      jest.spyOn(prismaService.user, "findUnique").mockResolvedValue(null);

      await expect(service.findByUuid("1")).rejects.toThrow(
        new HttpException("User not found", HttpStatus.NOT_FOUND)
      );
    });
  });

  describe("update", () => {
    it("should update a user", async () => {
      const updateUserDto: UpdateUserDto = {
        email: "updated@example.com",
      };

      const updatedUser: any = {
        uuid: "1",
        email: "updated@example.com",
        password: "password",
      };

      jest.spyOn(usersRepository, "update").mockResolvedValue(updatedUser);

      expect(await service.update("1", updateUserDto)).toEqual(updatedUser);
      expect(usersRepository.update).toHaveBeenCalledWith("1", updateUserDto);
    });
  });

  describe("remove", () => {
    it("should remove a user", async () => {
      jest.spyOn(usersRepository, "remove").mockResolvedValue(undefined);

      await service.remove("1");
      expect(usersRepository.remove).toHaveBeenCalledWith("1");
    });
  });

  describe("validateUser", () => {
    it("should validate user credentials", async () => {
      const user: any = {
        uuid: "1",
        email: "test@example.com",
        password: await service.encryptPassword("password"),
        userDetails: {},
      };

      jest.spyOn(service, "findByEmail").mockResolvedValue(user);
      jest.spyOn(service, "validatePassword").mockResolvedValue(true);

      expect(
        await service.validateUser("test@example.com", "password")
      ).toEqual(user);
    });

    it("should throw an exception if credentials are invalid", async () => {
      const user: any = {
        email: "test@example.com",
        password: await service.encryptPassword("wrongpassword"),
        userDetails: {},
      };

      jest.spyOn(service, "findByEmail").mockResolvedValue(user);
      jest.spyOn(service, "validatePassword").mockResolvedValue(false);

      await expect(
        service.validateUser("test@example.com", "password")
      ).rejects.toThrow(
        new HttpException("Invalid credentials", HttpStatus.UNAUTHORIZED)
      );
    });
  });

  describe("validatePassword", () => {
    it("should return true for valid password", async () => {
      const plainPassword = "password";
      const hashedPassword = await service.encryptPassword(plainPassword);

      // Use mockImplementation para retornar explicitamente o valor booleano
      jest.spyOn(bcrypt, "compare").mockImplementation(async () => true);

      expect(
        await service.validatePassword(plainPassword, hashedPassword)
      ).toBe(true);
    });

    it("should return false for invalid password", async () => {
      const plainPassword = "password";
      const hashedPassword = await service.encryptPassword("wrongpassword");

      // Use mockImplementation para retornar explicitamente o valor booleano
      jest.spyOn(bcrypt, "compare").mockImplementation(async () => false);

      expect(
        await service.validatePassword(plainPassword, hashedPassword)
      ).toBe(false);
    });
  });
});
