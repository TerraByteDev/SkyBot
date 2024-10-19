const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, time, TimestampStyles } = require("discord.js")
const { addTempBanEntry } = require("../../../Utility/db/DBHandler");
const ms = require("ms")
const config = require("../../../config.json")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Ban someone from the server.")
        .addUserOption((o) => o
            .setName("member")
            .setDescription("Member to ban.")
            .setRequired(true)
        )
        .addStringOption((o) => o
            .setName("duration")
            .setDescription("Duration for ban (Blank for perma). Format: 1h = 1hour, 1d = 1day, etc")
        )
        .addStringOption((o) => o
            .setName("reason")
            .setDescription("Reason for ban.")
        )
        .toJSON(),

    userPermissions: [PermissionFlagsBits.BanMembers, PermissionFlagsBits.KickMembers],
    botPermissions: [PermissionFlagsBits.BanMembers, PermissionFlagsBits.KickMembers, PermissionFlagsBits.SendMessages],

    run: async (client, interaction) => {
        await interaction.deferReply();

        const optionsusr = interaction.options.getUser("member");
        const usr = await interaction.guild.members.fetch(optionsusr);

        if (usr.id === interaction.member.id) {
            return await interaction.editReply({ content: `\`❌\` You cannot ban yourself!`})
        } else if (usr.roles.highest.position >= interaction.member.roles.highest.position) {
            return await interaction.editReply({ content: `\`❌\` You cannot ban that member.`})
        }

        const reason = interaction.options.getString("reason") ?? "No reason provided"
        const duration = interaction.options.getString("duration")
        if (duration) {
            let formatted;
            try {
                formatted = ms(duration)
            } catch (error) {
                console.log(error)
                return await interaction.editReply({ content: `\`❌\` You must specify a correct duration (e.g. '1d' = 1 day).` })
            }

            if (isNaN(formatted)) {
                return await interaction.editReply({ content: `\`❌\` You must specify a correct duration (e.g. '1d' = 1 day).`})
            }

            interaction.guild.members.ban(usr)
            await addTempBanEntry(client, usr.id, usr.user.username, reason, interaction.user.username, interaction.guild.id, Date.now(), (Date.now() + formatted))

            const future = new Date(Date.now() + formatted);
            await interaction.editReply({ content: `\`✅\` Temporarily banned **${usr.user.username}** with reason *${reason}*. (Unban in ${time(future, TimestampStyles.RelativeTime)})` })
        } else {
            const auditChannel = client.channels.cache.get(config.auditChannelID)

            interaction.guild.members.ban(usr)
            await interaction.editReply({ content: `\`✅\` Permanently banned **${usr.user.username}** with reason *${reason}*.` })

            const embed = new EmbedBuilder()
                .setTitle("Permanent Ban")
                .setColor("Red")
                .setDescription(
                    `> User: ${usr.user.username} | <@${usr.id}>\n` +
                    `> Reason: ${reason}\n` +
                    `> Moderator: ${interaction.user.username}`
                )
                .setTimestamp()

            if (auditChannel) {
                auditChannel.send({ embeds: [embed] })
            }
        }
    }
}