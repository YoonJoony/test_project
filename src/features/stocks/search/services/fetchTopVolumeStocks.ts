import { ensureKisAccessToken, getKisConfig } from '@/lib/kis-auth';

import type { StockPreviewPriceItem, StockSearchItem } from '@/features/stocks/search/types';

type KisPriceOutput = {
	mrkt_div_cls_code?: string;
	mksc_shrn_iscd?: string;
};

type KisPriceResponse = {
	rt_cd?: string;
	msg_cd?: string;
	msg1?: string;
	output?: KisPriceOutput;
};

export async function fetchTopVolumeStocks() {
	const token = await ensureKisAccessToken();
	const { baseUrl, appKey, appSecret } = getKisConfig();

	const response = await fetch(`${baseUrl}/uapi/domestic-stock/v1/ranking/hts-top-view?`, {
		method: 'GET',
		headers: {
			authorization: `Bearer ${token.accessToken}`,
			appkey: appKey,
			appsecret: appSecret,
			tr_id: 'HHMCM000100C0',
			custtype: 'P',
		},
		cache: 'no-store',
	});

	const data = (await response.json()) as KisPriceResponse;

	return [];
}
