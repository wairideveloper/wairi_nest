import {Module} from '@nestjs/common';
import {CommonModelService} from './common_model.service';
import {MembersService} from "../member_model/member.service";
import {CommonModelResolver} from './common_model.resolver';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Member} from "../../../entity/entities/Member";
import {MemberChannel} from "../../../entity/entities/MemberChannel";
import {CampaignReview} from "../../../entity/entities/CampaignReview";
import {Config} from "../../../entity/entities/Config";
import {MemberDevice} from "../../../entity/entities/MemberDevice";
import {PushLog} from "../../../entity/entities/PushLog";
// import {Config} from "aws-sdk";
import {JwtService} from "@nestjs/jwt";
import {Partner} from "../../../entity/entities/Partner";


@Module({
    imports: [
        TypeOrmModule.forFeature([
            Member, MemberChannel, CampaignReview,Config, Partner, MemberDevice, PushLog
        ]),
    ],
    providers: [CommonModelResolver, CommonModelService, MembersService, JwtService]
})
export class CommonModelModule {
}
