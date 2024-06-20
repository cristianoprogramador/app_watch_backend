// src/user-details/user-details.service.spec.ts

import { Test, TestingModule } from "@nestjs/testing";
import { UserDetailsService } from "./user-details.service";
import { UserDetailsRepository } from "./user-details.repository";
import { CreateUserDetailsDto } from "./dto/create-user-details.dto";
import { UpdateUserDetailsDto } from "./dto/update-user-details.dto";
import { UpdateNotificationStatusDto } from "./dto/update-notification-status.dto";
import { UserDetails, PeopleDocumentType } from "@prisma/client";

// Descrevendo o conjunto de testes para o UserDetailsService
describe("UserDetailsService", () => {
  let service: UserDetailsService; // Declaração da variável para o serviço
  let repository: UserDetailsRepository; // Declaração da variável para o repositório

  // Configurando o módulo de teste antes de cada teste
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserDetailsService, // Registrando o serviço
        {
          provide: UserDetailsRepository, // Mockando o repositório
          useValue: {
            create: jest.fn(), // Mock da função create
            findOne: jest.fn(), // Mock da função findOne
            findAll: jest.fn(), // Mock da função findAll
            update: jest.fn(), // Mock da função update
            remove: jest.fn(), // Mock da função remove
          },
        },
      ],
    }).compile();

    service = module.get<UserDetailsService>(UserDetailsService); // Obtendo instância do serviço
    repository = module.get<UserDetailsRepository>(UserDetailsRepository); // Obtendo instância do repositório
  });

  // Teste para verificar se o serviço foi definido corretamente
  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  // Descrevendo o conjunto de testes para a função create
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

  // Descrevendo o conjunto de testes para a função findOne
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

  // Descrevendo o conjunto de testes para a função findAll
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

  // Descrevendo o conjunto de testes para a função update
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

      // Define o valor retornado pelo mock da função update
      jest.spyOn(repository, "update").mockResolvedValue(updatedUserDetails);

      // Executa o método update do serviço e verifica o resultado
      expect(await service.update("1", updateUserDetailsDto)).toEqual(
        updatedUserDetails
      );
      expect(repository.update).toHaveBeenCalledWith("1", updateUserDetailsDto);
    });
  });

  // Descrevendo o conjunto de testes para a função remove
  describe("remove", () => {
    it("should remove a user detail", async () => {
      // Define o valor retornado pelo mock da função remove
      jest.spyOn(repository, "remove").mockResolvedValue(undefined);

      // Executa o método remove do serviço e verifica se foi chamado corretamente
      await service.remove("1");
      expect(repository.remove).toHaveBeenCalledWith("1");
    });
  });

  // Descrevendo o conjunto de testes para a função updateNotificationStatus
  describe("updateNotificationStatus", () => {
    it("should update the notification status of a user detail", async () => {
      const updateNotificationStatusDto: UpdateNotificationStatusDto = {
        receiveNotifications: true,
      };

      // Define o valor retornado pelo mock da função update
      jest.spyOn(repository, "update").mockResolvedValue(undefined);

      // Executa o método updateNotificationStatus do serviço e verifica se foi chamado corretamente
      await service.updateNotificationStatus("1", updateNotificationStatusDto);
      expect(repository.update).toHaveBeenCalledWith("1", {
        receiveNotifications: updateNotificationStatusDto.receiveNotifications,
      });
    });
  });
});
