// apps/web/src/components/Header.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, User, TrendingUp, X } from 'lucide-react'; // X 아이콘 추가
import Link from 'next/link';

// 메뉴 데이터 구조 정의
const MENU_ITEMS = [
	{
		name: '차트',
		href: '/chart',
		sub: [
			{ name: '실시간 차트', href: '/stock/liveChart' },
			{ name: '업종별 시세', href: '/chart/marketByIndustry' },
			{ name: 'AI 예측 차트', href: '/chart/aiChart' },
		],
	},
	{
		name: '분석',
		href: '/analysis',
		sub: [
			{ name: '종목 분석', href: '/analysis/krChart' },
			{ name: '섹터 분석', href: '/analysis/osChart' },
			{ name: '재무 분석', href: '/analysis/marketByIndustry' },
		],
	},
	{
		name: '뉴스',
		href: '/news',
		sub: [
			{ name: '실시간 속보', href: '/news/krChart' },
			{ name: '인기 뉴스', href: '/news/osChart' },
			{ name: 'AI 요약', href: '/news/marketByIndustry' },
		],
	},
	{
		name: '도구',
		href: '/tools',
		sub: [
			{ name: 'AI 분석 트레이딩', href: '/tools/osChart' },
			{ name: '알림 설정', href: '/tools/marketByIndustry' },
		],
	},
	{
		name: '테스트',
		href: '/test',
		sub: [
			{ name: '테스트 템플릿', href: '/test/templates' },
			{ name: 'API 테스트', href: '/test/alarm' },
		],
	},
];
// 메뉴 아이콘 hover 애니메이션
const hoverScale = {
	scale: 1.1,
	transition: { type: 'spring', stiffness: 400, damping: 10 }, // 용수철 강도 조절
} as const;

export default function Header() {
	const [isSearchOpen, setIsSearchOpen] = useState(false);

	return (
		<header className="fixed top-0 w-full h-[72px] z-50 backdrop-blur-md bg-[#0f172a]/80 border-b border-white/5 px-8 py-4 flex items-center justify-between">
			{/* 🚀 좌측: 로고 (검색창이 열려도 고정) */}
			<Link href="/">
				<motion.div className="flex items-center gap-2 cursor-pointer group flex-shrink-0">
					<div className="p-2 bg-indigo-600 rounded-lg group-hover:rotate-12 transition-transform">
						<TrendingUp className="text-white w-6 h-6" />
					</div>
					<span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x hidden sm:block">
						StockAI
					</span>
				</motion.div>
			</Link>

			{/* 🎯 중앙 영역: flex-1을 주어 남는 공간을 모두 차지하게 함 */}
			<nav className="flex-1 mx-10 relative h-full flex justify-center items-center">
				{/* AnimationPresence -> 검색바 사라질때까지 메뉴바 안올라오게 하기위해 추가. mode="wait" */}
				<AnimatePresence mode="wait">
					{!isSearchOpen ? (
						<motion.ul
							key="menu"
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -8 }}
							transition={{ duration: 0.2 }}
							className="hidden md:flex gap-10 font-medium text-gray-400"
						>
							{MENU_ITEMS.map((item) => (
								<NavMenuItem key={item.name} item={item} />
							))}
						</motion.ul>
					) : (
						<motion.div
							key="search-bar"
							initial={{ width: '0%', opacity: 0.5 }}
							animate={{ width: '100%', opacity: 1, transition: { duration: 0.3 } }} // 이제 부모인 nav가 넓어서 꽉 찹니다.
							exit={{ width: '0%', opacity: 0, transition: { duration: 0.1 } }}
							className="relative flex items-center max-w-2xl w-full" // 너무 퍼지지 않게 max-w 설정
						>
							<Search className="absolute left-4 w-4 h-4 text-gray-400" />
							<input
								autoFocus
								className="bg-white/10 outline-none w-full text-sm py-2.5 pl-11 pr-12 rounded-full border border-white/10 focus:border-indigo-500/50 transition-all"
								placeholder="종목명 또는 뉴스 검색..."
							/>
							{/* 닫기 버튼 추가 */}
							<button
								onClick={() => setIsSearchOpen(false)}
								className="absolute right-3 p-1 hover:bg-white/10 rounded-full transition-colors"
							>
								<X className="w-4 h-4 text-gray-400" />
							</button>
						</motion.div>
					)}
				</AnimatePresence>
			</nav>

			{/* 🚀 우측 아이콘 섹션: flex-shrink-0으로 밀려나지 않게 고정 */}
			<div className="flex items-center gap-6 flex-shrink-0">
				<div className="w-5 h-5 flex items-center justify-center">
					<AnimatePresence mode="wait">
						{!isSearchOpen && (
							<motion.div
								key="search-icon"
								initial={{ opacity: 0, scale: 0.5 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.1 }}
								whileHover={{ scale: 1.1 }}
							>
								<Search
									className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer"
									onClick={() => setIsSearchOpen(true)}
								/>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
				<div className="relative">
					{/* 자연스러운 모션을 위해 tailwind의 hover:scale 대신 framer motion 사용 */}
					<motion.div whileHover={hoverScale}>
						<Bell className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
						<span className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full" />
					</motion.div>
				</div>
				<div className="w-9 h-9 rounded-full border border-white/20 overflow-hidden cursor-pointer hover:scale-110 transition-transform">
					<div className="w-full h-full bg-gradient-to-br from-gray-700 to-black flex items-center justify-center">
						<User className="w-5 h-5 text-gray-400" />
					</div>
				</div>
			</div>
		</header>
	);
}

function NavMenuItem({ item }: { item: (typeof MENU_ITEMS)[0] }) {
	const [isHovered, setIsHovered] = useState(false);
	const GAP = 12; // 세부 탭 간격 (px)

	return (
		<li
			className="relative h-full flex items-center"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<Link href={item.href} className="hover:text-white transition-colors py-2">
				{item.name}
			</Link>

			{/* 🚀 세부 탭 영역 (Dropdown) */}
			<AnimatePresence>
				{isHovered && (
					<motion.div
						initial={{ opacity: 0, y: 15 }}
						animate={{ opacity: 1, y: 10 }} // Header 아래 10px 위치
						exit={{ opacity: 0, y: 15 }}
						transition={{ duration: 0.2 }}
						className="absolute top-full left-1/2 -translate-x-1/2 min-w-max bg-[#1e293b]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden px-4"
						style={{ paddingTop: GAP * 2, paddingBottom: GAP * 2 }} // 위아래 패딩은 간격의 2배
					>
						<div className="flex flex-col" style={{ gap: GAP }}>
							{item.sub.map((subItem) => (
								// eslint-disable-next-line react/jsx-key
								<Link
									href={subItem.href}
									className="px-[12px] py-2 text-left text-gray-200 hover:text-white hover:bg-white/5 rounded-md transition-all whitespace-nowrap text-[13px] font-normal"
								>
									{subItem.name}
								</Link>
							))}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</li>
	);
}
