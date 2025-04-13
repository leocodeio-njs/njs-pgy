import { IsEmail, IsPhoneNumber, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The phone of the user',
    example: '+1234567890',
  })
  @IsPhoneNumber()
  phone: string;

  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The integration user id of the user',
    example: '2d8b4f36-c8b7-4a7e-aebe-9c72137b45a8',
  })
  @IsUUID()
  integrationUserId: string;

  @ApiProperty({
    description: 'The customer id of the user',
    example: '2d8b4f36-c8b7-4a7e-aebe-9c72137b45a8',
  })
  @IsUUID()
  customerId: string;
}
