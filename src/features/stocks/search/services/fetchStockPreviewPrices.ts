import { ensureKisAccessToken, getKisConfig } from '@/lib/kis-auth';

import type { StockPreviewPriceItem, StockSearchItem } from '@/features/stocks/search/types';

type KisPriceOutput = {
	rprs_mrkt_kor_name?: string;
	hts_kor_isnm?: string;
	stck_prpr?: string;
	prdy_ctrt?: string;
};

type KisPriceResponse = {
	rt_cd?: string;
	msg_cd?: string;
	msg1?: string;
	output?: KisPriceOutput;
};

export async function fetchStockPreviewPrices(items: StockSearchItem[]) {
	const candidates = items.filter((item) => item.code).slice(0, 5);

	if (candidates.length === 0) {
		return [] as StockPreviewPriceItem[];
	}

	const token = await ensureKisAccessToken();
	const { baseUrl, appKey, appSecret } = getKisConfig();

	const results = await Promise.all(
		candidates.map(async (item) => {
			const params = new URLSearchParams({
				fid_cond_mrkt_div_code: 'J',
				fid_input_iscd: item.code,
			});

			const response = await fetch(
				`${baseUrl}/uapi/domestic-stock/v1/quotations/inquire-price?${params.toString()}`,
				{
					method: 'GET',
					headers: {
						authorization: `Bearer ${token.accessToken}`,
						appkey: appKey,
						appsecret: appSecret,
						tr_id: 'FHKST01010100',
						custtype: 'P',
					},
					cache: 'no-store',
				},
			);

			const data = (await response.json()) as KisPriceResponse;
			if (!response.ok || data.rt_cd !== '0' || !data.output) {
				return null;
			}
			console.log(data);
			return {
				code: item.code,
				name: data.output.hts_kor_isnm ?? item.name,
				currentPrice: data.output.stck_prpr ?? '',
				changeRate: data.output.prdy_ctrt ?? '',
			} satisfies StockPreviewPriceItem;
		}),
	);

	return results.filter((result): result is StockPreviewPriceItem => result !== null);
}
