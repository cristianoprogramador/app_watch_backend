import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersRepository } from "./users.repository";
import { PrismaService } from "src/prisma/prisma.service";
import * as CryptoJS from "crypto-js";

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private usersRepository: UsersRepository,
    private prisma: PrismaService
  ) {}

  async create(createUserDto: CreateUserDto) {
    const cipherText = CryptoJS.AES.encrypt(
      createUserDto.password,
      process.env.CRYPTO_SECRET
    ).toString();
    createUserDto.password = cipherText;
    return this.usersRepository.create(createUserDto);
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
    const bytes = CryptoJS.AES.decrypt(
      hashedPassword,
      process.env.CRYPTO_SECRET
    );
    const originalPassword = bytes.toString(CryptoJS.enc.Utf8);
    return plainPassword === originalPassword;
  }

  async encryptPassword(password: string): Promise<string> {
    const cipherText = CryptoJS.AES.encrypt(
      password,
      process.env.CRYPTO_SECRET
    ).toString();
    return cipherText;
  }
}
