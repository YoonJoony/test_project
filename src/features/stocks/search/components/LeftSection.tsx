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

// 서버 응답 타입은 성공/실패 모양이 다르기 때문에,
// 화면에서 공통으로 쓸 수 있는 리스트 아이템 형태로 한 번 정규화합니다.
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

// 추천 영역 우측 상단 시각 표시용 포맷입니다.
function formatCurrentTime(date: Date) {
	return new Intl.DateTimeFormat('ko-KR', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	}).format(date);
}

// 종목 아이콘은 별도 이미지 대신 텍스트 이니셜을 사용합니다.
// 영문은 앞 2글자, 한글은 앞 1글자를 사용하고 이름이 비어 있으면 코드로 대체합니다.
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

// KIS 응답 가격은 문자열일 수 있으므로 화면 노출 전에 천 단위 구분자를 붙입니다.
function formatPrice(value: string) {
	const parsed = Number.parseInt(value.replace(/[^0-9-]/g, ''), 10);

	if (!Number.isFinite(parsed)) {
		return value || '-';
	}

	return new Intl.NumberFormat('ko-KR').format(parsed);
}

// 등락률도 API 응답 포맷이 제각각일 수 있어 부호와 % 기호를 보정합니다.
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

// 추천 검색 UI는 순위/아이콘/가격 포맷이 필요하므로,
// 서버 응답을 화면 전용 카드 데이터로 변환합니다.
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

	// 검색 입력값, 검색 결과 목록, 추천 종목 목록 등
	// 좌측 패널 전체 상호작용에 필요한 로컬 상태입니다.
	const [stockCode, setStockCode] = useState('');
	const [items, setItems] = useState<QuoteItem[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [suggestedStocks, setSuggestedStocks] = useState<PopularStockItem[]>(POPULAR_STOCKS);
	const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
	const [selectedChartTab, setSelectedChartTab] = useState<(typeof chartTabs)[number]>('전체');
	const [isSearchExpanded, setIsSearchExpanded] = useState(true);
	const [currentTime, setCurrentTime] = useState(() => formatCurrentTime(new Date()));

	// 검색창이 펼쳐졌을 때와 접혔을 때 안내 문구를 다르게 보여줍니다.
	const searchPlaceholder = useMemo(() => {
		if (isSearchExpanded) {
			return '종목명이나 종목코드를 입력해주세요.';
		}

		return '종목 검색';
	}, [isSearchExpanded]);

	// 공백 제거 후 실제 검색에 사용할 값입니다.
	const normalizedSearchKeyword = stockCode.trim();

	// 숫자만 입력되면 "종목 코드 검색", 문자가 섞이면 "종목명 기반 추천 검색"으로 간주합니다.
	const isNameSearchMode =
		normalizedSearchKeyword.length > 0 && !/^\d+$/.test(normalizedSearchKeyword);
	const suggestionTitle = isNameSearchMode ? '연관 검색 종목' : '빠른 검색';
	const suggestionFooterTitle = isNameSearchMode
		? '시가총액 상위 연관 종목'
		: '인기있는 주식 골라보기';

	// 추천 카드 영역에 현재 시각을 보여주기 위해 1분마다 갱신합니다.
	useEffect(() => {
		const timer = window.setInterval(() => {
			setCurrentTime(formatCurrentTime(new Date()));
		}, 60000);

		return () => window.clearInterval(timer);
	}, []);

	// 검색창이 펼쳐질 때 애니메이션이 끝난 뒤 입력 포커스를 줍니다.
	// 바로 focus하면 모션과 충돌해 어색해질 수 있어 약간 지연시킵니다.
	useEffect(() => {
		if (!isSearchExpanded) {
			return;
		}

		const timeout = window.setTimeout(() => {
			inputRef.current?.focus();
		}, 220);

		return () => window.clearTimeout(timeout);
	}, [isSearchExpanded]);

	// 펼쳐진 검색 패널 바깥을 누르면 검색 패널을 접습니다.
	// 데스크톱 드롭다운처럼 동작하게 만드는 UI 제어 로직입니다.
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

	// 종목명 검색 추천 흐름:
	// 1. 사용자가 입력을 멈추면 250ms 뒤 검색 시작
	// 2. /api/stocks/search 에서 이름 기준 후보 종목을 조회
	// 3. 후보 코드들로 /api/kis/price 를 호출해 현재가/등락률을 보강
	// 4. 두 응답을 합쳐 추천 목록 UI 상태를 갱신
	useEffect(() => {
		if (!isSearchExpanded || !normalizedSearchKeyword || /^\d+$/.test(normalizedSearchKeyword)) {
			// 검색창이 닫혔거나, 입력이 없거나, 숫자 코드 검색 모드면
			// 연관 종목 조회 대신 기본 인기 종목 목록을 보여줍니다.

			async function loadTopVolumeStocks() {
				const topVolumnStockResponse = await fetch(`/api/stocks/volume-rank`, {
					method: 'GET',
					cache: 'no-store',
				});

				setSuggestedStocks(POPULAR_STOCKS);
				setIsSuggestionLoading(false);
			}

			void loadTopVolumeStocks();
			return;
		}

		// 입력이 빠르게 바뀌는 동안 이전 요청 결과가 뒤늦게 덮어쓰지 않도록 방지합니다.
		let isCancelled = false;
		const timeout = window.setTimeout(async () => {
			setIsSuggestionLoading(true);

			try {
				// 1차 호출: 내부 API를 통해 종목명과 가장 잘 맞는 종목 코드 후보를 가져옵니다.
				// 브라우저에서 바로 Supabase를 호출하지 않고 서버 라우트를 거쳐 검색 규칙을 통일합니다.
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
					// 이름 매칭 결과가 없으면 추천 영역만 비워서 "검색 결과 없음" 상태를 보여줍니다.
					if (!isCancelled) {
						setSuggestedStocks([]);
					}

					return;
				}

				// 2차 호출: 1차에서 받은 종목 코드들로 현재가/등락률을 조회합니다.
				// 검색 API는 "무슨 종목인지", 가격 API는 "지금 얼마인지" 역할을 분리한 구조입니다.
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
					// 최종적으로 화면 전용 형태로 매핑한 뒤 추천 목록을 교체합니다.
					setSuggestedStocks(mapPreviewStocksToPopular(pricePayload.output));
				}
			} catch {
				// 두 단계 중 어느 하나라도 실패하면 부분 상태를 남기지 않고 비움 상태로 정리합니다.
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
			// effect 재실행 시 이전 타이머/요청 결과 반영을 막습니다.
			isCancelled = true;
			window.clearTimeout(timeout);
		};
	}, [isSearchExpanded, normalizedSearchKeyword]);

	// 검색 제출 흐름:
	// 1. 현재 입력값을 quote API로 전달
	// 2. 서버가 KIS 응답을 받아 success/failure payload로 반환
	// 3. 응답을 화면 리스트 아이템으로 변환해 최신 결과를 맨 앞에 추가
	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const trimmedCode = stockCode.trim();

		// 빈 입력이거나 이미 요청 중이면 중복 호출을 막습니다.
		if (!trimmedCode || isLoading) {
			return;
		}

		// 제출이 시작되면 추천 패널을 접고 로딩 상태를 켭니다.
		setIsSearchExpanded(false);
		setIsLoading(true);

		try {
			// 현재 입력값을 code 파라미터로 그대로 전달합니다.
			// 실제 조회/검증 책임은 서버 라우트가 가집니다.
			const response = await fetch(`/api/kis/quote?code=${encodeURIComponent(trimmedCode)}`, {
				method: 'GET',
				cache: 'no-store',
			});

			const payload = (await response.json()) as QuotePayload;
			const requestId = `${trimmedCode}-${Date.now()}`;

			// 서버 응답 모양을 공통 아이템 형태로 바꿔 최근 검색 결과 맨 앞에 쌓습니다.
			setItems((prev) => [createQuoteItem(payload, requestId), ...prev]);
			setStockCode('');
		} catch (error) {
			// 네트워크 자체가 실패한 경우에도 실패 결과를 리스트에 남겨 사용자가 원인을 볼 수 있게 합니다.
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
			// 성공/실패와 무관하게 요청 종료 후 로딩 상태를 해제합니다.
			setIsLoading(false);
		}
	}

	// 검색창 포커스/토글 관련 보조 핸들러입니다.
	function handleOpenSearch() {
		setIsSearchExpanded(true);
	}

	function handleToggleSearch() {
		setIsSearchExpanded((prev) => !prev);
	}

	function handleSearchBarClick() {
		setIsSearchExpanded((prev) => !prev);
	}

	// 추천 종목을 누르면 코드를 입력창에 채우고 바로 다음 검색으로 이어지게 합니다.
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
				/* 첫 진입 시 서버에서 토큰을 새로 발급했다면 그 상태를 안내용으로 보여줍니다. */
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
				{/* 검색창 자체는 애니메이션이 있는 확장형 UI이고,
				    제출은 form submit, 추천 조회는 입력값 변화 effect가 담당합니다. */}
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
						/* 펼쳐진 상태에서만 추천 종목 영역을 보여줍니다. */
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
					/* 검색 결과는 성공/실패를 모두 누적해서 보여주며, 가장 최근 요청이 위로 올라옵니다. */
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
