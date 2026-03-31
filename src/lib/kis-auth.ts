// API 응답되어 반환된 토큰
type KisTokenResponse = {
	access_token?: string;
	expires_in?: number | string;
	msg1?: string;
	msg_cd?: string;
};

// 전역변수에 담을 토큰 정보
type KisTokenCache = {
	accessToken: string;
	expiresAt: number;
};

// 토큰캐시 전역변수 선언
declare global {
	var __kisTokenCache__: KisTokenCache | undefined;
}

const TOKEN_REFRESH_BUFFER_MS = 60 * 1000;

// 노드 환경변수에서 등록한 API App 키와 Url 가져옴
function getRequiredEnv(name: string) {
	const value = process.env[name];

	if (!value) {
		throw new Error(`${name} environment variable is not set.`);
	}

	return value;
}

// 토큰 만료기간 가공
function getExpiresAt(expiresIn?: number | string) {
	const parsed = typeof expiresIn === 'string' ? Number.parseInt(expiresIn, 10) : expiresIn;

	const ttlSeconds = Number.isFinite(parsed) && parsed ? parsed : 60 * 60;

	return Date.now() + ttlSeconds * 1000;
}

// 노드 환경변수에 세팅된 키 반환 함수
export function getKisConfig() {
	return {
		appKey: getRequiredEnv('KIS_APP_KEY'),
		appSecret: getRequiredEnv('KIS_APP_SECRET'),
		baseUrl: getRequiredEnv('KIS_BASE_URL'),
	};
}

// 토큰 체크
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

// 한국투자증권 API 토큰 발금
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
	};

	// 토큰 전역변수에 저장
	global.__kisTokenCache__ = token;

	return token;
}

// 컴포넌트 마운트마다 토큰 체크 (없으면 토큰 발급)
export async function ensureKisAccessToken() {
	return getCachedKisAccessToken() ?? issueKisAccessToken();
}
