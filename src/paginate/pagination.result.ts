export interface PaginationResult<PaginationEntity> {
    data: PaginationEntity[];
    total: number;
    dataPerPage?: number;
    totalPage?: number;
    next?: number;
    previous?: number;
    currentPage?: number;
}