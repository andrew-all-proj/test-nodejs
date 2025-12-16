import {
  IsString,
  MaxLength,
  MinLength,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Validate,
} from 'class-validator'
import { isEmail, isPhoneNumber } from 'class-validator'

@ValidatorConstraint({ name: 'emailOrPhone', async: false })
class EmailOrPhoneConstraint implements ValidatorConstraintInterface {
  validate(value: string) {
    if (typeof value !== 'string') return false
    return isEmail(value) || isPhoneNumber(value)
  }

  defaultMessage(_args?: ValidationArguments) {
    return 'id must be a valid email or phone number'
  }
}

export class AuthCredentialsDto {
  @IsString()
  @MaxLength(50)
  @Validate(EmailOrPhoneConstraint)
  id!: string

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password!: string
}

export class RefreshTokenDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2048)
  refresh_token!: string
}
