import { ShardingManager, Shard } from "discord.js";
import config from "../config.json";
import * as path from "path";

const dir = path.join(__dirname, `bot.js`);

const manager: ShardingManager = new ShardingManager(dir, {
    token: config.token
});

manager.spawn();
manager.on(`launch`, (shard: Shard) => console.log(`Launched shard ${shard.id}`));