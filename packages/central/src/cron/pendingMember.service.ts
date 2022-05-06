import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { BANGKOK_TIMEZONE } from '@seaccentral/core/dist/utils/constants';
import { Connection, LessThanOrEqual, Repository } from 'typeorm';
import { PendingMember } from '@seaccentral/core/dist/user/PendingMember.entity';
import { from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { MemberService } from '../webhook/member.service';

@Injectable()
export class PendingMemberService {
  constructor(
    private readonly memberService: MemberService,
    @InjectRepository(PendingMember)
    private readonly pendingMemberRepository: Repository<PendingMember>,
    private readonly connection: Connection,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    timeZone: BANGKOK_TIMEZONE,
  })
  async activatePendingMember() {
    const members = await this.pendingMemberRepository.find({
      activationDate: LessThanOrEqual(new Date()),
    });
    const concurrency = 10;
    from(members)
      .pipe(
        mergeMap(
          async (member) =>
            this.connection.transaction(async (manager) => {
              await this.memberService
                .withTransaction(manager)
                .activateMember(member.user, member.organization);
            }),
          concurrency,
        ),
      )
      .subscribe();
  }
}
