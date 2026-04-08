import { EventEmitter } from 'node:events';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import WebSocket, { WebSocketServer } from 'ws';

const TRADE_TR_ID = 'H0STCNT0';
const TRADE_COLUMNS = [
	'MKSC_SHRN_ISCD',
	'STCK_CNTG_HOUR',
	'STCK_PRPR',
	'PRDY_VRSS_SIGN',
	'PRDY_VRSS',
	'PRDY_CTRT',
	'WGHN_AVRG_STCK_PRC',
	'STCK_OPRC',
	'STCK_HGPR',
	'STCK_LWPR',
	'ASKP1',
	'BIDP1',
	'CNTG_VOL',
	'ACML_VOL',
	'ACML_TR_PBMN',
	'SELN_CNTG_CSNU',
	'SHNU_CNTG_CSNU',
	'NTBY_CNTG_CSNU',
	'CTTR',
	'SELN_CNTG_SMTN',
	'SHNU_CNTG_SMTN',
	'CCLD_DVSN',
	'SHNU_RATE',
	'PRDY_VOL_VRSS_ACML_VOL_RATE',
	'OPRC_HOUR',
	'OPRC_VRSS_PRPR_SIGN',
	'OPRC_VRSS_PRPR',
	'HGPR_HOUR',
	'HGPR_VRSS_PRPR_SIGN',
	'HGPR_VRSS_PRPR',
	'LWPR_HOUR',
	'LWPR_VRSS_PRPR_SIGN',
	'LWPR_VRSS_PRPR',
	'BSOP_DATE',
	'NEW_MKOP_CLS_CODE',
	'TRHT_YN',
	'ASKP_RSQN1',
	'BIDP_RSQN1',
	'TOTAL_ASKP_RSQN',
	'TOTAL_BIDP_RSQN',
	'VOL_TNRT',
	'PRDY_SMNS_HOUR_ACML_VOL',
	'PRDY_SMNS_HOUR_ACML_VOL_RATE',
	'HOUR_CLS_CODE',
	'MRKT_TRTM_CLS_CODE',
	'VI_STND_PRC',
];

loadLocalEnvFile();

const REALTIME_SERVER_PORT = Number.parseInt(process.env.REALTIME_SERVER_PORT ?? '3001', 10);

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadLocalEnvFile() {
	const envFilePath = path.resolve(process.cwd(), '.env.local');

	if (!existsSync(envFilePath)) {
		return;
	}

	const envContent = readFileSync(envFilePath, 'utf8');

	for (const line of envContent.split(/\r?\n/)) {
		const trimmedLine = line.trim();

		if (!trimmedLine || trimmedLine.startsWith('#')) {
			continue;
		}

		const delimiterIndex = trimmedLine.indexOf('=');

		if (delimiterIndex === -1) {
			continue;
		}

		const key = trimmedLine.slice(0, delimiterIndex).trim();
		const value = trimmedLine.slice(delimiterIndex + 1).trim();

		if (!(key in process.env)) {
			process.env[key] = value;
		}
	}
}

function getRequiredEnv(name) {
	const value = process.env[name];

	if (!value) {
		throw new Error(`${name} environment variable is not set.`);
	}

	return value;
}

function getKisWebSocketUrl() {
	if (process.env.KIS_WS_URL) {
		return process.env.KIS_WS_URL;
	}

	const baseUrl = getRequiredEnv('KIS_BASE_URL');

	if (baseUrl.includes('openapivts') || baseUrl.includes('210.107.75.78')) {
		return 'ws://ops.koreainvestment.com:31000';
	}

	if (baseUrl.includes('openapi.koreainvestment.com')) {
		return 'ws://ops.koreainvestment.com:21000';
	}

	throw new Error('KIS_WS_URL environment variable is required for websocket connections.');
}

function getKisConfig() {
	return {
		appKey: getRequiredEnv('KIS_APP_KEY'),
		appSecret: getRequiredEnv('KIS_APP_SECRET'),
		baseUrl: getRequiredEnv('KIS_BASE_URL'),
		wsUrl: getKisWebSocketUrl(),
	};
}

