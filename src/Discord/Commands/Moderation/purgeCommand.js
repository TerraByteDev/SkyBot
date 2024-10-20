const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js")
const config = require("../../../config.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("purge")
        .setDescription("Purge a specified amount of messages provided.")
        .addIntegerOption((option) => option
            .setName("count")
            .setDescription("Amount of messages to purge.")
            .setMinValue(1)
            .setMaxValue(100)
            .setRequired(true)
        )
        .addUserOption((option) => option
            .setName("user")
            .setDescription("Specify a user who's messages should be deleted.")
        ),

    userPermissions: [PermissionFlagsBits.ManageMessages],
    botPermissions: [PermissionFlagsBits.ManageMessages],

    run: async (client, interaction) => {
        const { channel, options } = interaction;
        let count = options.getInteger("count");
        const usr = options.getUser("user");
        const isMultipleMessages = count === 1 ? "message" : "messages"

        if (!count || count < 1 || count > 100) {
            return await interaction.reply({ content: `\`❌\` Specify a purge count between 1 and 100!` })
        }

        try {
            const auditChannel = client.channels.cache.get(config.auditChannelID)
            const chMessages = await channel.messages.fetch();

            if (chMessages.size === 0) return await interaction.reply({ content: `\`❌\` This channel is empty!` })

            if (count > chMessages.size) count = chMessages.size;

            const auditEmbed = new EmbedBuilder()
                .setTitle("Channel Purged")
                .setColor(config.warningColor)
                .setTimestamp()

            await interaction.deferReply();
            let toDelete = [];

            if (usr) {
                let i = 0;
                chMessages.forEach((m) => {
                    if (m.author.id === usr.id && toDelete.length < count) {
                        toDelete.push(m);
                        i++;
                    }
                });

                auditEmbed.setDescription(
                    `> Moderator: ${interaction.user.username}\n` +
                    `> Messages Deleted: **${toDelete.length}**\n` +
                    `> User Affected: <@${usr.id}> [${usr.username}]`
                )

                await interaction.editReply({ content: `\`✅\` Successfully purged **${toDelete.length}** ${isMultipleMessages} from member \`${usr.username}\` in ${channel}.`})
            } else {
                toDelete = chMessages.first(count);

                auditEmbed.setDescription(
                    `> Moderator: ${interaction.user.username}\n` +
                    `> Messages Deleted: **${toDelete.length}**\n`
                )

                await interaction.editReply({ content: `\`✅\` Successfully purged **${toDelete.length}** ${isMultipleMessages} in ${channel}.`})
            }

            if (toDelete.length > 0) {
                await channel.bulkDelete(toDelete, true);
            }

            if (auditChannel) {
                auditChannel.send({ embeds: [auditEmbed] })
            }
        } catch (error) {
            console.log(error)
        }
    }
}