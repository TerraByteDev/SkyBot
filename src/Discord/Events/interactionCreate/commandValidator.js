require("colors");

const { EmbedBuilder } = require("discord.js");
const config = require("../../../config.json");
const commandsUtility = require("../../util/commandsUtility");

module.exports = async (client, interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const locCommands = commandsUtility.getLocalCommands();

    try {
        const obj = locCommands.find((command) => command.data.name === interaction.commandName);
        if (!obj) return;

        if (obj.userPermissions?.length) {
            for (const permission of obj.userPermissions) {
                if (interaction.member.permissions.has(permission)) continue;

                const embed = new EmbedBuilder()
                    .setColor(config.errorColor)
                    .setDescription(config.noPermissions)
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }

        if (obj.botPermissions?.length) {
            for (const permission of obj.userPermissions) {
                const bot = interaction.guild.members.me;
                if (bot.permissions.has(permission)) continue;

                const embed = new EmbedBuilder()
                    .setColor(config.errorColor)
                    .setDescription(config.botNoPermissions)
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }

        await obj.run(client, interaction);
    } catch (error) {        
        console.log(`[SkyBot] `.green + `An unexpected error occured when validating commands: \n${error}`.red);
    }
}