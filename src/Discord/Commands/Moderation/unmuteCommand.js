const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, time, TimestampStyles } = require("discord.js")
const config = require("../../../config.json")
const ms = require("ms")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unmute")
        .setDescription("Remove a timeout / mute from someone.")
        .addUserOption((o) => o
            .setName("member")
            .setDescription("Member to unmute.")
            .setRequired(true)
        )
        .addStringOption((o) => o
            .setName("reason")
            .setDescription("Reason for the kick.")
        )
        .toJSON(),

    userPermissions: [PermissionFlagsBits.MuteMembers],
    botPermissions: [PermissionFlagsBits.MuteMembers, PermissionFlagsBits.SendMessages],

    run: async (client, interaction) => {
        try {
            await interaction.deferReply();

            const optionsusr = interaction.options.getUser("member");
            const usr = await interaction.guild.members.fetch(optionsusr);
        
            const reason = interaction.options.getString("reason") ?? "No reason provided"
            const auditChannel = client.channels.cache.get(config.auditChannelID)
    
            const embed = new EmbedBuilder()
                .setTitle("User Unmuted")
                embed.setDescription(
                    `> User: ${usr.user.username} | <@${usr.id}>\n` +
                    `> Reason: ${reason}\n` +
                    `> Moderator: ${interaction.user.username}`
                )
                .setColor("Green")
                .setTimestamp()
    
            usr.timeout(null)
            await interaction.editReply({ content: `\`✅\` Unmuted **${usr.user.username}** with reason *${reason}*.` })
    
            if (auditChannel) {
                auditChannel.send({ embeds: [embed] })
            }
        } catch (e) {
            await interaction.editReply({ content: `\`❌\` That user is not muted!`})
        }
    }
}