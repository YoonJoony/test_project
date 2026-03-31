// apps/web/src/app/page.tsx
'use client';

import Main from '@/features/home/search/components/Main';
import Marquee from '@/features/home/display/components/Marquee';
import FadeIn from '@/shared/layout/Main';

export default function HomePage() {
	return (
		<>
			<FadeIn>
				<Main />
				<Marquee />
			</FadeIn>
		</>
	);
}
