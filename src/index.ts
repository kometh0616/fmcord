import { ShardingManager } from "discord.js";
import config from "../config.json";
import * as path from "path";

const dir = path.join(__dirname, `bot.js`);

const manager = new ShardingManager(dir, {
    token: config.token
});

manager.spawn();
manager.on(`shardCreate`, shard => console.log(`Launched shard ${shard.id}`));