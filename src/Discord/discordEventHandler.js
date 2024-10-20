const getFiles = require("../Utility/files/filesUtility");

module.exports = (client) => {
    const folders = getFiles(__dirname + "/Events", true);

    for (const folder of folders) {
        const files = getFiles(folder);
        let name;
        name = folder.replace(/\\/g, "/").split("/").pop();

        client.on(name, async (...arg) => {
            
            for (const file of files) {
                const eventFunction = require(file);
                await eventFunction(client, ...arg);
            };
        });
    };
};