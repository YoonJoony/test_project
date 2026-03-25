'use client';

import { FormEvent, useState } from 'react';

type LeftSectionProps = {
	tokenStatus: {
		status?: boolean;
		msg?: string;
	};
};

type QuoteSuccessItem = {
	id: string;
	requestedCode: string;
	success: true;
	iscd_stat_cls_code: string;
	rprs_mrkt_kor_name: string;
	bstp_kor_isnm: string;
	stck_prpr: string;
	prdy_vrss: string;
};

type QuoteFailureItem = {
	id: string;
	requestedCode: string;
	success: false;
	msg_cd: string;
	msg1: string;
	output: unknown;
};

type QuoteItem = QuoteSuccessItem | QuoteFailureItem;
type QuotePayload = Omit<QuoteSuccessItem, 'id'> | Omit<QuoteFailureItem, 'id'>;

function createQuoteItem(payload: QuotePayload, requestId: string): QuoteItem {
	if (payload.success) {
		return {
			id: requestId,
			requestedCode: payload.requestedCode,
			success: true,
			iscd_stat_cls_code: payload.iscd_stat_cls_code,
			rprs_mrkt_kor_name: payload.rprs_mrkt_kor_name,
			bstp_kor_isnm: payload.bstp_kor_isnm,
			stck_prpr: payload.stck_prpr,
			prdy_vrss: payload.prdy_vrss,
		};
	}

	return {
		id: requestId,
		requestedCode: payload.requestedCode,
		success: false,
		msg_cd: payload.msg_cd,
		msg1: payload.msg1,
		output: payload.output,
	};
}

export default function LeftSection({ tokenStatus }: LeftSectionProps) {
	const chartTabs = ['전체', '국내', '해외'] as const;
	const [stockCode, setStockCode] = useState('');
	const [items, setItems] = useState<QuoteItem[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedChartTab, setSelectedChartTab] = useState<(typeof chartTabs)[number]>('전체');

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const trimmedCode = stockCode.trim();

		if (!trimmedCode || isLoading) {
			return;
		}

		setIsLoading(true);

		try {
			const response = await fetch(`/api/kis/quote?code=${encodeURIComponent(trimmedCode)}`, {
				method: 'GET',
				cache: 'no-store',
			});

			const payload = (await response.json()) as QuotePayload;
			const requestId = `${trimmedCode}-${Date.now()}`;

			setItems((prev) => [createQuoteItem(payload, requestId), ...prev]);
			setStockCode('');
		} catch (error) {
			const requestId = `${trimmedCode}-${Date.now()}`;
			const fallbackItem: QuoteFailureItem = {
				id: requestId,
				requestedCode: trimmedCode,
				success: false,
				msg_cd: 'FETCH_ERROR',
				msg1: error instanceof Error ? error.message : 'Unexpected client error occurred.',
				output: null,
			};

			setItems((prev) => [fallbackItem, ...prev]);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div>
			<div className="mb-4 flex items-center justify-between gap-3">
				<h2 className="text-lg font-bold text-slate-900">실시간 차트</h2>
				<div className="inline-flex rounded-full bg-slate-100 p-1">
					{chartTabs.map((tab) => {
						const isActive = selectedChartTab === tab;

						return (
							<button
								key={tab}
								type="button"
								onClick={() => setSelectedChartTab(tab)}
								className={`rounded-full px-4 py-1.5 text-sm font-semibold transition cursor-pointer ${
									isActive
										? 'bg-white text-slate-900 shadow-[0_2px_10px_rgba(15,23,42,0.12)]'
										: 'text-slate-500 hover:text-slate-700'
								}`}
								aria-pressed={isActive}
							>
								{tab}
							</button>
						);
					})}
				</div>
			</div>
			{!tokenStatus.status ? null : (
				<div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
						KIS Token
					</p>
					<p className="mt-2 text-sm text-emerald-900">{tokenStatus.msg}</p>
				</div>
			)}

			<form onSubmit={handleSubmit} className="mt-6">
				<label htmlFor="stock-code" className="mb-2 block text-sm font-semibold text-slate-800">
					Stock Code
				</label>
				<div className="flex gap-2">
					<input
						id="stock-code"
						value={stockCode}
						onChange={(event) => setStockCode(event.target.value)}
						placeholder="005930"
						className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
					/>
					<button
						type="submit"
						disabled={isLoading}
						className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
					>
						{isLoading ? 'Loading...' : 'Search'}
					</button>
				</div>
			</form>

			<div className="mt-6 space-y-3">
				{items.length === 0 ? (
					<div className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-400">
						Search results will appear here.
					</div>
				) : (
					items.map((item) =>
						item.success ? (
							<div key={item.id} className="rounded-xl border border-slate-200 p-4">
								<div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
									{item.requestedCode}
								</div>
								<div className="grid grid-cols-1 gap-2 text-sm text-slate-700">
									<p>iscd_stat_cls_code: {item.iscd_stat_cls_code || '-'}</p>
									<p>rprs_mrkt_kor_name: {item.rprs_mrkt_kor_name || '-'}</p>
									<p>bstp_kor_isnm: {item.bstp_kor_isnm || '-'}</p>
									<p>stck_prpr: {item.stck_prpr || '-'}</p>
									<p>prdy_vrss: {item.prdy_vrss || '-'}</p>
								</div>
							</div>
						) : (
							<div key={item.id} className="rounded-xl border border-rose-200 bg-rose-50 p-4">
								<div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">
									{item.requestedCode}
								</div>
								<div className="space-y-2 text-sm text-rose-900">
									<p>msg_cd: {item.msg_cd || '-'}</p>
									<p>msg1: {item.msg1 || '-'}</p>
									<pre className="overflow-x-auto rounded-lg bg-white/70 p-3 text-xs text-rose-800">
										{JSON.stringify(item.output ?? null, null, 2)}
									</pre>
								</div>
							</div>
						),
					)
				)}
			</div>
		</div>
	);
}
