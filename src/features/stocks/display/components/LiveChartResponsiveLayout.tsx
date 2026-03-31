'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { PanelLeftOpen } from 'lucide-react';
import { useEffect, useState } from 'react';

import RightSection from '@/features/stocks/display/components/RightSection';
import LeftSection from '@/features/stocks/search/components/LeftSection';

const COLLAPSE_BREAKPOINT = 1540;

const sectionTransition = {
	duration: 0.32,
	ease: [0.22, 1, 0.36, 1] as const,
};

type LiveChartResponsiveLayoutProps = {
	tokenStatus: {
		status?: boolean;
		msg?: string;
	};
	supabaseStatus: {
		status?: boolean;
		msg?: string;
	};
	stockMasterRows: Array<{
		mksc_shrn_iscd: string | null;
		stnd_iscd: string | null;
	}>;
};

export default function LiveChartResponsiveLayout({
	tokenStatus,
	supabaseStatus,
	stockMasterRows,
}: LiveChartResponsiveLayoutProps) {
	const [isCompact, setIsCompact] = useState(false);
	const [isLeftOpen, setIsLeftOpen] = useState(false);

	useEffect(() => {
		function syncViewportLayout() {
			const nextCompact = window.innerWidth < COLLAPSE_BREAKPOINT;

			setIsCompact(nextCompact);

			if (!nextCompact) {
				setIsLeftOpen(false);
			}
		}

		syncViewportLayout();
		window.addEventListener('resize', syncViewportLayout);

		return () => window.removeEventListener('resize', syncViewportLayout);
	}, []);

	return (
		<div className="relative flex h-[calc(100vh-72px)] w-full gap-[20px] overflow-hidden p-6 text-black">
			<AnimatePresence initial={false}>
				{!isCompact && (
					<motion.section
						key="left-section"
						initial={{ opacity: 0, x: -48 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -80 }}
						transition={sectionTransition}
						className="flex h-full min-h-0 flex-[1] rounded-[15px] bg-white p-[10px] shadow-xl"
					>
						<LeftSection tokenStatus={tokenStatus} />
					</motion.section>
				)}
			</AnimatePresence>

			<section
				className={`relative flex h-full min-h-0 rounded-[15px] bg-white p-[30px] max-[500px]:p-[10px] shadow-xl ${
					isCompact ? 'flex-1' : 'flex-[3]'
				}`}
			>
				<AnimatePresence initial={false}>
					{isCompact && !isLeftOpen && (
						<motion.button
							key="open-left-section"
							type="button"
							initial={{ opacity: 0, x: -16 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -16 }}
							transition={sectionTransition}
							onClick={() => setIsLeftOpen(true)}
							className="absolute left-3 top-3 z-30 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-[0_18px_35px_rgba(15,23,42,0.28)] transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
							aria-label="왼쪽 패널 열기"
						>
							<PanelLeftOpen className="h-5 w-5" />
						</motion.button>
					)}
				</AnimatePresence>

				<div className={`w-full`}>
					<RightSection supabaseStatus={supabaseStatus} stockMasterRows={stockMasterRows} />
				</div>

				<AnimatePresence initial={false}>
					{isCompact && isLeftOpen && (
						<>
							<motion.button
								key="left-section-backdrop"
								type="button"
								aria-label="왼쪽 패널 닫기"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={sectionTransition}
								onClick={() => setIsLeftOpen(false)}
								className="absolute inset-0 z-20 bg-slate-950/24"
							/>

							<motion.section
								key="left-section-drawer"
								initial={{ opacity: 0, x: -80 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -80 }}
								transition={sectionTransition}
								className="absolute left-0 top-0 z-30 flex h-full min-h-0 w-[min(420px,calc(100%-32px))] rounded-[15px] bg-white p-[10px] shadow-[0_28px_55px_rgba(15,23,42,0.28)]"
							>
								<LeftSection tokenStatus={tokenStatus} />
							</motion.section>
						</>
					)}
				</AnimatePresence>
			</section>
		</div>
	);
}
