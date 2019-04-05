const { stringify } = require('querystring');
const fetch = require('node-fetch');
const moment = require('moment');
const { RichEmbed } = require('discord.js')

exports.run = async (client, message) => {
    try {
        const { apikey, endpoint } = client.config.lastFM;
        const Users = client.sequelize.import(`../models/Users.js`);
        const user = await Users.findOne({
            where: {
                discordUserID: message.author.id
            }
        });

        if (!user) {
            return message.reply(client.replies.noLogin);
        }

        // Get timestamp from database and attempt to get
        // the time difference from then and now
        var timestamp = user.get('lastDailyTimestamp');
        var diff = (timestamp !== null) ? moment(timestamp).diff(moment(), 'hours') : 0;

        // Either there's no timestamp, or the difference is < 0
        // so we want to re-calculate the daily
        if (timestamp === null || diff < 0) {
            // Null timestamp, so we'll just get the last 24 hours
            // worth of scrobbles
            if (timestamp === null) {
                timestamp = moment().subtract(1, 'days');
            }

            const lUsername = user.get(`lastFMUsername`);
            const params = {
                method: `user.getrecenttracks`,
                user: lUsername,
                from: timestamp.utc().unix(),
                api_key: apikey,
                format: `json`
            };
            const query = stringify(params);
            const data = await fetch(endpoint + query).then(r => r.json());

            // Add new timestamp and play count to database
            await Users.update({
                lastDailyTimestamp: moment().add(1, 'days').utc().toString(),
                dailyPlayCount: data.recenttracks['@attr'].total,
            }, {
                where: {
                    discordUserID: message.author.id
                }
            });

            // build and send embed
            const embed = new RichEmbed()
                .setColor('#00ff00')
                .setTitle('Daily')
                .setDescription(`You have scrobbled **${data.recenttracks['@attr'].total}** tracks today!`);

            return message.channel.send(embed);
        } else {
            // Time difference is still too high, don't bother
            // calculating daily, just let the user know
            const embed = new RichEmbed()
                .setColor('#ff0000')
                .setTitle('Daily')
                .setDescription(`**${user.get('dailyPlayCount')}** plays last recorded. Please return in ${diff} hour(s) to get new daily score`);

            return message.channel.send(embed);
        }
    } catch (ex) {
        console.error(ex);
        await message.channel.send(client.replies.error);
    }
}

exports.help = {
    name: 'daily',
    description: 'Gets the total number of scrobbles in the last 24 hours',
    usage: 'daily'
}
