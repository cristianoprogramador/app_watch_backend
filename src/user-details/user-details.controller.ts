// src\user-details\user-details.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Patch,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { UuidValidationPipe } from "src/common/pipes/uuid-validation.pipe";
import { UserDetailsService } from "./user-details.service";
import { CreateUserDetailsDto } from "./dto/create-user-details.dto";
import { UpdateUserDetailsDto } from "./dto/update-user-details.dto";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { UserDetails } from "@prisma/client";
import { UpdateNotificationStatusDto } from "./dto/update-notification-status.dto";

@ApiTags("UserDetails")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller("userDetails")
export class UserDetailsController {
  constructor(private readonly userDetailsService: UserDetailsService) {}

  @Post()
  @ApiExcludeEndpoint()
  create(@Body() createUserDetailsDto: CreateUserDetailsDto) {
    return this.userDetailsService.create(createUserDetailsDto);
  }

  @Get("list")
  @ApiOperation({ summary: "List user details" })
  @ApiQuery({ name: "page", required: true, type: Number, example: 1 })
  @ApiQuery({ name: "itemsPerPage", required: true, type: Number, example: 10 })
  @ApiQuery({ name: "search", required: false, type: String })
  findAll(
    @Query("page") page: string,
    @Query("itemsPerPage") itemsPerPage: string,
    @Query("search") search?: string
  ): Promise<UserDetails[]> {
    return this.userDetailsService.findAll(+page, +itemsPerPage, search);
  }

  @Get(":uuid")
  @ApiOperation({ summary: "Find user details by UUID" })
  findOne(
    @Param("uuid", UuidValidationPipe) uuid: string
  ): Promise<UserDetails> {
    return this.userDetailsService.findOne(uuid);
  }

  @Put(":uuid")
  @ApiOperation({ summary: "Update user details" })
  @ApiParam({
    name: "uuid",
    description: "Unique identifier of the user details to update",
  })
  update(
    @Param("uuid") uuid: string,
    @Body() updateUserDetailsDto: UpdateUserDetailsDto
  ): Promise<UserDetails> {
    return this.userDetailsService.update(uuid, updateUserDetailsDto);
  }

  @Delete(":uuid")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete user details by UUID" })
  @ApiParam({
    name: "uuid",
    required: true,
    description: "Unique identifier of the user details to delete",
  })
  remove(@Param("uuid", UuidValidationPipe) uuid: string): Promise<void> {
    return this.userDetailsService.remove(uuid);
  }

  @Patch(":uuid/notification-status")
  @ApiOperation({ summary: "Update notification status for a user" })
  @ApiParam({
    name: "uuid",
    description:
      "Unique identifier of the user details to update notification status",
  })
  async updateNotificationStatus(
    @Param("uuid") uuid: string,
    @Body() updateNotificationStatusDto: UpdateNotificationStatusDto
  ): Promise<{ message: string }> {
    await this.userDetailsService.updateNotificationStatus(
      uuid,
      updateNotificationStatusDto
    );
    return { message: "Notification status updated successfully" };
  }
}
