import { IsString, MinLength } from "class-validator";

export class RegisterUserRequestBodyDto {
  @IsString()
  public readonly username!: string;

  @IsString()
  @MinLength(8)
  public readonly password!: string;
}
