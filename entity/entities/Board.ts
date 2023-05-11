import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {BoardArticles} from "./BoardArticles";

@Entity("board", {schema: "wairi"})
export class Board {
    @PrimaryGeneratedColumn({type: "int", name: "idx"})
    idx: number;

    @Column("varchar", {name: "name", length: 50})
    name: string;

    @Column("varchar", {name: "id", length: 30})
    id: string;

    @OneToMany(() => BoardArticles, (boardArticles) => boardArticles.board)
    boardArticles: BoardArticles[];
}
