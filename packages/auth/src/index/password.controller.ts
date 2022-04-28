import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import { ERROR_CODES } from '@seaccentral/core/dist/error/errors';
import { UsersService } from '@seaccentral/core/dist/user/users.service';
import { compare } from '@seaccentral/core/dist/utils/crypt';
import { TrimPipe } from '@seaccentral/core/dist/utils/TrimPipe';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import IRequestWithUser from './interface/IRequestWithUser.interface';
import { PasswordService } from './password.service';
import { PasswordResetMailer } from './passwordResetMailer.service';
import { reCaptchaGuard } from './recaptcha.guard';
import ResetPasswordTokenGuard from './resetPasswordToken.guard';

@Controller('v1')
@ApiTags('Password')
export class PasswordController {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly passwordResetMailer: PasswordResetMailer,
  ) {}

  @Post('forgot-password')
  @UseGuards(reCaptchaGuard('forgot_password'))
  @UsePipes(new TrimPipe())
  @HttpCode(204)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const user = await this.usersService.getByEmail(email);
    if (
      !user ||
      !(await this.usersService.getProviderByUser(user, 'password'))
    ) {
      return;
    }

    const passwordResetToken =
      await PasswordService.generatePasswordResetToken();
    await PasswordService.savePasswordResetToken(user, passwordResetToken);
    await this.passwordResetMailer.sendEmailPasswordReset(
      user,
      passwordResetToken,
    );
  }

  @Post('validate-password-token')
  @UsePipes(new TrimPipe())
  @UseGuards(ResetPasswordTokenGuard)
  @HttpCode(200)
  validatePasswordToken() {
    return { success: true };
  }

  @Post('reset-password')
  @UsePipes(new TrimPipe())
  @UseGuards(reCaptchaGuard('reset_password'), ResetPasswordTokenGuard)
  @HttpCode(200)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const { password, token } = resetPasswordDto;
    const user = await this.usersService.getUserByPasswordResetKey(token);
    if (!user) {
      throw new UnauthorizedException();
    }
    const userAuthProvider = await this.usersService.getProviderByUser(
      user,
      'password',
    );
    if (!userAuthProvider) {
      throw new UnauthorizedException();
    }
    try {
      await this.passwordService.changePassword(userAuthProvider, password);
      await this.usersService.unsetPasswordResetKey(user);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @UsePipes(new TrimPipe())
  @HttpCode(HttpStatus.NO_CONTENT)
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: IRequestWithUser,
  ) {
    if (!req.user) {
      throw new UnauthorizedException();
    }
    const { currentPassword, newPassword } = changePasswordDto;

    const userAuthProvider = await this.usersService.getProviderByUser(
      req.user,
      'password',
    );

    if (!userAuthProvider) {
      throw new UnauthorizedException();
    }

    if (!userAuthProvider.hashedPassword) {
      throw new HttpException(
        'Password not linked with user',
        HttpStatus.BAD_REQUEST,
      );
    }

    const isPasswordMatching = await compare(
      currentPassword,
      userAuthProvider.hashedPassword,
    );

    if (!isPasswordMatching) {
      throw new BadRequestException(ERROR_CODES.WRONG_CURRENT_PASSWORD);
    }

    await this.passwordService.changePassword(userAuthProvider, newPassword);
  }
}
