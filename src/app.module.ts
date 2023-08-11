import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
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
//modules
import {AuthModule} from './auth/auth.module';
import {MembersModule} from './members/members.module';
import {CampaignModule} from './campaign/campaign.module';
import { UploadModule } from './upload/upload.module';
import { ReviewModule } from './review/review.module';
import { NoticeModule } from './notice/notice.module';
import * as moment from 'moment';
import {MemberModule} from "./model/member.module";
import {IntrospectAndCompose} from "@apollo/gateway";

import { BigIntResolver, DateResolver, DateTimeResolver } from 'graphql-scalars';

@Module({
    imports: [
        ConfigModule.forRoot({
            cache: true,
            isGlobal: true,
            envFilePath: ['.development.env'],
        }),
        TypeOrmModule.forRoot({
            type: 'mariadb',
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
            path: 'user',
            playground: true,
            include: [MemberModule],
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
            },
            context: ({ req, connection }) => { //graphql에게 request를 요청할때 req안으로 jwt토큰이 담김
                if (req) {
                    const user = req.headers.authorization;
                    return { ...req, user };
                } else {
                    return connection;
                }
            },
            //
            formatError: (error) => {
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
        MembersModule,
        AuthModule,
        CampaignModule,
        UploadModule,
        ReviewModule,
        NoticeModule,
        MemberModule
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
