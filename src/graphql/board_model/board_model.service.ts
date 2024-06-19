import {HttpException, Injectable, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from '../../../entity/entities/Board';
import { BoardArticles} from "../../../entity/entities/BoardArticles";
import {bufferToString, FROM_UNIXTIME, FROM_UNIXTIME2} from "../../util/common";
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
            let board = await this.boardRepository
                .createQueryBuilder('board')
                .select('*')
                .where('board.idx = :type', {type: type})
                .getRawMany();
            if(board){
                board = bufferToString(board);
            }
            let data = await this.boardArticlesRepository
                .createQueryBuilder('boardArticles')
                .select('*')
                // .addSelect(`(${FROM_UNIXTIME('regdate')})`, 'regdate')
                .addSelect(`(${FROM_UNIXTIME2('regdate')})`, 'regdate')
                .where('boardArticles.boardIdx = :type', {type: type})
                //memberType 0, 1 포함
                .andWhere('boardArticles.memberType IN (0, 1)')
                .orderBy('boardArticles.idx', 'DESC')
                .offset(take * (page - 1))
                .limit(take)
                .getRawMany();
            if(data){
                data = bufferToString(data);
            }
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

            return result;
        }catch (error) {
            console.log("=>(board_model.service.ts:61) error", error);
            throw new HttpException(error, 500)
        }
    }
}
