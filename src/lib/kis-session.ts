import 'server-only';

import { cache } from 'react';

import { ensureKisAccessToken, getCachedKisAccessToken } from '@/lib/kis-auth';
import {
	ensureKisWebSocketApprovalKey,
	getCachedKisWebSocketApprovalKey,
} from '@/lib/kis-websocket-auth';

type KisWarmupStatus = {
	status: boolean;
	msg: string;
};

export const warmKisSession = cache(async () => {
	const existingAccessToken = getCachedKisAccessToken();
	const existingWebSocketApproval = getCachedKisWebSocketApprovalKey();

	const [accessToken, webSocketApproval] = await Promise.all([
		ensureKisAccessToken(),
		ensureKisWebSocketApprovalKey(),
	]);

	const tokenStatus: KisWarmupStatus = existingAccessToken
		? {
				status: true,
				msg: 'Using the cached access token.',
			}
		: {
				status: false,
				msg: `Issued a new access token. Expires at: ${new Date(accessToken.expiresAt).toLocaleString('ko-KR')}`,
			};

	const socketKeyStatus: KisWarmupStatus = existingWebSocketApproval
		? {
				status: true,
				msg: 'Using the cached websocket approval key.',
			}
		: {
				status: false,
				msg: `Issued a new websocket approval key. Expires at: ${new Date(webSocketApproval.expiresAt).toLocaleString('ko-KR')}`,
			};

	return {
		tokenStatus,
		socketKeyStatus,
		accessToken,
		webSocketApproval,
	};
});
