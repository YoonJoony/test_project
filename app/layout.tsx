// apps/web/src/app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import Header from '@/components/Header';
import Main from '@/components/common/Main';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="ko" className="dark">
			<body className={`${inter.className} bg-[#0f172a] text-white antialiased`}>
				<Header />
				{/* 페이지 이동 시 이 children 부분만 교체됩니다 */}
				<Main>{children}</Main>
			</body>
		</html>
	);
}