async function issueApprovalKey() {
	const { appKey, appSecret, baseUrl } = getKisConfig();
	const response = await fetch(`${baseUrl}/oauth2/Approval`, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			accept: 'text/plain',
			charset: 'UTF-8',
		},
		body: JSON.stringify({
			grant_type: 'client_credentials',
			appkey: appKey,
			secretkey: appSecret,
		}),
	});

	const data = await response.json();

	if (!response.ok || !data.approval_key) {
		throw new Error(
			`KIS websocket approval key issuance failed. ${data.msg_cd ?? response.status} ${data.msg1 ?? data.message ?? ''}`.trim(),
		);
	}

	return data.approval_key;
}

function parseTradeFrame(rawMessage) {
	const [frameType, trId, , payload] = rawMessage.split('|');

	if (!frameType || !trId || !payload || trId !== TRADE_TR_ID) {
		return null;
	}

	const values = payload.split('^');

	if (values.length < 6) {
		return null;
	}

	const mapped = Object.fromEntries(
		TRADE_COLUMNS.map((column, index) => [column, values[index] ?? '']),
	);
	const code = mapped.MKSC_SHRN_ISCD?.trim();

	if (!code) {
		return null;
	}

	return {
		code,
		currentPrice: mapped.STCK_PRPR ?? '',
		changeRate: mapped.PRDY_CTRT ?? '',
		updatedAt: new Date().toISOString(),
	};
}

class KISRealtimeRelay extends EventEmitter {
	constructor() {
		super();
		this.approvalKey = null;
		this.connectPromise = null;
		this.reconnectTimer = null;
		this.socket = null;
		this.activeSubscriptions = new Map();
		this.clientSubscriptions = new Map();
		this.latestPrices = new Map();
	}

	async ensureConnected() {
		if (this.socket?.readyState === WebSocket.OPEN) {
			return;
		}

		if (!this.connectPromise) {
			this.connectPromise = this.connect().finally(() => {
				this.connectPromise = null;
			});
		}

		await this.connectPromise;
	}

	async connect() {
		const { wsUrl } = getKisConfig();
		this.approvalKey = await issueApprovalKey();

		await new Promise((resolve, reject) => {
			const socket = new WebSocket(wsUrl);
			this.socket = socket;

			socket.once('open', async () => {
				try {
					await this.resubscribeAll();
					resolve();
				} catch (error) {
					reject(error);
				}
			});

			socket.on('message', (message) => {
				this.handleKisMessage(message.toString());
			});

			socket.once('error', (error) => {
				reject(error);
			});

			socket.on('close', () => {
				this.socket = null;
				this.scheduleReconnect();
			});
		});
	}

	scheduleReconnect() {
		if (this.reconnectTimer || this.activeSubscriptions.size === 0) {
			return;
		}

		this.reconnectTimer = setTimeout(async () => {
			this.reconnectTimer = null;

			try {
				await this.ensureConnected();
			} catch (error) {
				console.error('[KISRealtimeRelay] reconnect failed', error);
				this.scheduleReconnect();
			}
		}, 1000);
	}

	handleKisMessage(rawMessage) {
		if (rawMessage.startsWith('0|') || rawMessage.startsWith('1|')) {
			const tradeUpdate = parseTradeFrame(rawMessage);

			if (!tradeUpdate) {
				return;
			}

			this.latestPrices.set(tradeUpdate.code, tradeUpdate);
			this.emit('price', tradeUpdate);
			return;
		}

		try {
			const payload = JSON.parse(rawMessage);

			if (payload?.header?.tr_id === 'PINGPONG') {
				this.socket?.pong(rawMessage);
				return;
			}

			if (payload?.body?.rt_cd && payload.body.rt_cd !== '0') {
				if (payload.body.msg_cd === 'OPSP0002') {
					return;
				}

				console.error('[KISRealtimeRelay] subscription error', payload);
			}
		} catch (error) {
			console.error('[KISRealtimeRelay] failed to parse message', error);
		}
	}

