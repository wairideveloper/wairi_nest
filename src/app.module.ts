import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
// import {Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {GraphQLModule} from '@nestjs/graphql';
import {ApolloDriver, ApolloDriverConfig, ApolloGatewayDriver, ApolloGatewayDriverConfig} from '@nestjs/apollo';
import * as process from 'process';
//entities
import {Member} from '../entity/entities/Member';
import {Campaign} from "../entity/entities/Campaign";
import {CampaignItem} from "../entity/entities/CampaignItem";
import {CampaignImage} from "../entity/entities/CampaignImage";
import {Cate} from "../entity/entities/Cate";
import {CateArea} from "../entity/entities/CateArea";
import {Partner} from "../entity/entities/Partner";
import {CampaignReview} from "../entity/entities/CampaignReview";
import {Board} from "../entity/entities/Board";
import {BoardArticles} from "../entity/entities/BoardArticles";
import {CampaignRecent} from "../entity/entities/CampaignRecent";
import {CampaignItemSchedule} from "../entity/entities/CampaignItemSchedule";
import {MemberChannel} from "../entity/entities/MemberChannel";
import {CampaignFav} from "../entity/entities/CampaignFav";
//modules
import {AuthModule} from './auth/auth.module';
import {MembersModule} from './members/members.module';
import {CampaignModule} from './campaign/campaign.module';
import {UploadModule} from './upload/upload.module';
import {ReviewModule} from './review/review.module';
import {NoticeModule} from './notice/notice.module';
import * as moment from 'moment';

//GraphQL
import {MemberModule} from "./graphql/member_model/member.module";
import {Campaign_gqlModule} from "./graphql/campaign_model/campaign_gql.module";
import {IntrospectAndCompose} from "@apollo/gateway";

import {BigIntResolver, DateResolver, DateTimeResolver} from 'graphql-scalars';
// import { AuthQlModule } from './auth_ql/auth_ql.module';
import {Auth_gqlModule} from "./graphql/auth_model/auth_gql.module";
import {AuthQlModelModule} from "./graphql/auth_ql_model/auth_ql_model.module"

import { LoggerMiddleware } from './middlewares/logger.middleware';
import {ApolloServerPluginLandingPageLocalDefault} from "@apollo/server/dist/cjs/plugin/landingPage/default";
import {Config} from "../entity/entities/Config";
import { BannerModelModule } from './graphql/banner_model/banner_model.module';
import {Banner} from "../entity/entities/Banner";
import { CateModelModule } from './graphql/cate_model/cate_model.module';
import { MainModelModule } from './graphql/main_model/main_model.module';
import {CampaignSubmit} from "../entity/entities/CampaignSubmit";
import { BoardModelModule } from './graphql/board_model/board_model.module';
import { PaymentModelModule } from './graphql/payment_model/payment_model.module';
import { Madein20ModelModule } from './graphql/madein20_model/madein20_model.module';
import { CommonModelModule } from './graphql/common_model/common_model.module';
import * as graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js';
// import {GraphQLUpload} from "graphql-upload";
import { FirebaseModule } from './graphql/firebase/firebase.module';

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
                Member, MemberChannel, Campaign, CampaignItem, CampaignImage,
                Cate, CateArea, Partner, CampaignReview,
                Board, BoardArticles, CampaignRecent, CampaignItemSchedule,
                Config, Banner, Cate, CateArea, CampaignSubmit, CampaignFav
            ],
            synchronize: false,
            charset: 'UTF8_GENERAL_CI',
            // extra: {
            //     charset: "utf8mb4"
            // },
            logging: true,
        }),
        // 마이크로 서비스 계획시 사용
        // GraphQLModule.forRoot<ApolloGatewayDriverConfig>({
        //     driver: ApolloGatewayDriver,
        //     gateway: {
        //         supergraphSdl: new IntrospectAndCompose({
        //             subgraphs: [
        //                 { name: 'user', url: 'http://localhost:3000/user' },
        //                 // { name: 'posts', url: 'http://localhost:3001/graphql' },
        //             ],
        //         }),
        //     },
        //     // typePaths: ['./**/*.graphql'],
        // }),

        GraphQLModule.forRoot({
            driver: ApolloDriver,
            debug: true,
            path: 'api/graphql',
            playground: true,
            include: [MemberModule,
                Campaign_gqlModule,
                Auth_gqlModule,
                AuthQlModelModule,
                BannerModelModule,
                CateModelModule,
                MainModelModule,
                BoardModelModule,
                PaymentModelModule,
                Madein20ModelModule,
                CommonModelModule
            ],
            typePaths: ['./**/*.graphql'],
            definitions: {
                customScalarTypeMapping: {
                    BigInt: 'bigint',
                    DateTime: 'Date',
                },
            },
            resolvers: {
                BigInt: BigIntResolver,
                Date: DateResolver,
                DateTime: DateTimeResolver,
                // Upload: GraphQLUpload
            },
            uploads: false,
            context: ({req, connection}) => { //graphql에게 request를 요청할때 req안으로 jwt토큰이 담김
                if (req) {
                    const user = req.headers.authorization;
                    return {...req, user};
                } else {
                    return connection;
                }
            },
            formatError: (error) => {
                console.log(error)
                const graphQLFormattedError = {
                    message:
                        error.extensions?.exception?.response?.message || error.message,
                    code:
                        error.extensions?.originalError?.statusCode || "SERVER_ERROR",
                    name: error.extensions?.exception?.name || error.name,
                };
                return graphQLFormattedError;
            },
        }),
        // MembersModule,
        MemberModule,
        AuthModule,
        CampaignModule,
        UploadModule,
        ReviewModule,
        NoticeModule,
        MemberModule,
        Campaign_gqlModule,
        // AuthQlModule,
        Auth_gqlModule,
        AuthQlModelModule,
        BannerModelModule,
        CateModelModule,
        MainModelModule,
        BoardModelModule,
        PaymentModelModule,
        Madein20ModelModule,
        CommonModelModule,
        FirebaseModule

    ],
    controllers: [AppController],
    providers: [
        Logger,
        AppService,
        {
            provide: 'moment',
            useValue: moment,
        }
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware).forRoutes('*');
        consumer.apply(graphqlUploadExpress()).forRoutes("graphql")
    }
}
