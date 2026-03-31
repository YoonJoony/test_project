import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

import type { RelatedItem } from '@/features/stocks/display/types';

type RelatedStocksSectionProps = {
	relatedStocks: RelatedItem[];
};

export default function RelatedStocksSection({ relatedStocks }: RelatedStocksSectionProps) {
	return (
		<div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
			<div className="flex items-center justify-between">
				<h3 className="text-xl font-black tracking-[-0.03em] text-slate-950">같이 보는 종목</h3>
				<button
					type="button"
					className="text-sm font-semibold text-slate-500 transition hover:text-slate-900"
				>
					더 보기
				</button>
			</div>

			<div className="mt-5 space-y-3">
				{relatedStocks.map((item) => (
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
	);
}
