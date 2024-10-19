const colorize = require("colorize")
const knex = require("knex")({
    client: "sqlite3",
    connection: {
        filename: "./data.db",
    },
    useNullAsDefault: true
})

module.exports = async (client, interaction) => {
    try {
        const { user } = interaction;
        await interaction.deferReply({ ephemeral: true })

        const res = await knex("turnoffpings").select().where("id", "=", user.id).first()
        if (res) {
            await knex("turnoffpings").del({ id: user.id })
            return await interaction.editReply({ content: `\`✅\` You will now receive levelup pings.`})
        } else {
            await knex("turnoffpings").insert({ id: user.id });
            return await interaction.editReply({ content: `\`✅\` You will no longer receive levelup pings.`})
        }
    } catch (error) {
        console.log(colorize.ansify(`#red[An unexpected error occurred when processing the levels leaderboard: \n${error}]`))
        return await interaction.reply({ content: `\`❌\` Oops! Something went wrong. Please try again later.`})
    }
}
