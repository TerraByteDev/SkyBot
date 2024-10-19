const { EmbedBuilder, time, TimestampStyles } = require("discord.js");
const knex = require("knex")({
    client: "sqlite3",
    connection: {
        filename: "./data.db",
    },
    useNullAsDefault: true
})
var colorize = require("colorize")
const config = require("../../config.json");

async function loopBans(client) {
    try {
        const result = await knex("tempbans").select();

        result.forEach(async (row) => {
            if (Date.now() >= row.unbanTime) {
                console.log(colorize.ansify(`#grey[Unbanning User ] #yellow[${row.id}] #grey[.]`))

                const guild = client.guilds.cache.get(row.serverID);
                const auditChannel = client.channels.cache.get(getConfig().Moderation.auditChannelID)
                if (guild && auditChannel) {
                    let id = row.id;
                    await knex('tempbans').del({ id });

                    guild.members.fetch(row.id).then((member) => {
                        guild.members.unban(member);

                        console.log(colorize.ansify(`#green[Unbanned User ] #yellow[${row.id}] #grey[.]`))

                        let embed = new EmbedBuilder()
                            .setTitle("Unban")
                            .setColor("Green")
                            .setDescription(
                                `> User: ${row.name} | <@${row.id}>\n` +
                                `> Reason: ${row.reason}\n` +
                                `> Moderator: ${row.moderatorName}`
                            )
                            .setTimestamp()

                        auditChannel.send({ embeds: [embed] })
                    })


                } else {
                    console.log(colorize.ansify(`#red[Failed to find guild in client cache of ID] #yellow[${row.serverID}] #red[.]`))
                }
            }
        })
    } catch (e) {
        console.log(colorize.ansify(`#red[An unexpected error occurred when looping through tempbans: \n${e}]`))
    }
}

async function removeTempBan(id) {
    try {
        const count = await knex('tempbans')
            .where({ id })
            .count();

        if (parseInt(count[0]['count(*)']) > 0) {
            console.log(colorize.ansify(`#grey[Removing temporary ban entry for] #yellow[${id}] #grey[.]`))
        }
    } catch (error) {
        console.log(error)
    }
}

async function addTempBanEntry(client, id, name, reason, moderatorName, serverID, banTime, futureTime) {
    await knex("tempbans").insert({ id: id, name: name, reason: reason, moderatorName: moderatorName, serverID: serverID, banTime: banTime, unbanTime: futureTime })

    const auditChannel = client.channels.cache.get(getConfig().Moderation.auditChannelID)
    let unbanDate = new Date(futureTime);
    const embed = new EmbedBuilder()
        .setTitle("Ban")
        .setColor("Red")
        .setDescription(
            `> User: ${name} | <@${id}>\n` +
            `> Reason: ${reason}\n` +
            `> Moderator: ${moderatorName}\n` +
            `> Unban in: ${time(unbanDate, TimestampStyles.RelativeTime)}`
        )
        .setTimestamp()

    if (auditChannel) {
        auditChannel.send({ embeds: [embed] })
    }
}

async function start(client) {
    try {
        console.log(colorize.ansify(`#blue[Initialising SQLite System...]`))

        await knex.schema.hasTable("tempbans").then(async function (exists) {
            if (!exists) {
                await knex.schema
                    .createTable("tempbans", (table) => {
                        table.string("id").unique()
                        table.string("name")
                        table.string("reason")
                        table.string("moderatorName")
                        table.string("serverID")
                        table.integer("banTime")
                        table.integer("unbanTime")
                    })

            }
        })

        await knex.schema.hasTable("levels").then(async function (exists) {
            if (!exists) {
                await knex.schema
                    .createTable("levels", (table) => {
                        table.string("id").unique()
                        table.string("user")
                        table.string("guild")
                        table.integer("xp")
                        table.integer("level")
                        table.integer("totalXP")
                        table.string("tag")
                    })
            }
        })

        await knex.schema.hasTable("roles").then(async function (exists) {
            if (!exists) {
                await knex.schema
                    .createTable("roles", (table) => {
                        table.string("guildID")
                        table.string("roleID")
                        table.integer("level").unique()
                    })
            }
        })

        await knex.schema.hasTable("blacklistTable").then(async function (exists) {
            if (!exists) {
                await knex.schema
                    .createTable("blacklistTable", (table) => {
                        table.string("guild")
                        table.string("typeId")
                        table.string("type")
                        table.string("id").unique()
                    })
            }
        })

        await knex.schema.hasTable("settings").then(async function (exists) {
            if (!exists) {
                await knex.schema
                    .createTable("settings", (table) => {
                        table.string("guild").unique()
                        table.string("levelUpMessage")
                        table.integer("customXP")
                        table.integer("customCooldown")
                    })
            }
        })

        await knex.schema.hasTable("rankCardTable").then(async function (exists) {
            if (!exists) {
                await knex.schema
                    .createTable("rankCardTable", (table) => {
                        table.string("id").unique()
                        table.string("user")
                        table.string("guild")
                        table.string("textColor")
                        table.string("barColor")
                        table.string("backgroundColor")
                    })
            }
        })

        await knex.schema.hasTable("turnoffpings").then(async function (exists) {
            if (!exists) {
                await knex.schema
                    .createTable("turnoffpings", (table) => {
                        table.string("id").unique()
                    })
            }
        })

        timer = setInterval(async () => {
            await loopBans(client);
        }, 10000);
    } catch (e) {
        console.log(e)
    }
}

module.exports = { loopBans, removeTempBan, start, addTempBanEntry }