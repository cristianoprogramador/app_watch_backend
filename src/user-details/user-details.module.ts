import { Module } from "@nestjs/common";
import { UserDetailsRepository } from "./user-details.repository";
import { UserDetailsController } from "./user-details.controller";
import { UserDetailsService } from "./user-details.service";

@Module({
  controllers: [UserDetailsController],
  providers: [UserDetailsService, UserDetailsRepository],
  exports: [UserDetailsService],
})
export class UserDetailsModule {}
