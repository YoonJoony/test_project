import { getSupabaseServerInstance } from '@/lib/supabase';

import type { StockSearchDbRow } from '@/features/stocks/search/types';

export async function searchStocksRepository(query: string) {
	const supabase = getSupabaseServerInstance();
	const trimmedQuery = query.trim();

	const { data, error } = await supabase
		.from('TB_STOCK_KOSPI_MST')
		.select('mksc_shrn_iscd, hts_kor_isnm, prdy_avls_scal')
		.or(`hts_kor_isnm.ilike.${trimmedQuery}%,hts_kor_isnm.ilike.%${trimmedQuery}%`);

	if (error) {
		throw new Error(error.message);
	}

	return (data ?? []) as StockSearchDbRow[];
}
