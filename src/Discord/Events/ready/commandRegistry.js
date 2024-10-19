require("colors");
require("dotenv/config")

const commandsUtility = require("../../util/commandsUtility");
const SQLiteHandler = require("../../../Utility/db/DBHandler");

module.exports = async (client) => {
    try {
        await SQLiteHandler.start();

        const locCommands = commandsUtility.getLocalCommands();
        const appCommands = await commandsUtility.getCommands(client, process.env.GUILD_ID);

        for (const command of locCommands) {
            const { data } = command;

            const commandName = data.name;
            const commandDesc = data.description;
            const commandOptions = data.options;

            const exCommand = await appCommands.cache.find((command) => command.name === commandName);

            if (exCommand) {
                if (command.deleted) {
                    await appCommands.delete(exCommand.id);
                    console.log(`[SkyBot] `.green + "Deleted application command [".red + `${commandName}`.yellow + `].`.red);

                    continue;
                }

                if (commandsUtility.compareCommands(exCommand, command)) {
                    await appCommands.edit(exCommand.id, { name: commandName, description: commandDesc, options: commandOptions });

                    console.log(`[SkyBot] `.green + "Edited application command [".gray + `${commandName}`.yellow + `].`.gray);
                }
            } else {
                if (command.deleted) {
                    continue;
                }

                await appCommands.create({ name: commandName, description: commandDesc, options: commandOptions });

                console.log("[SkyBot] ".green + `Registered application command [`.yellow + `${commandName}`.green + `].`.yellow);
            }
        }
    } catch (err) {
        console.log("[SkyBot] ".green + `An unexpected occurred when registering commands: ${err}`.red);
    }
}