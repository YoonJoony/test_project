export type RightSectionProps = {
	supabaseStatus: {
		status?: boolean;
		msg?: string;
	};
	stockMasterRows: Array<{
		mksc_shrn_iscd: string | null;
		stnd_iscd: string | null;
	}>;
};

export type StockSummary = {
	name: string;
	englishName: string;
	code: string;
	market: string;
	price: string;
	changeAmount: string;
	changeRate: string;
	high: string;
	low: string;
	open: string;
	volume: string;
	turnover: string;
	afterHoursText: string;
};

export type StatItem = {
	label: string;
	value: string;
	helpText: string;
};

export type MarketNoteItem = {
	label: string;
	value: string;
	accent: string;
};

export type OrderBookItem = {
	price: string;
	volume: string;
	strength: number;
	side: 'buy' | 'sell';
};

export type NewsItem = {
	title: string;
	source: string;
	time: string;
};

export type RelatedItem = {
	name: string;
	price: string;
	changeRate: string;
	positive: boolean;
};
