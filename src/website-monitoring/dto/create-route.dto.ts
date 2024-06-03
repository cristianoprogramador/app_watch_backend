// src/website-monitoring/dto/create-route.dto.ts
import { IsString, IsEnum, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
}

export class CreateRouteDto {
  @ApiProperty({
    example: "GET",
    enum: HttpMethod,
    description: "Método HTTP da rota",
  })
  @IsEnum(HttpMethod)
  method: HttpMethod;

  @ApiProperty({ example: "api/users", description: "Caminho da rota" })
  @IsString()
  route: string;

  @ApiProperty({
    example: '{\n  "productName": "teste"\n}',
    description: "Corpo da requisição para métodos POST e PUT",
    required: false,
  })
  @IsOptional()
  @IsString()
  body?: string;
}
