require("colors");
require("dotenv/config")

const mongoose = require("mongoose");
const mongoURI = process.env.MONGODB_TOKEN;

module.exports = async (client) => {
    console.log(`[SkyBot Init] `.green + `${client.user.username}`.yellow + ` is online.`.blue);

    if (!mongoURI) return;
    mongoose.set("strictQuery", true);

    if (await mongoose.connect(mongoURI)) {
        console.log(`[SkyBot Database] `.green + `Connected to the MongoDB Database.`.yellow);
    }
}