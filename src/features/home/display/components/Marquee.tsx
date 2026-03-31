// apps/web/src/components/Marquee.tsx
'use client';
import { motion } from 'framer-motion';

const CARDS = [
	{ type: 'news', title: '엔비디아 역대 최고가 경신', desc: 'AI 반도체 수요 폭증...' },
	{ type: 'chart', name: 'AAPL', price: '192.53', change: '+1.2%' },
	{ type: 'news', title: '금리 동결 전망 우세', desc: '연준의 다음 행보는?' },
	{ type: 'chart', name: 'TSLA', price: '175.22', change: '-2.4%' },
	// 반복을 위해 데이터 복사 필요
];

export default function Marquee() {
	return (
		<div className="w-full overflow-hidden py-10 border-y border-white/5">
			<motion.div
				className="flex"
				animate={{ x: [0, -1035] }} // 카드 너비와 마진 합산만큼 이동
				transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
			>
				{[...CARDS, ...CARDS].map((card, i) => (
					<div
						key={i}
						className="flex-shrink-0 w-[300px] h-[180px] mx-[20px] rounded-[15px] p-6 bg-white/5 border border-white/10 glassmorphism hover:scale-105 transition-transform"
					>
						{card.type === 'news' ? (
							<div>
								<span className="text-xs text-pink-400 font-bold uppercase">News</span>
								<h3 className="mt-2 font-bold line-clamp-2">{card.title}</h3>
								<p className="text-sm text-gray-400 mt-2">{card.desc}</p>
							</div>
						) : (
							<div>
								<span className="text-xs text-indigo-400 font-bold uppercase">Chart</span>
								<h3 className="mt-2 text-2xl font-black">{card.name}</h3>
								<div className="flex justify-between items-end mt-4">
									<span className="text-xl font-mono">${card.price}</span>
									<span
										className={card.change?.startsWith('+') ? 'text-green-400' : 'text-red-400'}
									>
										{card.change}
									</span>
								</div>
							</div>
						)}
					</div>
				))}
			</motion.div>
		</div>
	);
}
