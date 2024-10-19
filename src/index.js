require("colors")
require("dotenv/config")
const { GatewayIntentBits, Client } = require("discord.js")
const eventHandler = require("./Discord/discordEventHandler")

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ]
})

console.log(`[SkyBot] `.green + "Initialising Discord Bot...".grey);

eventHandler(client);
client.login(process.env.TOKEN)

console.log(`[SkyBot] `.green + `Discord Bot initialised.`)