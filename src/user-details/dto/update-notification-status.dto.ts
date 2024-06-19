// src/user-details/dto/update-notification-status.dto.ts

import { ApiProperty } from "@nestjs/swagger";

export class UpdateNotificationStatusDto {
  @ApiProperty({
    example: true,
    description: "Receive Notifications status",
  })
  receiveNotifications: boolean;
}
