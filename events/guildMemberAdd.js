module.exports = {
name: "guildMemberAdd",
async execute(client, member, guild) {

 const joinrole = member.guild.roles.cache.find(role => role.id =="901947393870807071")
 
 await member.roles.add(joinrole.id)
}}