/* eslint-disable brace-style */
/* eslint-disable comma-dangle */
const qs = require('querystring');
const https = require('https');
const { parse } = require('url');

class Client {
	constructor(option = {}) {
		this.token = option.token;
		this.baseURL = 'https://api.clashroyale.com/v1';
	}

	async fetch(reqURL, { token = this.token, timeout = this.timeout } = {}) {
		return new Promise((resolve, reject) => {
			const response = {
				raw: '',
				status: null,
				headers: null
			};

			const { hostname, path } = parse(reqURL);
			const options = {
				hostname,
				path,
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				timeout: typeof timeout === 'number' ? timeout : 0
			};

			const request = https.request(options, res => {
				response.status = res.statusCode;
				response.headers = res.headers;
				response.ok = res.statusCode === 200;

				res.on('data', chunk => {
					response.raw += chunk;
				});

				res.on('end', () => {
					if (res.headers['content-type'] && res.headers['content-type'].includes('application/json')) {
						try {
							const parsed = JSON.parse(response.raw);
							resolve(Object.assign(parsed, {
								status: response.status,
								ok: response.ok,
								maxAge: Math.floor(response.headers['cache-control'].split('=')[1])
							}));
						} catch (e) {
							reject(new Error(500));
						}
					} else {
						reject(new Error(500));
					}
				});
			});

			request.on('error', () => {
				reject(new Error(500));
			});

			request.on('timeout', () => {
				reject(new Error(504));
				request.destroy();
			});

			request.end();
		});
	}

	static tag(tag) {
		if (tag && typeof tag === 'string') {
			return encodeURIComponent(`#${tag.toUpperCase().replace(/O|o/g, '0').replace(/^#/g, '')}`);
		}
		throw TypeError(`The "tag" argument must be of type string. Received type ${typeof tag === 'string' ? 'empty string' : typeof tag}.`);
	}

	async clans(clan) {
		if (typeof clan === 'string') return this.fetch(`${this.baseURL}/clans?name=${encodeURIComponent(clan)}`);
		const query = qs.stringify(clan);
		return this.fetch(`${this.baseURL}/clans?${query}`);
	}

	async clan(clanTag) {
		return this.fetch(`${this.baseURL}/clans/${this.constructor.tag(clanTag)}`);
	}

	async clanMembers(clanTag, option) {
		const query = qs.stringify(option);
		return this.fetch(`${this.baseURL}/clans/${this.constructor.tag(clanTag)}/members?${query}`);
	}

	async clanWarlog(clanTag, option) {
		const query = qs.stringify(option);
		return this.fetch(`${this.baseURL}/clans/${this.constructor.tag(clanTag)}/warlog?${query}`);
	}

	async currentWar(clanTag) {
		return this.fetch(`${this.baseURL}/clans/${this.constructor.tag(clanTag)}/currentwar`);
	}

	async player(playerTag) {
		return this.fetch(`${this.baseURL}/players/${this.constructor.tag(playerTag)}`);
	}
}

module.exports = Client;
