import { getKisConfig } from '@/lib/kis-auth';

type KisWebSocketApprovalResponse = {
	approval_key?: string;
	code?: number | string;
	message?: string;
	msg_cd?: string;
	msg1?: string;
};

export type KisWebSocketApproval = {
	approvalKey: string;
	raw: KisWebSocketApprovalResponse;
};

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

	return {
		approvalKey: data.approval_key,
		raw: data,
	} satisfies KisWebSocketApproval;
}
