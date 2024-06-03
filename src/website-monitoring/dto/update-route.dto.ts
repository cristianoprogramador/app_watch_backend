import { IsString, IsEnum, IsOptional, IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { HttpMethod } from "./create-route.dto";

export class UpdateRouteDto {
  @IsUUID()
  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    description:
      "UUID da rota, necessário para identificar a rota a ser atualizada",
  })
  uuid: string;

  @IsEnum(HttpMethod)
  @ApiProperty({
    example: "GET",
    enum: HttpMethod,
    description: "Método HTTP da rota",
  })
  method: HttpMethod;

  @IsString()
  @ApiProperty({ example: "api/users", description: "Caminho da rota" })
  route: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: '{ "productName": "teste" }',
    description: "Corpo da requisição para métodos POST e PUT",
    required: false,
  })
  body?: string;
}
