import { Info, ChevronRight } from 'lucide-react';

import type { MarketNoteItem, NewsItem } from '@/features/stocks/display/types';

type StockInsightsSectionProps = {
	investmentPoints: string[];
	marketNotes: MarketNoteItem[];
	newsItems: NewsItem[];
};

export default function StockInsightsSection({
	investmentPoints,
	marketNotes,
	newsItems,
}: StockInsightsSectionProps) {
	return (
		<div className="space-y-5">
			<div className="grid gap-5 lg:grid-cols-2">
				<div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
					<div className="flex items-center justify-between">
						<h3 className="text-xl font-black tracking-[-0.03em] text-slate-950">투자 포인트</h3>
						<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
							오늘의 체크
						</span>
					</div>

					<div className="mt-5 space-y-3">
						{investmentPoints.map((point, index) => (
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
						<h3 className="text-xl font-black tracking-[-0.03em] text-slate-950">시장 메모</h3>
						<Info className="h-4 w-4 text-slate-400" />
					</div>

					<div className="mt-5 grid gap-3 sm:grid-cols-2">
						{marketNotes.map((note) => (
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
						<h3 className="text-xl font-black tracking-[-0.03em] text-slate-950">최근 뉴스</h3>
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
					{newsItems.map((item) => (
						<button
							key={`${item.source}-${item.time}-${item.title}`}
							type="button"
							className="flex w-full items-start justify-between rounded-[22px] border border-slate-200 px-5 py-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
						>
							<div>
								<p className="text-base font-semibold leading-6 text-slate-900">{item.title}</p>
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
	);
}
