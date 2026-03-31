import { Clock3, WalletCards } from 'lucide-react';

import type { OrderBookItem } from '@/features/stocks/display/types';

type OrderPanelSectionProps = {
	orderBook: OrderBookItem[];
};

export default function OrderPanelSection({ orderBook }: OrderPanelSectionProps) {
	return (
		<div className="space-y-5">
			<div className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_24px_60px_rgba(15,23,42,0.24)]">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm font-semibold text-white/60">주문 패널</p>
						<h3 className="mt-2 text-2xl font-black tracking-[-0.04em]">빠른 주문 미리보기</h3>
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
						<h3 className="text-xl font-black tracking-[-0.03em] text-slate-950">호가 요약</h3>
						<p className="mt-1 text-sm text-slate-500">토스식 간결한 주문 감각을 위한 템프 구성</p>
					</div>
					<Clock3 className="h-4 w-4 text-slate-400" />
				</div>

				<div className="mt-5 space-y-3">
					{orderBook.map((item) => {
						const isSell = item.side === 'sell';

						return (
							<div key={`${item.side}-${item.price}`} className="rounded-[22px] bg-slate-50 p-4">
								<div className="flex items-center justify-between gap-3 text-sm">
									<div>
										<p className={`font-bold ${isSell ? 'text-rose-500' : 'text-blue-500'}`}>
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
		</div>
	);
}
