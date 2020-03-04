import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne } from "typeorm";
import { Users } from "./Users";
import NowPlayingMode from "../enums/NowPlayingMode";

@Entity()
export class Modes extends BaseEntity {

    @PrimaryGeneratedColumn()
    id!: number;

    @OneToOne(() => Users)
    @JoinColumn()
    user!: Users;
    
    @Column()
    nowPlayingMode!: NowPlayingMode;

}