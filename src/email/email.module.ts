import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailerModule } from '@nestjs-modules/mailer';
import { Partner } from '../../entity/entities/Partner';
import { Campaign } from '../../entity/entities/Campaign';
import { EmailTemplate } from '../../entity/entities/EmailTemplate';
import { CampaignSubmit } from '../../entity/entities/CampaignSubmit';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Partner, Campaign, EmailTemplate, CampaignSubmit]),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 465,
        auth: {
          user: 'wairirsv@gmail.com',
          pass: 'brmx lmjk knrn ygvp',
        },
      },
      defaults: {
        from: '"nest-modules" <modules@nestjs.com>',
      },
      template: {
        dir: __dirname + '/templates',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  controllers: [EmailController],
  providers: [EmailService]
})
export class EmailModule {}
