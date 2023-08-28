import {Module} from '@nestjs/common';
import {AuthQlModelService} from './auth_ql_model.service';
import {AuthQlModelResolver} from './auth_ql_model.resolver';
import {MembersService} from "../member_model/member.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Member} from "../../../entity/entities/Member";
import {Campaign} from "../../../entity/entities/Campaign";
import {CampaignItem} from "../../../entity/entities/CampaignItem";
import {CampaignImage} from "../../../entity/entities/CampaignImage";
import {Cate} from "../../../entity/entities/Cate";
import {CateArea} from "../../../entity/entities/CateArea";
import {Partner} from "../../../entity/entities/Partner";
import {CampaignReview} from "../../../entity/entities/CampaignReview";
import {CampaignRecent} from "../../../entity/entities/CampaignRecent";
import {JwtService} from "@nestjs/jwt";
import {Logger} from "winston";
import {MemberChannel} from "../../../entity/entities/MemberChannel";

@Module({
    imports: [
        TypeOrmModule.forFeature([Member, MemberChannel, Campaign, CampaignItem, CampaignImage, Cate, CateArea
            , Partner, CampaignReview, CampaignRecent
        ]),
    ],
    providers: [AuthQlModelResolver, AuthQlModelService, MembersService, JwtService]
})
export class AuthQlModelModule {
}
