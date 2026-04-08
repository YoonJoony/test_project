import type { ReactNode } from 'react';

import { warmKisSession } from '@/lib/kis-session';

type StocksLayoutProps = {
	children: ReactNode;
};

export const dynamic = 'force-dynamic';

export default async function StocksLayout({ children }: StocksLayoutProps) {
	await warmKisSession();

	return children;
}
