import { IsString, MinLength } from "class-validator"

export class UserLoginRequestBodyDto {
  @IsString()
  public readonly username!: string
  @IsString()
  @MinLength(8)
  public readonly password!: string
}
