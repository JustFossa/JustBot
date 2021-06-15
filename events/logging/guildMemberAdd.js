const img = require('../../helpers/w-attachment');
const Discord = require('discord.js');

function convertText(text, member) {
	text = text.replace(/{user}/, `${member}`);
	text = text.replace(/{server}/, `${member.guild.name}`);
	text = text.replace(/{count}/, `#${member.guild.memberCount}`);
	return text;
}

function checkOk(settings, active, channel) {
	if (!settings) {
		return false;
	} else if (!settings.welcome || !settings.welcome.join) {
		return false;
	} else if (active === false || !active || active === null) {
		return false;
	} else if (channel === null || !channel) {
		return false;
	}

	return true;
}

async function send(type, text, channel, member) {
	switch (type) {
		case 'text':
			return channel.send(text);
		case 'embed':
			text = text.length > 2048 ? text.slice(0, 2048) : text;
			return channel.send({
				embed: {
					color: global.config.color,
					title: 'Member Joined!',
					description: text,
					timestamp: new Date(),
					thumbnail: {
						url: member.user.displayAvatarURL()
					}
				}
			});
		case 'image':
			/* eslint-disable no-case-declarations */
			const image = await img.welcomeimage(member);
			const attachment = new Discord.MessageAttachment(image, 'join.png');
			return channel.send(text, attachment);
	}

	return channel.send(text);
}

function getInvite(client, member, inviter_, settings) {
	const invites = client.utils.invites;
	member.guild.fetchInvites().then(guildInvites => {
		const ei = invites[member.guild.id];
		if (!ei) return;
		invites[member.guild.id] = guildInvites;
		// Look through the invites, find the one for which the uses went up.
		const invite = guildInvites.find(i => !ei.get(i.code) || ei.get(i.code).uses < i.uses);
		if (!invite) return;
		// This is just to simplify the message being sent below (inviter doesn't have a tag property)
		const inviter = client.users.resolve(invite.inviter.id); // how is this even working? redeclaring a variable? wtf?
		if (!inviter) return;
		// Get the log channel (change to your liking)
		const logChannel = member.guild.channels.cache.find(c => c.id === settings.welcome.inviter.channel);
		if (logChannel) {
			if (member.guild.me?.permissionsIn(logChannel?.id).has(['SEND_MESSAGES', 'EMBED_LINKS'])) {
				return logChannel.send({
					embed: {
						color: global.config.color,
						title: '**Member joined**',
						description: `<:members:717436253364289667> Member:\n\`${member.user.tag}\`\n\n` +
							`<:invite:717436253871538318> Inviter:\n\`${inviter.tag}\`\n\n` +
							`<:pin:717436253728931840> Times used:\n\`${invite.uses}\`\n\n` +
							`<:timer:717436253762486302> Invite created on:\n\`${invite.createdAt ? invite.createdAt.toDateString() : 'None'}\``
					}
				});
			}
		}
	});
	return null;
}

module.exports = async (client, member) => {
	if (member.user.bot && member.guild.me?.permissions.has('VIEW_AUDIT_LOG')) {
		const auditLog = (await member.guild.fetchAuditLogs({
			type: 'BOT_ADD',
			limit: 1
		})).entries.first();

		await member.guild.log({
			embeds: [{
				title: '**Bot added:**',
				description: '**Actioned by:**\n' +
					`\`${auditLog.executor.tag}\`\n\n` +
					'**Bot name:**\n' +
					`\`${member.user.tag}\``,
				color: global.color
			}]
		}).catch(() => null);
	}

	const settingsManager = client.utils.settings;
	const settings = await settingsManager.fetch(member.guild.id);

	const autorole = settings.welcome?.join?.autorole;
	if (autorole && member.guild.me?.permissions.has('MANAGE_ROLES')) {
		const role = member.guild.roles.cache.find(r => r.id === autorole);
		if (role && member.guild.me?.roles.highest.position > role.position) {
			try {
				await member.roles.add(role.id);
			} catch (err) {
				console.log(err);
			}
		}
	}

	if (!settings?.welcome) return;
	const inviter = settings.welcome?.inviter?.active;
	const active = settings.welcome?.join?.active;
	const channel = member.guild.channels.cache.get(settings.welcome?.join?.channel);

	if (checkOk(settings, active, channel) === false) return;

	let text = settings.welcome.join.text;
	if (!text) text = 'Welcome to {server}, {user}!';
	text = convertText(text, member);

	if (settings.welcome.join.DM === true) {
		let dm = settings.welcome.join.DMtext;
		if (dm) {
			dm = dm.length > 2048 ? dm.slice(0, 2048) : dm;
			dm = convertText(dm, member);
			try {
				await member.send([
					dm,
					'',
					`~ sent from **${member.guild.name}**`
				]);
			} catch {}
		}
	}

	const type = settings.welcome?.join?.type;
	if (member.guild.me?.permissionsIn(channel.id).has(['SEND_MESSAGES', 'EMBED_LINKS'])) {
		await send(type, text, channel, member);
	}

	if (inviter === true) {
		getInvite(client, member, inviter, settings);
	}
};
