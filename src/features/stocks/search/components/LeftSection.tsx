'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';

import type { StockPreviewPriceItem, StockSearchItem } from '@/features/stocks/search/types';

type LeftSectionProps = {
	tokenStatus: {
		status?: boolean;
		msg?: string;
	};
};

type VolumeRankRow = {
	hts_kor_isnm: string;
	data_rank: string;
	stck_prpr: string;
	vol_inrt: string;
	avrg_tr_pbmn: string;
};

type QuoteSuccessItem = {
	id: string;
	requestedCode: string;
	success: true;
	output: VolumeRankRow[];
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

type PopularStockItem = {
	rank: number;
	name: string;
	code: string;
	currentPrice: string;
	changeRate: string;
	iconLabel: string;
};

type SearchStocksResponse = {
	success: boolean;
	msg?: string;
	output: StockSearchItem[];
};

type StockPriceResponse = {
	success: boolean;
	msg?: string;
	output: StockPreviewPriceItem[];
};

const POPULAR_STOCKS: PopularStockItem[] = [
	{
		rank: 1,
		name: '삼성전자',
		code: '005930',
		currentPrice: '84,500',
		changeRate: '+2.34%',
		iconLabel: '삼',
	},
	{
		rank: 2,
		name: 'SK하이닉스',
		code: '000660',
		currentPrice: '218,500',
		changeRate: '+1.92%',
		iconLabel: 'SK',
	},
	{
		rank: 3,
		name: 'NAVER',
		code: '035420',
		currentPrice: '196,000',
		changeRate: '-0.48%',
		iconLabel: 'N',
	},
	{
		rank: 4,
		name: '카카오',
		code: '035720',
		currentPrice: '42,150',
		changeRate: '+3.17%',
		iconLabel: 'K',
	},
	{
		rank: 5,
		name: '현대차',
		code: '005380',
		currentPrice: '241,500',
		changeRate: '+0.86%',
		iconLabel: '현',
	},
];

function createQuoteItem(payload: QuotePayload, requestId: string): QuoteItem {
	if (payload.success) {
		return {
			id: requestId,
			requestedCode: payload.requestedCode,
			success: true,
			output: payload.output,
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

function formatCurrentTime(date: Date) {
	return new Intl.DateTimeFormat('ko-KR', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	}).format(date);
}

function getIconLabel(name: string, code: string) {
	const trimmedName = name.trim();

	if (!trimmedName) {
		return code.slice(0, 2);
	}

	if (/^[A-Za-z]/.test(trimmedName)) {
		return trimmedName.slice(0, 2).toUpperCase();
	}

	return trimmedName.slice(0, 1);
}

function formatPrice(value: string) {
	const parsed = Number.parseInt(value.replace(/[^0-9-]/g, ''), 10);

	if (!Number.isFinite(parsed)) {
		return value || '-';
	}

	return new Intl.NumberFormat('ko-KR').format(parsed);
}

function formatChangeRate(value: string) {
	const trimmedValue = value.trim();

	if (!trimmedValue) {
		return '0.00%';
	}

	const signedValue =
		trimmedValue.startsWith('-') || trimmedValue.startsWith('+')
			? trimmedValue
			: `+${trimmedValue}`;

	return signedValue.endsWith('%') ? signedValue : `${signedValue}%`;
}

function mapPreviewStocksToPopular(items: StockPreviewPriceItem[]) {
	return items.map((stock, index) => ({
		rank: index + 1,
		name: stock.name,
		code: stock.code,
		currentPrice: formatPrice(stock.currentPrice),
		changeRate: formatChangeRate(stock.changeRate),
		iconLabel: getIconLabel(stock.name, stock.code),
	}));
}

export default function LeftSection({ tokenStatus }: LeftSectionProps) {
	const chartTabs = ['전체', '국내', '해외'] as const;
	const searchSectionRef = useRef<HTMLElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const [stockCode, setStockCode] = useState('');
	const [items, setItems] = useState<QuoteItem[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [suggestedStocks, setSuggestedStocks] = useState<PopularStockItem[]>(POPULAR_STOCKS);
	const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
	const [selectedChartTab, setSelectedChartTab] = useState<(typeof chartTabs)[number]>('전체');
	const [isSearchExpanded, setIsSearchExpanded] = useState(true);
	const [currentTime, setCurrentTime] = useState(() => formatCurrentTime(new Date()));

	const searchPlaceholder = useMemo(() => {
		if (isSearchExpanded) {
			return '종목명이나 종목코드를 입력해 연관 종목을 찾아보세요';
		}

		return '종목 검색';
	}, [isSearchExpanded]);

	const normalizedSearchKeyword = stockCode.trim();
	const isNameSearchMode =
		normalizedSearchKeyword.length > 0 && !/^\d+$/.test(normalizedSearchKeyword);
	const suggestionTitle = isNameSearchMode ? '연관 검색 종목' : '빠른 검색';
	const suggestionFooterTitle = isNameSearchMode
		? '시가총액 상위 연관 종목'
		: '인기있는 주식 골라보기';

	useEffect(() => {
		const timer = window.setInterval(() => {
			setCurrentTime(formatCurrentTime(new Date()));
		}, 60000);

		return () => window.clearInterval(timer);
	}, []);

	useEffect(() => {
		if (!isSearchExpanded) {
			return;
		}

		const timeout = window.setTimeout(() => {
			inputRef.current?.focus();
		}, 220);

		return () => window.clearTimeout(timeout);
	}, [isSearchExpanded]);

	useEffect(() => {
		if (!isSearchExpanded) {
			return;
		}

		function handlePointerDown(event: MouseEvent) {
			if (!searchSectionRef.current?.contains(event.target as Node)) {
				setIsSearchExpanded(false);
			}
		}

		document.addEventListener('mousedown', handlePointerDown);

		return () => document.removeEventListener('mousedown', handlePointerDown);
	}, [isSearchExpanded]);

	useEffect(() => {
		if (!isSearchExpanded || !normalizedSearchKeyword || /^\d+$/.test(normalizedSearchKeyword)) {
			setSuggestedStocks(POPULAR_STOCKS);
			setIsSuggestionLoading(false);
			return;
		}

		let isCancelled = false;
		const timeout = window.setTimeout(async () => {
			setIsSuggestionLoading(true);

			try {
				const searchResponse = await fetch(
					`/api/stocks/search?q=${encodeURIComponent(normalizedSearchKeyword)}`,
					{
						method: 'GET',
						cache: 'no-store',
					},
				);
				const searchPayload = (await searchResponse.json()) as SearchStocksResponse;

				if (!searchResponse.ok || !searchPayload.success) {
					throw new Error(searchPayload.msg ?? 'Stock search request failed.');
				}

				const topItems = searchPayload.output.slice(0, 5);

				if (topItems.length === 0) {
					if (!isCancelled) {
						setSuggestedStocks([]);
					}

					return;
				}

				const priceResponse = await fetch('/api/kis/price', {
					method: 'POST',
					headers: {
						'content-type': 'application/json',
					},
					cache: 'no-store',
					body: JSON.stringify({
						items: topItems,
					}),
				});
				const pricePayload = (await priceResponse.json()) as StockPriceResponse;

				if (!priceResponse.ok || !pricePayload.success) {
					throw new Error(pricePayload.msg ?? 'Stock price request failed.');
				}

				if (!isCancelled) {
					setSuggestedStocks(mapPreviewStocksToPopular(pricePayload.output));
				}
			} catch {
				if (!isCancelled) {
					setSuggestedStocks([]);
				}
			} finally {
				if (!isCancelled) {
					setIsSuggestionLoading(false);
				}
			}
		}, 250);

		return () => {
			isCancelled = true;
			window.clearTimeout(timeout);
		};
	}, [isSearchExpanded, normalizedSearchKeyword]);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const trimmedCode = stockCode.trim();

		if (!trimmedCode || isLoading) {
			return;
		}

		setIsSearchExpanded(false);
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

	function handleOpenSearch() {
		setIsSearchExpanded(true);
	}

	function handleToggleSearch() {
		setIsSearchExpanded((prev) => !prev);
	}

	function handleSearchBarClick() {
		setIsSearchExpanded((prev) => !prev);
	}

	function handlePopularItemClick(code: string) {
		setStockCode(code);
		setIsSearchExpanded(true);
		inputRef.current?.focus();
	}

	function handleStockCodeChange(event: ChangeEvent<HTMLInputElement>) {
		setStockCode(event.target.value);
	}

	return (
		<div className="flex h-full w-full min-h-0 flex-col">
			<div className="my-4 flex items-center justify-between gap-3 px-4">
				<div className="flex items-center gap-3">
					<div className="flex items-center gap-1.5">
						<span className="h-7 w-2 rounded-full bg-slate-200" />
					</div>
					<div className="min-w-0">
						<p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">
							Live Search
						</p>
						<h2 className="text-[26px] font-black tracking-[-0.06em] text-slate-900">종목 검색</h2>
					</div>
				</div>
				<div className="inline-flex rounded-full bg-slate-100 p-1">
					{chartTabs.map((tab) => {
						const isActive = selectedChartTab === tab;

						return (
							<button
								key={tab}
								type="button"
								onClick={() => setSelectedChartTab(tab)}
								className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold transition ${
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

			{!tokenStatus.status && (
				<div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
						KIS Token
					</p>
					<p className="mt-2 text-sm text-emerald-900">{tokenStatus.msg}</p>
				</div>
			)}

			<motion.section
				ref={searchSectionRef}
				layout
				transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
				className={`mt-6 overflow-hidden rounded-[20px] ${
					isSearchExpanded ? 'bg-[#2c2c35] px-3 pb-4 pt-3' : 'bg-transparent'
				}`}
			>
				<form onSubmit={handleSubmit}>
					<motion.div
						layout
						onClick={handleSearchBarClick}
						transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
						className={`relative flex w-full items-center overflow-hidden rounded-[22px] ${
							isSearchExpanded
								? 'h-12 bg-[rgba(217,217,255,0.11)] pr-4'
								: 'h-14 bg-[#f3f5fa] pr-4 shadow-[0_16px_40px_rgba(15,23,42,0.08)]'
						}`}
					>
						<motion.button
							type="button"
							onClick={(event) => {
								event.stopPropagation();
								handleToggleSearch();
							}}
							initial={false}
							animate={{ opacity: 1, scale: 1 }}
							whileTap={{ scale: 0.96 }}
							className={`absolute left-4 top-1/2 -translate-y-1/2 text-sm ${
								isSearchExpanded ? 'text-slate-200' : 'text-slate-500'
							}`}
							aria-label="검색창 열기"
						>
							<Search className="h-4 w-4" />
						</motion.button>

						<input
							ref={inputRef}
							id="stock-code"
							value={stockCode}
							onChange={handleStockCodeChange}
							onClick={(event) => event.stopPropagation()}
							onFocus={handleOpenSearch}
							placeholder={searchPlaceholder}
							className={`w-full bg-transparent pl-14 text-sm outline-none ${
								isSearchExpanded
									? 'text-white placeholder:text-slate-400'
									: 'text-slate-900 placeholder:text-slate-400'
							}`}
						/>

						<AnimatePresence>
							{!isSearchExpanded && (
								<motion.span
									initial={{ opacity: 0, x: 8 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: 8 }}
									className="text-xs font-medium text-slate-400"
								/>
							)}
						</AnimatePresence>
					</motion.div>
				</form>

				<AnimatePresence>
					{isSearchExpanded && (
						<motion.div
							initial={{ opacity: 0, height: 0, y: -12 }}
							animate={{ opacity: 1, height: 'auto', y: 0 }}
							exit={{ opacity: 0, height: 0, y: -10 }}
							transition={{ duration: 0.28, delay: 0.12, ease: 'easeOut' }}
							className="overflow-hidden"
						>
							<div className="pt-5">
								<div className="flex items-center justify-between px-3 pt-3 text-sm">
									<p className="font-black tracking-[-0.02em] text-white">{suggestionTitle}</p>
									<p className="text-[13px] text-slate-400">오늘 {currentTime}</p>
								</div>

								<div className="mt-3 pb-10">
									{isSuggestionLoading ? (
										<div className="rounded-[18px] border border-white/10 bg-[rgba(217,217,255,0.08)] px-4 py-5 text-sm text-slate-300">
											연관 종목을 불러오는 중입니다...
										</div>
									) : suggestedStocks.length === 0 ? (
										<div className="rounded-[18px] border border-white/10 bg-[rgba(217,217,255,0.08)] px-4 py-5 text-sm text-slate-300">
											연관된 종목을 찾지 못했습니다.
										</div>
									) : (
										suggestedStocks.map((stock) => (
											<button
												key={stock.code}
												type="button"
												onClick={() => handlePopularItemClick(stock.code)}
												className="my-1.5 flex h-12 w-full items-center rounded-[16px] px-2.5 text-left transition hover:bg-[rgba(217,217,255,0.11)] focus:bg-[rgba(217,217,255,0.11)] focus:outline-none"
											>
												<span className="w-8 text-sm font-semibold text-slate-400">
													{stock.rank}
												</span>
												<span className="flex min-w-0 flex-1 items-center gap-3">
													<span className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-white/10 bg-[#3a3a46] text-sm font-bold text-white">
														{stock.iconLabel}
													</span>
													<span className="min-w-0">
														<span className="block truncate text-sm font-semibold text-white">
															{stock.name}
														</span>
														<span className="block truncate text-xs text-slate-400">
															{stock.code}
														</span>
													</span>
												</span>
												<span className="flex flex-col items-end">
													<span className="text-sm font-medium text-white">
														{stock.currentPrice}원
													</span>
													<span
														className={`text-xs ${
															stock.changeRate.startsWith('-') ? 'text-blue-300' : 'text-rose-300'
														}`}
													>
														{stock.changeRate}
													</span>
												</span>
											</button>
										))
									)}
								</div>
								<div className="mb-1 px-3 flex items-center justify-between">
									<p className="font-black tracking-[-0.02em] text-white">
										{suggestionFooterTitle}
									</p>
									<button
										type="button"
										className="text-sm font-medium text-slate-300 transition hover:text-white"
									>
										더 보기 &gt;
									</button>
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</motion.section>

			<div className="scrollbar-hidden mt-6 min-h-0 flex-1 space-y-3 overflow-y-auto">
				{items.length === 0 ? (
					<div className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-400">
						Search results will appear here.
					</div>
				) : (
					items.map((item) =>
						item.success ? (
							<div key={item.id} className="rounded-xl border border-slate-200 p-4">
								<div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
									{item.requestedCode}
								</div>
								<div className="space-y-3">
									{item.output.map((row, index) => (
										<div
											key={`${item.id}-${row.data_rank || index}`}
											className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700"
										>
											<p>hts_kor_isnm: {row.hts_kor_isnm || '-'}</p>
											<p>data_rank: {row.data_rank || '-'}</p>
											<p>stck_prpr: {row.stck_prpr || '-'}</p>
											<p>vol_inrt: {row.vol_inrt || '-'}</p>
											<p>avrg_tr_pbmn: {row.avrg_tr_pbmn || '-'}</p>
										</div>
									))}
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
