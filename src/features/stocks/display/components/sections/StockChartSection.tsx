import type { StatItem, StockSummary } from '@/features/stocks/display/types';

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

type StockChartSectionProps = {
	stock: StockSummary;
	stats: StatItem[];
	chartTabs: readonly string[];
	activeChartTab: string;
	chartPoints: number[];
};

export default function StockChartSection({
	stock,
	stats,
	chartTabs,
	activeChartTab,
	chartPoints,
}: StockChartSectionProps) {
	const chartWidth = 760;
	const chartHeight = 220;
	const linePath = buildLinePath(chartPoints, chartWidth, chartHeight);
	const areaPath = buildAreaPath(chartPoints, chartWidth, chartHeight);

	return (
		<div className="space-y-5">
			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{stats.map((item) => (
					<MiniStatCard key={item.label} {...item} />
				))}
			</div>

			<div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<p className="text-sm font-semibold text-slate-500">가격 흐름</p>
						<p className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950">
							{stock.price}원
						</p>
						<p className="mt-2 text-sm font-semibold text-rose-500">
							전일 대비 {stock.changeAmount} 상승
						</p>
					</div>

					<div className="flex flex-wrap gap-2">
						{chartTabs.map((tab) => {
							const active = tab === activeChartTab;

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
							<p className="mt-1 font-bold text-slate-900">{stock.open}원</p>
						</div>
						<div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
							<p>저가</p>
							<p className="mt-1 font-bold text-slate-900">{stock.low}원</p>
						</div>
						<div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
							<p>고가</p>
							<p className="mt-1 font-bold text-slate-900">{stock.high}원</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
