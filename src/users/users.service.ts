// src\users\users.service.ts

import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersRepository } from "./users.repository";
import { PrismaService } from "src/prisma/prisma.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private usersRepository: UsersRepository,
    private prisma: PrismaService
  ) {}

  async create(createUserDto: CreateUserDto) {
    const cipherText = createUserDto.password
      ? await this.encryptPassword(createUserDto.password)
      : null;

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: cipherText,
      },
      include: { userDetails: true },
    });

    return user;
  }

  async findByEmailGoogle(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { userDetails: true },
    });

    if (!user) {
      this.logger.log(`No user found for email: ${email}`);
      return null;
    }

    this.logger.log(`User found for email: ${email}`);
    return user;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { userDetails: true },
    });
    if (!user) {
      this.logger.log(`No user found for email: ${email}`);
      throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    }
    this.logger.log(`User found for email: ${email}`);
    return user;
  }

  async findOne(uuid: string) {
    return this.usersRepository.findOne(uuid);
  }

  async findAll(page: number, itemsPerPage: number, search?: string) {
    return await this.usersRepository.findAll(page, itemsPerPage, search);
  }

  async findByUuid(uuid: string) {
    const user = await this.prisma.user.findUnique({
      where: { uuid },
      include: { userDetails: true },
    });
    if (!user) {
      this.logger.warn(`No user found for UUID: ${uuid}`);
      throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    }
    this.logger.log(`User found for UUID: ${uuid}`);
    return user;
  }

  async update(uuid: string, updateUserDto: UpdateUserDto) {
    return this.usersRepository.update(uuid, updateUserDto);
  }

  async remove(uuid: string) {
    return this.usersRepository.remove(uuid);
  }

  async validateUser(email: string, plainPassword: string) {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    }

    const isValid = await this.validatePassword(plainPassword, user.password);
    if (!isValid) {
      throw new HttpException("Invalid credentials", HttpStatus.UNAUTHORIZED);
    }

    return user;
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async encryptPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }

  async updatePassword(uuid: string, newPassword: string) {
    const hashedPassword = await this.encryptPassword(newPassword);
    await this.prisma.user.update({
      where: { uuid },
      data: { password: hashedPassword },
    });
  }
}
