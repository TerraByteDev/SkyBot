const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("level")
        .setDescription("All commands related to the level system.")
        .addSubcommand((subcommand) => subcommand
            .setName("rank")
            .setDescription("Get the XP rank of yourself or another user.")
            .addUserOption((user) => user
                .setName("member")
                .setDescription("The user to get the rank of. Leaving this blank fetches your own rank.")
            )
        )
        .addSubcommand((subcommand) => subcommand
            .setName("leaderboard")
            .setDescription("View the levels leaderboard.")
            .addNumberOption((option) => option
                .setName("page")
                .setDescription("Page of leaderboard.")
                .setMinValue(0)
                .setRequired(false)
            )
        )
        .addSubcommand((subcommand) => subcommand
            .setName("toggle")
            .setDescription("Toggle being pinged in level up messages..")
        )
        .toJSON(),
    
    userPermissions: [],
    botPermissions: [ PermissionFlagsBits.AttachFiles ],
    
    run: async (client, interaction) => {
        const sub = interaction.options.getSubcommand();
        const requiredSubcommand = require(`../../Subcommands/Levelling/${sub}`);
        await requiredSubcommand(client, interaction);
    }
}