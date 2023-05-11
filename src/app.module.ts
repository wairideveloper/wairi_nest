import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {MembersModule} from './members/members.module';
import * as process from 'process';
import {Member} from '../entity/entities/Member';
import {Campaign} from "../entity/entities/Campaign";
import {AuthModule} from './auth/auth.module';
import {CampaignModule} from './campaign/campaign.module';
import {CampaignItem} from "../entity/entities/CampaignItem";
import {CampaignImage} from "../entity/entities/CampaignImage";
import {Cate} from "../entity/entities/Cate";
import {CateArea} from "../entity/entities/CateArea";
import {Partner} from "../entity/entities/Partner";
import {CampaignReview} from "../entity/entities/CampaignReview";
import { UploadModule } from './upload/upload.module';
import { ReviewModule } from './review/review.module';
import { NoticeModule } from './notice/notice.module';
import * as moment from 'moment';
import {Board} from "../entity/entities/Board";
import {BoardArticles} from "../entity/entities/BoardArticles";
import {CampaignRecent} from "../entity/entities/CampaignRecent";
import {CampaignItemSchedule} from "../entity/entities/CampaignItemSchedule";

@Module({
    imports: [
        ConfigModule.forRoot({
            cache: true,
            isGlobal: true,
            envFilePath: ['.development.env'],
        }),
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT),
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_SCHEMA,
            entities: [
                Member, Campaign, CampaignItem, CampaignImage,
                Cate, CateArea, Partner, CampaignReview,
                Board, BoardArticles, CampaignRecent, CampaignItemSchedule
            ],
            synchronize: false,
        }),
        MembersModule,
        AuthModule,
        CampaignModule,
        UploadModule,
        ReviewModule,
        NoticeModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: 'moment',
            useValue: moment,
        }
    ],
})
export class AppModule {
}
