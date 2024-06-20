// src/user-details/user-details.service.spec.ts

import { Test, TestingModule } from "@nestjs/testing";
import { UserDetailsService } from "./user-details.service";
import { UserDetailsRepository } from "./user-details.repository";
import { CreateUserDetailsDto } from "./dto/create-user-details.dto";
import { UpdateUserDetailsDto } from "./dto/update-user-details.dto";
import { UpdateNotificationStatusDto } from "./dto/update-notification-status.dto";
import { UserDetails, PeopleDocumentType } from "@prisma/client";

describe("UserDetailsService", () => {
  let service: UserDetailsService;
  let repository: UserDetailsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserDetailsService,
        {
          provide: UserDetailsRepository,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserDetailsService>(UserDetailsService);
    repository = module.get<UserDetailsRepository>(UserDetailsRepository);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a new user detail", async () => {
      const createUserDetailsDto: CreateUserDetailsDto = {
        name: "Test User",
        email: "test@example.com",
        document: "123456789",
        typeDocument: PeopleDocumentType.CPF,
        profileImageUrl: "http://example.com/profile.jpg",
      };

      const createdUserDetails: any = {
        uuid: "1",
        ...createUserDetailsDto,
        receiveNotifications: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      jest.spyOn(repository, "create").mockResolvedValue(createdUserDetails);

      expect(await service.create(createUserDetailsDto)).toEqual(
        createdUserDetails
      );
      expect(repository.create).toHaveBeenCalledWith(createUserDetailsDto);
    });
  });

  describe("findOne", () => {
    it("should return a user detail by uuid", async () => {
      const userDetail: UserDetails = {
        uuid: "1",
        name: "Test User",
        email: "test@example.com",
        document: "123456789",
        typeDocument: PeopleDocumentType.CPF,
        profileImageUrl: "http://example.com/profile.jpg",
        receiveNotifications: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      jest.spyOn(repository, "findOne").mockResolvedValue(userDetail);

      expect(await service.findOne("1")).toEqual(userDetail);
      expect(repository.findOne).toHaveBeenCalledWith("1");
    });
  });

  describe("findAll", () => {
    it("should return an array of user details", async () => {
      const userDetailsArray: UserDetails[] = [
        {
          uuid: "1",
          name: "Test User",
          email: "test@example.com",
          document: "123456789",
          typeDocument: PeopleDocumentType.CPF,
          profileImageUrl: "http://example.com/profile.jpg",
          receiveNotifications: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ];

      jest.spyOn(repository, "findAll").mockResolvedValue(userDetailsArray);

      expect(await service.findAll(1, 10)).toEqual(userDetailsArray);
      expect(repository.findAll).toHaveBeenCalledWith(1, 10, undefined);
    });
  });

  describe("update", () => {
    it("should update a user detail", async () => {
      const updateUserDetailsDto: UpdateUserDetailsDto = {
        name: "Updated User",
      };

      const updatedUserDetails: UserDetails = {
        uuid: "1",
        name: "Updated User",
        email: "test@example.com",
        document: "123456789",
        typeDocument: PeopleDocumentType.CPF,
        profileImageUrl: "http://example.com/profile.jpg",
        receiveNotifications: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      jest.spyOn(repository, "update").mockResolvedValue(updatedUserDetails);

      expect(await service.update("1", updateUserDetailsDto)).toEqual(
        updatedUserDetails
      );
      expect(repository.update).toHaveBeenCalledWith("1", updateUserDetailsDto);
    });
  });

  describe("remove", () => {
    it("should remove a user detail", async () => {
      jest.spyOn(repository, "remove").mockResolvedValue(undefined); // Pass undefined to resolve properly

      await service.remove("1");
      expect(repository.remove).toHaveBeenCalledWith("1");
    });
  });

  describe("updateNotificationStatus", () => {
    it("should update the notification status of a user detail", async () => {
      const updateNotificationStatusDto: UpdateNotificationStatusDto = {
        receiveNotifications: true,
      };

      jest.spyOn(repository, "update").mockResolvedValue(undefined); // Pass undefined to resolve properly

      await service.updateNotificationStatus("1", updateNotificationStatusDto);
      expect(repository.update).toHaveBeenCalledWith("1", {
        receiveNotifications: updateNotificationStatusDto.receiveNotifications,
      });
    });
  });
});
