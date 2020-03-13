import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import NowPlayingMode from "../enums/NowPlayingMode";

@Entity()
export class GuildModes extends BaseEntity {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    discordID!: string;

    @Column()
    nowPlayingMode!: NowPlayingMode;

}