const mongoose = require("mongoose")

module.exports = {
    name: "ready",
    once: true,
    execute(client) {

      mongoose.connect(process.env.MONGO_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true

      }).then(console.log("Connected To MongoDB!"))



        const statusOptions = [
            `with ${client.guilds.cache.size} Servers`,
            `Coded by フォサー#0069`,
            `/help for help`
          
          ]
          let counter = 0

        function statusChanger() {
            client.user.setPresence({
              status: 'dnd',
              
              activities: [
                {
                  name: statusOptions[counter]
                }
              ]
            })
          
            if (++counter >= statusOptions.length) {
              counter = 0
            }
          
            setTimeout(statusChanger, 1000 * 10)
          }
          
          statusChanger()
    }
                
}