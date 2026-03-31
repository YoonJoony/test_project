'use client';

import {
	ArrowDownRight,
	ArrowUpRight,
	Bell,
	BookmarkPlus,
	ChevronRight,
	Clock3,
	Info,
	WalletCards,
} from 'lucide-react';

type RightSectionProps = {
	supabaseStatus: {
		status?: boolean;
		msg?: string;
	};
	stockMasterRows: Array<{
		mksc_shrn_iscd: string | null;
		stnd_iscd: string | null;
	}>;
};

type StatItem = {
	label: string;
	value: string;
	helpText: string;
};

type OrderBookItem = {
	price: string;
	volume: string;
	strength: number;
	side: 'buy' | 'sell';
};

type NewsItem = {
	title: string;
	source: string;
	time: string;
};

type RelatedItem = {
	name: string;
	price: string;
	changeRate: string;
	positive: boolean;
};

const MOCK_STOCK = {
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

const CHART_TABS = ['1일', '1주', '1개월', '3개월', '1년', '3년'] as const;
const ACTIVE_CHART_TAB = '1일';

const CHART_POINTS = [
	112, 118, 121, 119, 132, 138, 144, 141, 156, 168, 162, 178, 184, 191, 205, 214, 222, 218, 226,
	231,
];

const STAT_ITEMS: StatItem[] = [
	{ label: '시가총액', value: '159.1조', helpText: '국내 반도체 대형주' },
	{ label: 'PER', value: '14.2배', helpText: '업종 평균 대비 안정권' },
	{ label: '외국인 보유', value: '54.8%', helpText: '최근 5거래일 순매수' },
	{ label: '52주 범위', value: '139,400 ~ 248,500', helpText: '고점 대비 숨 고르기' },
];

const INVESTMENT_POINTS = [
	'HBM와 서버용 메모리 비중 확대가 올해 실적 기대를 끌어올리고 있어요.',
	'단기적으로는 외국인 수급과 엔비디아 공급망 뉴스에 민감하게 반응할 수 있어요.',
	'전고점 인근에서는 거래량 재확인이 중요하고, 눌림 구간에서는 20일선 지지가 포인트예요.',
];

const MARKET_NOTES = [
	{ label: '체결강도', value: '126.4', accent: 'text-rose-500' },
	{ label: '기관 수급', value: '+82,104주', accent: 'text-rose-500' },
	{ label: '개인 수급', value: '-41,290주', accent: 'text-blue-500' },
	{ label: 'VI 가능성', value: '낮음', accent: 'text-slate-700' },
];

const ORDER_BOOK: OrderBookItem[] = [
	{ price: '219,000', volume: '18,302', strength: 88, side: 'sell' },
	{ price: '218,500', volume: '12,914', strength: 66, side: 'sell' },
	{ price: '218,000', volume: '9,420', strength: 48, side: 'buy' },
	{ price: '217,500', volume: '15,830', strength: 79, side: 'buy' },
];

const NEWS_ITEMS: NewsItem[] = [
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

const RELATED_STOCKS: RelatedItem[] = [
	{ name: '삼성전자', price: '84,500', changeRate: '+1.84%', positive: true },
	{ name: '한미반도체', price: '126,000', changeRate: '+3.27%', positive: true },
	{ name: '리노공업', price: '229,500', changeRate: '-0.61%', positive: false },
	{ name: 'ISC', price: '76,300', changeRate: '+0.95%', positive: true },
];

function buildLinePath(points: number[], width: number, height: number) {
	const max = Math.max(...points);
	const min = Math.min(...points);
	const range = max - min || 1;
	const step = width / Math.max(points.length - 1, 1);

	return points
		.map((point, index) => {
			const x = step * index;
			const y = height - ((point - min) / range) * height;

			return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
		})
		.join(' ');
}

function buildAreaPath(points: number[], width: number, height: number) {
	const linePath = buildLinePath(points, width, height);

	return `${linePath} L ${width} ${height} L 0 ${height} Z`;
}

function MiniStatCard({ label, value, helpText }: StatItem) {
	return (
		<div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
			<p className="text-sm font-medium text-slate-500">{label}</p>
			<p className="mt-3 text-2xl font-black tracking-[-0.04em] text-slate-950">{value}</p>
			<p className="mt-2 text-sm text-slate-500">{helpText}</p>
		</div>
	);
}

export default function RightSection({ supabaseStatus, stockMasterRows }: RightSectionProps) {
	const chartWidth = 760;
	const chartHeight = 220;
	const linePath = buildLinePath(CHART_POINTS, chartWidth, chartHeight);
	const areaPath = buildAreaPath(CHART_POINTS, chartWidth, chartHeight);
	const isConnected = !!supabaseStatus.status;
	const previewCount = stockMasterRows.length;

	return (
		<div className="flex h-full w-full min-h-0 flex-col">
			<div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto pr-1">
				<div className="space-y-5">
					<section className="overflow-hidden rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_58%,#eef2ff_100%)] p-7 max-[500px]:p-4 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
						<div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
							<div className="flex-1">
								<div className="flex flex-wrap items-center gap-2">
									<span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
										{MOCK_STOCK.market}
									</span>
									<span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
										{MOCK_STOCK.code}
									</span>
									<span
										className={`rounded-full px-3 py-1 text-xs font-semibold ${
											isConnected
												? 'bg-emerald-100 text-emerald-700'
												: 'bg-amber-100 text-amber-700'
										}`}
									>
										{isConnected ? '연결 확인 완료' : '데모 모드'}
									</span>
								</div>

								<div className="mt-5 flex flex-wrap items-start justify-between gap-4">
									<div>
										<p className="text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-5xl">
											{MOCK_STOCK.name}
										</p>
										<p className="mt-2 text-base text-slate-500">{MOCK_STOCK.englishName}</p>

										<div className="mt-8 flex flex-wrap items-end gap-x-4 gap-y-3">
											<p className="text-[clamp(2.6rem,5vw,4.6rem)] font-black tracking-[-0.08em] text-slate-950">
												{MOCK_STOCK.price}
												<span className="ml-2 text-2xl font-bold text-slate-500">원</span>
											</p>
											<div className="pb-2">
												<div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-2 text-sm font-bold text-rose-600">
													<ArrowUpRight className="h-4 w-4" />
													{MOCK_STOCK.changeAmount} ({MOCK_STOCK.changeRate})
												</div>
												<p className="mt-3 text-sm text-slate-500">{MOCK_STOCK.afterHoursText}</p>
											</div>
										</div>
									</div>

									<div className="flex items-center gap-2 self-start">
										<button
											type="button"
											className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:text-slate-950"
											aria-label="알림 추가"
										>
											<Bell className="h-4 w-4" />
										</button>
										<button
											type="button"
											className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:text-slate-950"
											aria-label="관심 종목 저장"
										>
											<BookmarkPlus className="h-4 w-4" />
										</button>
									</div>
								</div>
							</div>

							<div className="w-full xl:max-w-[360px]">
								<div className="rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)] backdrop-blur">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm font-semibold text-slate-500">오늘의 가격 범위</p>
											<p className="mt-1 text-lg font-bold text-slate-950">
												{MOCK_STOCK.low}원 - {MOCK_STOCK.high}원
											</p>
										</div>
										<div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
											장중 강세
										</div>
									</div>

									<div className="mt-6 h-2 rounded-full bg-slate-100">
										<div className="h-2 w-[72%] rounded-full bg-[linear-gradient(90deg,#0f172a_0%,#ef4444_100%)]" />
									</div>

									<div className="mt-4 grid grid-cols-2 gap-3 text-sm">
										<div className="rounded-2xl bg-slate-50 p-4">
											<p className="text-slate-500">시가</p>
											<p className="mt-1 font-bold text-slate-900">{MOCK_STOCK.open}원</p>
										</div>
										<div className="rounded-2xl bg-slate-50 p-4">
											<p className="text-slate-500">거래량</p>
											<p className="mt-1 font-bold text-slate-900">{MOCK_STOCK.volume}</p>
										</div>
									</div>

									<div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-950 px-4 py-3 text-white">
										<div>
											<p className="text-xs uppercase tracking-[0.18em] text-white/60">TURNOVER</p>
											<p className="mt-1 text-lg font-bold">{MOCK_STOCK.turnover}</p>
										</div>
										<ChevronRight className="h-4 w-4 text-white/70" />
									</div>
								</div>
							</div>
						</div>
					</section>

					<section className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.88fr)]">
						<div className="space-y-5">
							<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
								{STAT_ITEMS.map((item) => (
									<MiniStatCard key={item.label} {...item} />
								))}
							</div>

							<div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
								<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
									<div>
										<p className="text-sm font-semibold text-slate-500">가격 흐름</p>
										<p className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950">
											{MOCK_STOCK.price}원
										</p>
										<p className="mt-2 flex items-center gap-2 text-sm font-semibold text-rose-500">
											<ArrowUpRight className="h-4 w-4" />
											전일 대비 {MOCK_STOCK.changeAmount} 상승
										</p>
									</div>

									<div className="flex flex-wrap gap-2">
										{CHART_TABS.map((tab) => {
											const active = tab === ACTIVE_CHART_TAB;

											return (
												<button
													key={tab}
													type="button"
													className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
														active
															? 'bg-slate-950 text-white'
															: 'bg-slate-100 text-slate-500 hover:text-slate-900'
													}`}
												>
													{tab}
												</button>
											);
										})}
									</div>
								</div>

								<div className="mt-6 overflow-hidden rounded-[24px] bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] px-3 py-5">
									<svg
										viewBox={`0 0 ${chartWidth} ${chartHeight}`}
										className="h-[260px] w-full"
										preserveAspectRatio="none"
									>
										<defs>
											<linearGradient id="stock-area-fill" x1="0" x2="0" y1="0" y2="1">
												<stop offset="0%" stopColor="#f43f5e" stopOpacity="0.22" />
												<stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
											</linearGradient>
											<linearGradient id="stock-line-stroke" x1="0" x2="1" y1="0" y2="0">
												<stop offset="0%" stopColor="#0f172a" />
												<stop offset="100%" stopColor="#ef4444" />
											</linearGradient>
										</defs>

										{[0, 1, 2, 3].map((row) => (
											<line
												key={row}
												x1="0"
												x2={chartWidth}
												y1={(chartHeight / 3) * row}
												y2={(chartHeight / 3) * row}
												stroke="#e2e8f0"
												strokeDasharray="5 9"
											/>
										))}

										<path d={areaPath} fill="url(#stock-area-fill)" />
										<path
											d={linePath}
											fill="none"
											stroke="url(#stock-line-stroke)"
											strokeWidth="5"
											strokeLinecap="round"
										/>
										<circle cx={chartWidth} cy="14" r="0" fill="#ef4444" />
									</svg>

									<div className="mt-3 grid grid-cols-3 gap-3 text-sm text-slate-500">
										<div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
											<p>시가</p>
											<p className="mt-1 font-bold text-slate-900">{MOCK_STOCK.open}원</p>
										</div>
										<div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
											<p>저가</p>
											<p className="mt-1 font-bold text-slate-900">{MOCK_STOCK.low}원</p>
										</div>
										<div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
											<p>고가</p>
											<p className="mt-1 font-bold text-slate-900">{MOCK_STOCK.high}원</p>
										</div>
									</div>
								</div>
							</div>

							<div className="grid gap-5 lg:grid-cols-2">
								<div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
									<div className="flex items-center justify-between">
										<h3 className="text-xl font-black tracking-[-0.03em] text-slate-950">
											투자 포인트
										</h3>
										<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
											오늘의 체크
										</span>
									</div>

									<div className="mt-5 space-y-3">
										{INVESTMENT_POINTS.map((point, index) => (
											<div
												key={`${point}-${index}`}
												className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700"
											>
												<p className="font-semibold text-slate-950">Point {index + 1}</p>
												<p className="mt-1">{point}</p>
											</div>
										))}
									</div>
								</div>

								<div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
									<div className="flex items-center justify-between">
										<h3 className="text-xl font-black tracking-[-0.03em] text-slate-950">
											시장 메모
										</h3>
										<Info className="h-4 w-4 text-slate-400" />
									</div>

									<div className="mt-5 grid gap-3 sm:grid-cols-2">
										{MARKET_NOTES.map((note) => (
											<div key={note.label} className="rounded-2xl bg-slate-50 p-4">
												<p className="text-sm text-slate-500">{note.label}</p>
												<p className={`mt-2 text-xl font-black tracking-[-0.03em] ${note.accent}`}>
													{note.value}
												</p>
											</div>
										))}
									</div>
								</div>
							</div>

							<div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-xl font-black tracking-[-0.03em] text-slate-950">
											최근 뉴스
										</h3>
										<p className="mt-1 text-sm text-slate-500">
											실제 기사 대신 화면 검증용 템프 데이터입니다.
										</p>
									</div>
									<button
										type="button"
										className="text-sm font-semibold text-slate-500 transition hover:text-slate-900"
									>
										모두 보기
									</button>
								</div>

								<div className="mt-5 space-y-3">
									{NEWS_ITEMS.map((item) => (
										<button
											key={`${item.source}-${item.time}-${item.title}`}
											type="button"
											className="flex w-full items-start justify-between rounded-[22px] border border-slate-200 px-5 py-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
										>
											<div>
												<p className="text-base font-semibold leading-6 text-slate-900">
													{item.title}
												</p>
												<p className="mt-2 text-sm text-slate-500">
													{item.source} · {item.time}
												</p>
											</div>
											<ChevronRight className="mt-1 h-4 w-4 text-slate-400" />
										</button>
									))}
								</div>
							</div>
						</div>

						<div className="space-y-5">
							<div className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_24px_60px_rgba(15,23,42,0.24)]">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-semibold text-white/60">주문 패널</p>
										<h3 className="mt-2 text-2xl font-black tracking-[-0.04em]">
											빠른 주문 미리보기
										</h3>
									</div>
									<div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/70">
										Template
									</div>
								</div>

								<div className="mt-6 grid grid-cols-2 gap-3">
									<button
										type="button"
										className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-950"
									>
										매수
									</button>
									<button
										type="button"
										className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold text-white/80"
									>
										매도
									</button>
								</div>

								<div className="mt-6 space-y-4">
									<div className="rounded-[22px] bg-white/8 p-4">
										<p className="text-sm text-white/60">주문 가격</p>
										<p className="mt-2 text-3xl font-black tracking-[-0.05em]">218,500원</p>
									</div>

									<div className="grid grid-cols-2 gap-3 text-sm">
										<div className="rounded-[22px] bg-white/8 p-4">
											<p className="text-white/60">수량</p>
											<p className="mt-2 text-xl font-bold">8주</p>
										</div>
										<div className="rounded-[22px] bg-white/8 p-4">
											<p className="text-white/60">예상 금액</p>
											<p className="mt-2 text-xl font-bold">1,748,000원</p>
										</div>
									</div>

									<div className="rounded-[22px] bg-white/8 p-4 text-sm text-white/80">
										<div className="flex items-center justify-between">
											<span>주문 가능 금액</span>
											<span className="font-semibold text-white">12,400,000원</span>
										</div>
										<div className="mt-3 flex items-center justify-between">
											<span>수수료 포함</span>
											<span className="font-semibold text-white">1,749,020원</span>
										</div>
									</div>
								</div>

								<button
									type="button"
									className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[22px] bg-rose-500 px-5 py-4 text-base font-bold text-white transition hover:bg-rose-400"
								>
									<WalletCards className="h-4 w-4" />
									매수하기
								</button>
							</div>

							<div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-xl font-black tracking-[-0.03em] text-slate-950">
											호가 요약
										</h3>
										<p className="mt-1 text-sm text-slate-500">
											토스식 간결한 주문 감각을 위한 템프 구성
										</p>
									</div>
									<Clock3 className="h-4 w-4 text-slate-400" />
								</div>

								<div className="mt-5 space-y-3">
									{ORDER_BOOK.map((item) => {
										const isSell = item.side === 'sell';

										return (
											<div
												key={`${item.side}-${item.price}`}
												className="rounded-[22px] bg-slate-50 p-4"
											>
												<div className="flex items-center justify-between gap-3 text-sm">
													<div>
														<p
															className={`font-bold ${isSell ? 'text-rose-500' : 'text-blue-500'}`}
														>
															{item.price}원
														</p>
														<p className="mt-1 text-slate-500">수량 {item.volume}</p>
													</div>
													<div className="w-[48%]">
														<div className="h-2 rounded-full bg-white">
															<div
																className={`h-2 rounded-full ${isSell ? 'bg-rose-400' : 'bg-blue-400'}`}
																style={{ width: `${item.strength}%` }}
															/>
														</div>
														<p className="mt-2 text-right text-xs font-semibold text-slate-500">
															체결 비중 {item.strength}%
														</p>
													</div>
												</div>
											</div>
										);
									})}
								</div>
							</div>

							<div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
								<div className="flex items-center justify-between">
									<h3 className="text-xl font-black tracking-[-0.03em] text-slate-950">
										같이 보는 종목
									</h3>
									<button
										type="button"
										className="text-sm font-semibold text-slate-500 transition hover:text-slate-900"
									>
										더 보기
									</button>
								</div>

								<div className="mt-5 space-y-3">
									{RELATED_STOCKS.map((item) => (
										<div
											key={item.name}
											className="flex items-center justify-between rounded-[22px] bg-slate-50 px-4 py-4"
										>
											<div>
												<p className="font-semibold text-slate-900">{item.name}</p>
												<p className="mt-1 text-sm text-slate-500">{item.price}원</p>
											</div>
											<div
												className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold ${
													item.positive ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'
												}`}
											>
												{item.positive ? (
													<ArrowUpRight className="h-4 w-4" />
												) : (
													<ArrowDownRight className="h-4 w-4" />
												)}
												{item.changeRate}
											</div>
										</div>
									))}
								</div>
							</div>

							<div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-500">
								<p className="font-semibold text-slate-700">
									Supabase status: {isConnected ? 'connected' : 'not connected'}
								</p>
								<p className="mt-2 break-all">{supabaseStatus.msg}</p>
								<p className="mt-3">Preview rows: {previewCount}</p>
							</div>
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}
