import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { Snowflake } from "discord.js";
import NowPlayingMode from "../enums/NowPlayingMode";

@Entity()
export class GuildModes extends BaseEntity {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    discordID!: Snowflake;

    @Column()
    nowPlayingMode!: NowPlayingMode;

}