	async subscribe(client, codes) {
		const normalizedCodes = Array.from(new Set(codes.map((code) => code.trim()).filter(Boolean)));

		if (normalizedCodes.length === 0) {
			return [];
		}

		await this.ensureConnected();

		const ownedCodes = this.clientSubscriptions.get(client) ?? new Set();
		this.clientSubscriptions.set(client, ownedCodes);

		const newlySubscribed = [];

		for (const code of normalizedCodes) {
			if (ownedCodes.has(code)) {
				continue;
			}

			ownedCodes.add(code);
			const nextCount = (this.activeSubscriptions.get(code) ?? 0) + 1;
			this.activeSubscriptions.set(code, nextCount);

			if (nextCount === 1) {
				newlySubscribed.push(code);
			}
		}

		for (const code of newlySubscribed) {
			await this.sendSubscriptionFrame('1', code);
		}

		return normalizedCodes
			.map((code) => this.latestPrices.get(code))
			.filter((item) => item !== undefined);
	}

	async unsubscribe(client, codes) {
		const ownedCodes = this.clientSubscriptions.get(client);

		if (!ownedCodes) {
			return;
		}

		const normalizedCodes = Array.from(new Set(codes.map((code) => code.trim()).filter(Boolean)));

		for (const code of normalizedCodes) {
			if (!ownedCodes.has(code)) {
				continue;
			}

			ownedCodes.delete(code);
			const nextCount = (this.activeSubscriptions.get(code) ?? 1) - 1;

			if (nextCount <= 0) {
				this.activeSubscriptions.delete(code);
				await this.sendSubscriptionFrame('2', code);
				continue;
			}

			this.activeSubscriptions.set(code, nextCount);
		}

		if (ownedCodes.size === 0) {
			this.clientSubscriptions.delete(client);
		}
	}

	async removeClient(client) {
		const ownedCodes = Array.from(this.clientSubscriptions.get(client) ?? []);

		if (ownedCodes.length > 0) {
			await this.unsubscribe(client, ownedCodes);
		}
	}

	async resubscribeAll() {
		for (const code of this.activeSubscriptions.keys()) {
			await this.sendSubscriptionFrame('1', code);
		}
	}

	async sendSubscriptionFrame(trType, code) {
		if (!this.socket || this.socket.readyState !== WebSocket.OPEN || !this.approvalKey) {
			return;
		}

		this.socket.send(
			JSON.stringify({
				header: {
					approval_key: this.approvalKey,
					tr_type: trType,
					custtype: 'P',
				},
				body: {
					input: {
						tr_id: TRADE_TR_ID,
						tr_key: code,
					},
				},
			}),
		);

		await sleep(80);
	}
}

const relay = new KISRealtimeRelay();
const realtimeServer = new WebSocketServer({ port: REALTIME_SERVER_PORT });

relay.on('price', (item) => {
	for (const client of realtimeServer.clients) {
		if (client.readyState !== WebSocket.OPEN) {
			continue;
		}

		const subscribedCodes = relay.clientSubscriptions.get(client);

		if (!subscribedCodes?.has(item.code)) {
			continue;
		}

		client.send(
			JSON.stringify({
				type: 'price',
				item,
			}),
		);
	}
});

realtimeServer.on('connection', (client) => {
	client.on('message', async (message) => {
		try {
			const payload = JSON.parse(message.toString());

			if (payload?.type === 'subscribe') {
				const codes = Array.isArray(payload.codes) ? payload.codes : [];
				const snapshot = await relay.subscribe(client, codes);

				client.send(
					JSON.stringify({
						type: 'subscribed',
						codes,
					}),
				);

				client.send(
					JSON.stringify({
						type: 'snapshot',
						items: snapshot,
					}),
				);

				return;
			}

			if (payload?.type === 'unsubscribe') {
				await relay.unsubscribe(client, Array.isArray(payload.codes) ? payload.codes : []);
			}
		} catch (error) {
			client.send(
				JSON.stringify({
					type: 'error',
					message: error instanceof Error ? error.message : 'Unexpected realtime server error.',
				}),
			);
		}
	});

	client.on('close', async () => {
		await relay.removeClient(client);
	});
});

// console.log(
// 	`[realtime] websocket relay server listening on ws://localhost:${REALTIME_SERVER_PORT}`,
// );
