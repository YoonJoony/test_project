import { ArrowUpRight, Bell, BookmarkPlus, ChevronRight } from 'lucide-react';

import type { StockSummary } from '@/features/stocks/display/types';

type StockHeroSectionProps = {
	stock: StockSummary;
	isConnected: boolean;
};

export default function StockHeroSection({ stock, isConnected }: StockHeroSectionProps) {
	return (
		<section className="overflow-hidden rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_58%,#eef2ff_100%)] p-7 max-[500px]:p-4 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
			<div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
				<div className="flex-1">
					<div className="flex flex-wrap items-center gap-2">
						<span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
							{stock.market}
						</span>
						<span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
							{stock.code}
						</span>
						<span
							className={`rounded-full px-3 py-1 text-xs font-semibold ${
								isConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
							}`}
						>
							{isConnected ? '연결 확인 완료' : '데모 모드'}
						</span>
					</div>

					<div className="mt-5 flex flex-wrap items-start justify-between gap-4">
						<div>
							<p className="text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-5xl">
								{stock.name}
							</p>
							<p className="mt-2 text-base text-slate-500">{stock.englishName}</p>

							<div className="mt-8 flex flex-wrap items-end gap-x-4 gap-y-3">
								<p className="text-[clamp(2.6rem,5vw,4.6rem)] font-black tracking-[-0.08em] text-slate-950">
									{stock.price}
									<span className="ml-2 text-2xl font-bold text-slate-500">원</span>
								</p>
								<div className="pb-2">
									<div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-2 text-sm font-bold text-rose-600">
										<ArrowUpRight className="h-4 w-4" />
										{stock.changeAmount} ({stock.changeRate})
									</div>
									<p className="mt-3 text-sm text-slate-500">{stock.afterHoursText}</p>
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
									{stock.low}원 - {stock.high}원
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
								<p className="mt-1 font-bold text-slate-900">{stock.open}원</p>
							</div>
							<div className="rounded-2xl bg-slate-50 p-4">
								<p className="text-slate-500">거래량</p>
								<p className="mt-1 font-bold text-slate-900">{stock.volume}</p>
							</div>
						</div>

						<div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-950 px-4 py-3 text-white">
							<div>
								<p className="text-xs uppercase tracking-[0.18em] text-white/60">TURNOVER</p>
								<p className="mt-1 text-lg font-bold">{stock.turnover}</p>
							</div>
							<ChevronRight className="h-4 w-4 text-white/70" />
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
