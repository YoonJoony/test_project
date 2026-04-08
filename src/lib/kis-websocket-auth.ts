import 'server-only';

import { getKisConfig } from '@/lib/kis-auth';

type KisWebSocketApprovalResponse = {
	approval_key?: string;
	code?: number | string;
	message?: string;
	msg_cd?: string;
	msg1?: string;
};

type KisWebSocketApproval = {
	approvalKey: string;
	expiresAt: number;
};

declare global {
	var __kisWebSocketCache__: KisWebSocketApproval | undefined;
	var __kisWebSocketPromise__: Promise<KisWebSocketApproval> | undefined;
}

const TOKEN_REFRESH_BUFFER_MS = 60 * 1000;
const WEBSOCKET_APPROVAL_TTL_MS = 24 * 60 * 60 * 1000;

export function getCachedKisWebSocketApprovalKey() {
	const cached = global.__kisWebSocketCache__;

	if (!cached) {
		return null;
	}

	if (cached.expiresAt - TOKEN_REFRESH_BUFFER_MS <= Date.now()) {
		global.__kisWebSocketCache__ = undefined;
		return null;
	}

	return cached;
}

export async function issueKisWebSocketApprovalKey() {
	const { appKey, appSecret, baseUrl } = getKisConfig();

	const response = await fetch(`${baseUrl}/oauth2/Approval`, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			accept: 'text/plain',
			charset: 'UTF-8',
		},
		cache: 'no-store',
		body: JSON.stringify({
			grant_type: 'client_credentials',
			appkey: appKey,
			secretkey: appSecret,
		}),
	});

	const data = (await response.json()) as KisWebSocketApprovalResponse;

	if (!response.ok || !data.approval_key) {
		throw new Error(
			`KIS websocket approval key issuance failed. ${data.msg_cd ?? data.code ?? response.status} ${data.msg1 ?? data.message ?? ''}`.trim(),
		);
	}

	const approval = {
		approvalKey: data.approval_key,
		expiresAt: Date.now() + WEBSOCKET_APPROVAL_TTL_MS,
	} satisfies KisWebSocketApproval;

	global.__kisWebSocketCache__ = approval;

	return approval;
}

export async function ensureKisWebSocketApprovalKey() {
	const cachedApproval = getCachedKisWebSocketApprovalKey();

	if (cachedApproval) {
		return cachedApproval;
	}

	if (!global.__kisWebSocketPromise__) {
		global.__kisWebSocketPromise__ = issueKisWebSocketApprovalKey().finally(() => {
			global.__kisWebSocketPromise__ = undefined;
		});
	}

	return global.__kisWebSocketPromise__;
}
