import { Entity, Index, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

@Entity(`disables`)
@Index([`discordID`, `cmdName`], { unique: true })
export class Disables extends BaseEntity {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: false })
    discordID!: string;

    @Column({ nullable: false })
    cmdName!: string;
    
}