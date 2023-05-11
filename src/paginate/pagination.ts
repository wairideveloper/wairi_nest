import {PaginationResult} from './pagination.result';

export class Pagination<PaginationEntity> {
    public data: PaginationEntity[];
    public dataPerPage: number;
    public totalPage: number;
    public total: number;
    public next: number;
    public previous: number;
    public currentPage: number;

    constructor(paginationResult: PaginationResult<PaginationEntity>) {
        this.data = paginationResult.data;
        this.dataPerPage = paginationResult.data.length;
        this.totalPage = Math.ceil(paginationResult.total / paginationResult.data.length);
        this.total = paginationResult.total;
        this.next = parseInt(String(paginationResult.currentPage)) === paginationResult.totalPage ?
            paginationResult.totalPage : parseInt(String(paginationResult.currentPage)) + 1;
        this.previous = parseInt(String(paginationResult.currentPage)) === 1 ? 1 : paginationResult.currentPage - 1;
        this.currentPage = parseInt(String(paginationResult.currentPage));
    }
}