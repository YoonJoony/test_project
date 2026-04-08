import { getSupabaseServerInstance } from '@/lib/supabase';
import { logger } from '@/shared/utils/logger';

import type { StockSearchDbRow } from '@/features/stocks/search/types';

export async function searchStocksRepository(query: string) {
	const supabase = getSupabaseServerInstance();
	const trimmedQuery = query.trim();
	const orFilter = `hts_kor_isnm.ilike.${trimmedQuery}%,hts_kor_isnm.ilike.%${trimmedQuery}%`;

	// 로깅 방식은 나중에 수정
	logger.info('[StockSearchRepository] query start', {
		table: 'TB_STOCK_KOSPI_MST',
		select: 'mksc_shrn_iscd, hts_kor_isnm, prdy_avls_scal',
		or: orFilter,
		trimmedQuery,
	});

	const { data, error } = await supabase
		.from('TB_STOCK_KOSPI_MST')
		.select('mksc_shrn_iscd, hts_kor_isnm, prdy_avls_scal')
		.or(orFilter);

	if (error) {
		console.error('[StockSearchRepository] query failed', {
			trimmedQuery,
			message: error.message,
		});
		throw new Error(error.message);
	}

	logger.info('[StockSearchRepository] query success', {
		trimmedQuery,
		count: data?.length ?? 0,
	});

	return (data ?? []) as StockSearchDbRow[];
}
