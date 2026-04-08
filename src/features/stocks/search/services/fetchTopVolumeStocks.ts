import { ensureKisAccessToken, getKisConfig } from '@/lib/kis-auth';
import type { StockSearchItem } from '@/features/stocks/search/types';

type KisTopViewItem = {
	mrkt_div_cls_code?: string;
	mksc_shrn_iscd?: string;
	stck_shrn_iscd?: string;
	shrn_iscd?: string;
	hts_kor_isnm?: string;
};

type KisTopViewResponse = {
	rt_cd?: string;
	msg_cd?: string;
	msg1?: string;
	output1?: KisTopViewItem[];
};

function normalizeTopViewCandidates(items: KisTopViewItem[]) {
	return items
		.filter((item) => (item.mrkt_div_cls_code ?? 'J') === 'J')
		.map((item) => ({
			code: item.mksc_shrn_iscd ?? item.stck_shrn_iscd ?? item.shrn_iscd ?? '',
			name: item.hts_kor_isnm ?? '',
		}))
		.filter((item): item is StockSearchItem => Boolean(item.code))
		.slice(0, 5);
}

export async function fetchTopVolumeStocks() {
	const token = await ensureKisAccessToken();
	const { baseUrl, appKey, appSecret } = getKisConfig();

	const response = await fetch(
		`${baseUrl}/uapi/domestic-stock/v1/ranking/hts-top-view?fid_cond_mrkt_div_code=J&fid_input_iscd=0000`,
		{
			method: 'GET',
			headers: {
				authorization: `Bearer ${token.accessToken}`,
				appkey: appKey,
				appsecret: appSecret,
				tr_id: 'HHMCM000100C0',
				custtype: 'P',
			},
			cache: 'no-store',
		},
	);

	const data = (await response.json()) as KisTopViewResponse;

	if (!response.ok || data.rt_cd !== '0' || !data.output1?.length) {
		throw new Error(data.msg1 ?? 'Failed to fetch the HTS top-view stock list.');
	}

	const candidates = normalizeTopViewCandidates(data.output1);

	if (candidates.length === 0) {
		return [] as StockSearchItem[];
	}

	return candidates.map((item) => ({
		code: item.code,
		name: item.name || item.code,
	}));
}
