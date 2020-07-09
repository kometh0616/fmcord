import { ClientOptions, CommandClientOptions } from "eris";
import config from "./config";
import FMcord, { FMcordOptions } from "./handler/FMcord";
import snippets from "./snippets";
import canvas from "canvas";
import * as path from "path";
import StartTyping from "./hooks/StartTyping";

const options: ClientOptions = {
    disableEvents: {
        callCreate: true,
        callDelete: true,
        callRing: true,
        callUpdate: true,
        channelCreate: true,
        channelDelete: true,
        channelPinUpdate: true,
        channelRecipientAdd: true,
        channelRecipientRemove: true,
        channelUpdate: true,
        friendSuggestionCreate: true,
        friendSuggestionDelete: true,
        guildBanAdd: true,
        guildBanRemove: true,
        guildEmojisUpdate: true,
        guildMemberAdd: true,
        guildMemberChunk: true,
        guildMemberRemove: true,
        guildMemberUpdate: true,
        guildRoleCreate: true,
        guildRoleDelete: true,
        guildRoleUpdate: true,
        guildUnavailable: true,
        guildUpdate: true,
        messageDelete: true,
        messageDeleteBulk: true,
        messageReactionRemoveAll: true,
        messageUpdate: true,
        presenceUpdate: true,
        relationshipAdd: true,
        relationshipRemove: true,
        relationshipUpdate: true,
        shardDisconnect: true,
        shardPreReady: true,
        shardReady: true,
        shardResume: true,
        typingStart: true,
        unknown: true,
        userUpdate: true,
        voiceChannelJoin: true,
        voiceChannelLeave: true,
        voiceChannelSwitch: true,
        voiceStateUpdate: true,
        webhooksUpdate: true,
    },
};

const commandOptions: CommandClientOptions = {
    prefix: config.prefix,
    defaultHelpCommand: false,
    name: `FMcord`,
    defaultCommandOptions: {
        caseInsensitive: true,
        errorMessage: snippets.error,
        hooks: {
            preCommand: StartTyping
        }
    }
};

const botOptions: FMcordOptions = {
    apikeys: {
        lastFM: config.lastFM.apikey,
        youtube: config.youtube.apikey,
        spotify: {
            id: config.spotify.id,
            secret: config.spotify.secret
        },
    },
    ownerID: config.ownerID
};

const bot = new FMcord(config.token, options, commandOptions, botOptions);

if (process.platform === `win32`) {
    canvas.registerFont(path.join(__dirname, `..`, `fonts`, `Inconsolata.otf`), {
        family: `inconsolata`
    });
} else {
    canvas.registerFont(path.join(__dirname, `..`, `fonts`, `NotoSansCJK-Regular.ttc`), {
        family: `noto-sans`
    });
}

bot.init();