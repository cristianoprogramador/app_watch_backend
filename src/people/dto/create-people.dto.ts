export class CreatePeopleDto {
  readonly name: string;
  readonly email: string;
  readonly document?: string;
  readonly typeDocument?: string;
}
