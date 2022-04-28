import { ApiProperty } from '@nestjs/swagger';
import { NotificationReceiverRole } from '@seaccentral/core/dist/notification/enum/NotificationReceiverRole.enum';
import { LanguageBody } from '@seaccentral/core/dist/dto/Language.dto';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateEmailNotificationDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  senderEmailUser!: string;

  @IsUUID('4')
  @IsNotEmpty()
  @ApiProperty()
  senderEmailDomainId!: string;

  @IsEnum(NotificationReceiverRole, { each: true })
  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty()
  receiverRoles!: NotificationReceiverRole[];

  @IsUUID('4')
  @IsNotEmpty()
  @ApiProperty()
  emailFormatEnId!: string;

  @IsUUID('4')
  @IsNotEmpty()
  @ApiProperty()
  emailFormatThId!: string;

  @IsObject()
  @IsNotEmpty()
  @ApiProperty()
  subject: LanguageBody;

  @IsObject()
  @IsNotEmpty()
  @ApiProperty()
  bodyHTML: LanguageBody;
}
