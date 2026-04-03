export type StockSearchDbRow = {
	mksc_shrn_iscd: string | null;
	hts_kor_isnm: string | null;
	prdy_avls_scal: string | null;
};

export type StockSearchItem = {
	code: string;
	name: string;
};

export type StockPreviewPriceItem = {
	code: string;
	name: string;
	currentPrice: string;
	changeRate: string;
};
