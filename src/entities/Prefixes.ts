import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

@Entity(`prefixes`)
export class Prefixes extends BaseEntity {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    guildID!: string;

    @Column({ type: `varchar`, length: 2 })
    prefix!: string;

}