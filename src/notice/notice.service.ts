import {Injectable, NotFoundException} from '@nestjs/common';
import {CreateNoticeDto} from './dto/create-notice.dto';
import {UpdateNoticeDto} from './dto/update-notice.dto';
import {Board} from "../../entity/entities/Board";
import {BoardArticles} from "../../entity/entities/BoardArticles";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Pagination, PaginationOptions} from "../paginate";
import * as moment from "moment/moment";

@Injectable()
export class NoticeService {

    constructor(
        @InjectRepository(Board)
        private boardRepository: Repository<Board>,
        @InjectRepository(BoardArticles)
        private boardArticlesRepository: Repository<BoardArticles>,
    ) {
    }

    create(createNoticeDto: CreateNoticeDto) {
        return 'This action adds a new notice';
    }

    async findAll(options: PaginationOptions) {
        const {take, page} = options;
        const data = await this.boardArticlesRepository.createQueryBuilder('boardArticles')
            .leftJoin('boardArticles.board', 'board')
            .select(
                [
                    'board.name',
                    'boardArticles.idx',
                    'boardArticles.title',
                    'boardArticles.regdate',
                ]
            )
            .where('board.idx = :idx', {idx: 1})
            .where('boardArticles.memberType = :memberType', {memberType: 0})
            .orderBy('boardArticles.idx', 'DESC')
            .offset(take * (page - 1))
            .limit(take)
            .getMany()

        const total = await this.boardArticlesRepository.createQueryBuilder('boardArticles')
            .leftJoin('boardArticles.board', 'board')
            .where('board.idx = :idx', {idx: 1})
            .where('boardArticles.memberType = :memberType', {memberType: 0})
            .getCount()

        let totalPage = Math.ceil(total / take);
        if (page > totalPage) {
            throw new NotFoundException();
        }
        const currentPage = page;

        data.map((item) => {
            item.regdate = moment.unix(Number(item.regdate)).format('YYYY-MM-DD');
        })

        return new Pagination({
            data,
            total,
            totalPage,
            currentPage
        });

    }

    async findOne(id: number) {
        const data = await this.boardArticlesRepository.findOne({where: {idx: id}});
        data.regdate = moment.unix(Number(data.regdate)).format('YYYY-MM-DD');
        return data;
    }

    update(id: number, updateNoticeDto: UpdateNoticeDto) {
        return `This action updates a #${id} notice`;
    }

    remove(id: number) {
        return `This action removes a #${id} notice`;
    }
}
