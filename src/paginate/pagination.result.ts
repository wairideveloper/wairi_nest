export interface PaginationResult<PaginationEntity> {
    data: PaginationEntity[];
    products?: PaginationEntity[];
    total: number;
    dataPerPage?: number;
    totalPage?: number;
    next?: number;
    previous?: number;
    currentPage?: number;
}
