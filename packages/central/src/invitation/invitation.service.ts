import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { UserIdentifiers } from '@seaccentral/core/dist/dto/UserIdentifiers.dto';
import { Invitation } from '@seaccentral/core/dist/invitation/Invitation.entity';
import { Role } from '@seaccentral/core/dist/user/Role.entity';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { UsersService } from '@seaccentral/core/dist/user/users.service';
import { In, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { OrganizationService } from '../organization/organization.service';
import { InviteUserBody } from './dto/InviteUserBody.dto';

@Injectable()
export class InvitationService {
  constructor(
    private readonly configService: ConfigService,
    private readonly organizationService: OrganizationService,
    private readonly usersService: UsersService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async create(invitedUser: InviteUserBody, invitedBy: User) {
    const existingUsers = await this.usersRepository.find({
      where: { email: invitedUser.email },
    });

    if (existingUsers.length > 0) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'User with this email already exists!',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingInvitations = await this.invitationRepository.find({
      where: { email: invitedUser.email },
    });

    if (existingInvitations.length > 0) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'User with this email is already invited!',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const role = await this.roleRepository.findOne(invitedUser.role);

    const organization = await this.organizationService.findById(
      invitedUser.organization,
    );

    const token = uuidv4();
    const newInvitation = this.invitationRepository.create({
      role,
      token,
      invitedBy,
      organization,
      email: invitedUser.email,
      lastName: invitedUser.lastName,
      firstName: invitedUser.firstName,
    });
    await this.invitationRepository.save(newInvitation);

    this.usersService.sendAccountActivationEmail({
      fullName: `${invitedUser.firstName} ${invitedUser.lastName}`,
      email: invitedUser.email,
      token,
    });

    return invitedUser;
  }

  async resendEmail(invitationIdsBody: UserIdentifiers) {
    const invitations = await this.invitationRepository.find({
      where: { id: In(invitationIdsBody.ids) },
    });

    invitations.forEach((invitation) => {
      if (invitation.acceptedAt) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: 'User has accepted the invitation',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    invitations.forEach((invitation) => {
      this.usersService.sendAccountActivationEmail({
        id: invitation.userId,
        token: invitation.token,
      });
    });
  }

  async validateToken(token: string) {
    const invitation = await this.invitationRepository.findOne({
      where: { token, isActive: true },
    });

    if (!invitation) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Invalid invitation token',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      email: invitation.email,
    };
  }
}
