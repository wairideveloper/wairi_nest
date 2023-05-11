import {Module} from '@nestjs/common';
import {NoticeService} from './notice.service';
import {NoticeController} from './notice.controller';
import {Board} from "../../entity/entities/Board";
import {BoardArticles} from "../../entity/entities/BoardArticles";
import {TypeOrmModule} from "@nestjs/typeorm";

@Module({
    imports: [TypeOrmModule.forFeature([Board, BoardArticles])],
    controllers: [NoticeController],
    providers: [NoticeService]
})
export class NoticeModule {
}
