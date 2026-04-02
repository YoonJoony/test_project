import { searchStocksRepository } from '@/features/stocks/search/repositories/searchStocksRepository';

import type { StockSearchItem } from '@/features/stocks/search/types';

function getMatchPriority(name: string, query: string) {
	if (name === query) {
		return 1;
	}

	if (name.startsWith(query)) {
		return 2;
	}

	if (name.includes(query)) {
		return 3;
	}

	return 4;
}

function parseMarketCap(value: string | null) {
	if (!value) {
		return 0;
	}

	const parsed = Number.parseInt(value, 10);
	return Number.isFinite(parsed) ? parsed : 0;
}

export async function searchStocks(query: string) {
	const trimmedQuery = query.trim();

	if (!trimmedQuery) {
		return [] as StockSearchItem[];
	}

	const rows = await searchStocksRepository(trimmedQuery);

	return rows
		.filter((row) => row.mksc_shrn_iscd && row.hts_kor_isnm)
		.sort((a, b) => {
			const marketCapGap = parseMarketCap(b.prdy_avls_scal) - parseMarketCap(a.prdy_avls_scal);

			if (marketCapGap !== 0) {
				return marketCapGap;
			}

			const priorityGap =
				getMatchPriority(a.hts_kor_isnm ?? '', trimmedQuery) -
				getMatchPriority(b.hts_kor_isnm ?? '', trimmedQuery);

			if (priorityGap !== 0) {
				return priorityGap;
			}

			return (a.hts_kor_isnm ?? '').localeCompare(b.hts_kor_isnm ?? '', 'ko');
		})
		.slice(0, 5)
		.map((row) => ({
			code: row.mksc_shrn_iscd ?? '',
			name: row.hts_kor_isnm ?? '',
		}));
}
