import {Injectable, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from '../../../entity/entities/Board';
import { BoardArticles} from "../../../entity/entities/BoardArticles";
import {FROM_UNIXTIME} from "../../util/common";
import {Pagination} from "../../paginate";

@Injectable()
export class BoardModelService {
    constructor(
        @InjectRepository(Board)
        private boardRepository: Repository<Board>,
        @InjectRepository(BoardArticles)
        private boardArticlesRepository: Repository<BoardArticles>,
    ) {}
    async getBoardList(type: number, take: number, page: number) {
        try{
            const board = await this.boardRepository
                .createQueryBuilder('board')
                .select('*')
                .where('board.idx = :type', {type: type})
                .getRawMany();
            const data = await this.boardArticlesRepository
                .createQueryBuilder('boardArticles')
                .select('*')
                .addSelect(`(${FROM_UNIXTIME('regdate')})`, 'regdate')
                .where('boardArticles.boardIdx = :type', {type: type})
                .offset(take * (page - 1))
                .limit(take)
                .getRawMany();

            const total = await this.boardArticlesRepository.createQueryBuilder('boardArticles')
                .where('boardArticles.boardIdx = :type', {type: type}).getCount();

            let totalPage = Math.ceil(total / take);
            if (page > totalPage) {
                throw new NotFoundException();
            }
            const currentPage = page;

            const boardArticles = new Pagination({
                data,
                total,
                totalPage,
                currentPage
            });

            let result = [];
            board.forEach((item, index) => {
                result.push({
                    ...item,
                    boardArticles: boardArticles
                })
            })

            console.log(result)
            return result;
        }catch (error) {
            throw error;
        }
    }
}
