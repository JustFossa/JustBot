const mongoose = require("mongoose")
const devModel = require("../models/dev")
const memberModel = require("../models/memberCounter.js")
module.exports = {
    name: "ready",
    once: true,
    async execute(client) {

      mongoose.connect(process.env.MONGO_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true

      }).then(console.log("[INFO]:  Connected To MongoDB!"))

const data = await devModel.findOne({
    _id: 1,
    status: true
})


  if(data) {
    console.log("[INFO]: Bot is Running in maintanance mode")
  }

        const statusOptions = [
            `with ${client.guilds.cache.size} Servers`,
            `JustFossa.tech`,
            `/help for help`
          
          ]
          let counter = 0

        async function statusChanger() {
          const data1 = await devModel.findOne({
            _id: 1,
            status: true
          })
          if(!data1) {
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
          } else {
            client.user.setPresence({
              status: 'dnd',
              
              activities: [
                {
                  name: 'Undergoing Maintanance'
                }
              ]
            })

            setTimeout(statusChanger, 1000 * 10)
          }
            
          }
          
          statusChanger()
    
                
}
}