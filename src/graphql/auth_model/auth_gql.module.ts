import {Module} from "@nestjs/common";
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
import {AuthResolver} from "./auth.resolver";
import {AuthQlService} from "../../auth_ql/auth_ql.service";
import {AuthGqlService} from "./auth_gql.service";
import {CampaignService} from "../../campaign/campaign.service";
import {JwtService} from "@nestjs/jwt";

@Module({
    imports: [TypeOrmModule.forFeature([Member,Campaign,CampaignItem,CampaignImage,Cate,CateArea
        ,Partner,CampaignReview,CampaignRecent
    ])],
    providers: [AuthResolver, AuthQlService,CampaignService, AuthGqlService, JwtService]
})
export class Auth_gqlModule {}
