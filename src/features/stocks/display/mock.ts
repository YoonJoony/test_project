import type {
	MarketNoteItem,
	NewsItem,
	OrderBookItem,
	RelatedItem,
	StatItem,
	StockSummary,
} from '@/features/stocks/display/types';

export const MOCK_STOCK: StockSummary = {
	name: 'SK하이닉스',
	englishName: 'SK hynix Inc.',
	code: '000660',
	market: 'KOSPI',
	price: '218,500',
	changeAmount: '+10,200',
	changeRate: '+4.90%',
	high: '221,000',
	low: '207,500',
	open: '209,000',
	volume: '4,821,430주',
	turnover: '1.02조',
	afterHoursText: '장 마감 후에도 한눈에 주문 판단이 가능하도록 구성한 템프 화면입니다.',
};

export const CHART_TABS = ['1일', '1주', '1개월', '3개월', '1년', '3년'] as const;
export const ACTIVE_CHART_TAB = '1일';

export const CHART_POINTS = [
	112, 118, 121, 119, 132, 138, 144, 141, 156, 168, 162, 178, 184, 191, 205, 214, 222, 218, 226,
	231,
];

export const STAT_ITEMS: StatItem[] = [
	{ label: '시가총액', value: '159.1조', helpText: '국내 반도체 대형주' },
	{ label: 'PER', value: '14.2배', helpText: '업종 평균 대비 안정권' },
	{ label: '외국인 보유', value: '54.8%', helpText: '최근 5거래일 순매수' },
	{ label: '52주 범위', value: '139,400 ~ 248,500', helpText: '고점 대비 숨 고르기' },
];

export const INVESTMENT_POINTS = [
	'HBM와 서버용 메모리 비중 확대가 올해 실적 기대를 끌어올리고 있어요.',
	'단기적으로는 외국인 수급과 엔비디아 공급망 뉴스에 민감하게 반응할 수 있어요.',
	'전고점 인근에서는 거래량 재확인이 중요하고, 눌림 구간에서는 20일선 지지가 포인트예요.',
];

export const MARKET_NOTES: MarketNoteItem[] = [
	{ label: '체결강도', value: '126.4', accent: 'text-rose-500' },
	{ label: '기관 수급', value: '+82,104주', accent: 'text-rose-500' },
	{ label: '개인 수급', value: '-41,290주', accent: 'text-blue-500' },
	{ label: 'VI 가능성', value: '낮음', accent: 'text-slate-700' },
];

export const ORDER_BOOK: OrderBookItem[] = [
	{ price: '219,000', volume: '18,302', strength: 88, side: 'sell' },
	{ price: '218,500', volume: '12,914', strength: 66, side: 'sell' },
	{ price: '218,000', volume: '9,420', strength: 48, side: 'buy' },
	{ price: '217,500', volume: '15,830', strength: 79, side: 'buy' },
];

export const NEWS_ITEMS: NewsItem[] = [
	{
		title: 'HBM 공급 확대 기대에 반도체 대형주 강세 지속',
		source: 'Market Watch',
		time: '08:42',
	},
	{
		title: '외국인 순매수 상위권 재진입, 메모리 업황 기대감 유지',
		source: 'Seoul Finance',
		time: '09:18',
	},
	{
		title: 'AI 서버 투자 확대 전망에 메모리 밸류체인 관심 집중',
		source: 'Today Broker',
		time: '10:05',
	},
];

export const RELATED_STOCKS: RelatedItem[] = [
	{ name: '삼성전자', price: '84,500', changeRate: '+1.84%', positive: true },
	{ name: '한미반도체', price: '126,000', changeRate: '+3.27%', positive: true },
	{ name: '리노공업', price: '229,500', changeRate: '-0.61%', positive: false },
	{ name: 'ISC', price: '76,300', changeRate: '+0.95%', positive: true },
];
