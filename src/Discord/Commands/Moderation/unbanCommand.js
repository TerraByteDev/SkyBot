const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require("discord.js")
const { removeTempBan } = require("../../../Utility/db/DBHandler");
const config = require("../../../config.json")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unban")
        .setDescription("Unban someone.")
        .addUserOption((o) => o
            .setName("member")
            .setDescription("Member to unban (ID of user)")
            .setRequired(true)
        )
        .addStringOption((o) => o
            .setName("reason")
            .setDescription("Reason for the unban.")
        )
        .toJSON(),

    userPermissions: [PermissionFlagsBits.BanMembers, PermissionFlagsBits.KickMembers],
    botPermissions: [PermissionFlagsBits.BanMembers, PermissionFlagsBits.KickMembers, PermissionFlagsBits.SendMessages],

    run: async (client, interaction) => {
        await interaction.deferReply();

        const usr = interaction.options.getUser("member");
        const reason = interaction.options.getString("reason") ?? "No reason provided"

        await interaction.guild.bans.fetch().then(async (bans) => {
            if (bans.size == 0) return await interaction.editReply({ content: `\`❌\` There are no bans on this server!` })
            let bannedID = bans.find((ban) => ban.user.id == usr.id);
            if (!bannedID) return await interaction.editReply({ content: `\`❌\` This user is not banned from this server.` })

            await removeTempBan(usr.id)
            await interaction.guild.bans.remove(usr, reason).catch((err) => {
                console.log(err)
                return interaction.editReply({ content: `\`❌\` Failed to unban user.` })
            })
            await interaction.editReply({ content: `\`✅\` Unbanned **${usr.id}** with reason *${reason}*.` })

            const auditChannel = client.channels.cache.get(config.auditChannelID)

            const embed = new EmbedBuilder()
                .setTitle("Unban")
                .setColor("Green")
                .setDescription(
                    `> User: ${usr.username} | <@${usr.id}>\n` +
                    `> Reason: ${reason}\n` +
                    `> Moderator: ${interaction.user.username}`
                )
                .setTimestamp()

            if (auditChannel) {
                auditChannel.send({ embeds: [embed] })
            }
        })
    }
}