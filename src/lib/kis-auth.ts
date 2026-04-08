import 'server-only';

type KisTokenResponse = {
	access_token?: string;
	expires_in?: number | string;
	msg1?: string;
	msg_cd?: string;
};

type KisTokenCache = {
	accessToken: string;
	expiresAt: number;
};

declare global {
	var __kisTokenCache__: KisTokenCache | undefined;
	var __kisTokenPromise__: Promise<KisTokenCache> | undefined;
}

const TOKEN_REFRESH_BUFFER_MS = 60 * 1000;

function getRequiredEnv(name: string) {
	const value = process.env[name];

	if (!value) {
		throw new Error(`${name} environment variable is not set.`);
	}

	return value;
}

function getExpiresAt(expiresIn?: number | string) {
	const parsed = typeof expiresIn === 'string' ? Number.parseInt(expiresIn, 10) : expiresIn;
	const ttlSeconds = Number.isFinite(parsed) && parsed ? parsed : 60 * 60;

	return Date.now() + ttlSeconds * 1000;
}

export function getKisConfig() {
	return {
		appKey: getRequiredEnv('KIS_APP_KEY'),
		appSecret: getRequiredEnv('KIS_APP_SECRET'),
		baseUrl: getRequiredEnv('KIS_BASE_URL'),
	};
}

export function getCachedKisAccessToken() {
	const cached = global.__kisTokenCache__;

	if (!cached) {
		return null;
	}

	if (cached.expiresAt - TOKEN_REFRESH_BUFFER_MS <= Date.now()) {
		global.__kisTokenCache__ = undefined;
		return null;
	}

	return cached;
}

export async function issueKisAccessToken() {
	const { appKey, appSecret, baseUrl } = getKisConfig();

	const response = await fetch(`${baseUrl}/oauth2/tokenP`, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
		},
		cache: 'no-store',
		body: JSON.stringify({
			grant_type: 'client_credentials',
			appkey: appKey,
			appsecret: appSecret,
		}),
	});

	const data = (await response.json()) as KisTokenResponse;

	if (!response.ok || !data.access_token) {
		throw new Error(
			`KIS token issuance failed. ${data.msg_cd ?? response.status} ${data.msg1 ?? ''}`.trim(),
		);
	}

	const token = {
		accessToken: data.access_token,
		expiresAt: getExpiresAt(data.expires_in),
	} satisfies KisTokenCache;

	global.__kisTokenCache__ = token;

	return token;
}

export async function ensureKisAccessToken() {
	const cachedToken = getCachedKisAccessToken();

	if (cachedToken) {
		return cachedToken;
	}

	if (!global.__kisTokenPromise__) {
		global.__kisTokenPromise__ = issueKisAccessToken().finally(() => {
			global.__kisTokenPromise__ = undefined;
		});
	}

	return global.__kisTokenPromise__;
}
