'use client';

import { motion } from 'framer-motion';

export default function FadeIn({ children }: { children: React.ReactNode }) {
	return (
		<motion.main
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
			className="relative h-screen w-full overflow-hidden pt-[72px]"
		>
			{children}
		</motion.main>
	);
}
