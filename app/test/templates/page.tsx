import LeftSection from '@/components/test-template/LeftSection';
import RightSection from '@/components/test-template/RightSection';
import { ensureKisAccessToken, getCachedKisAccessToken } from '@/lib/kis-auth';

export default async function TemplatePage() {
	let tokenStatus = 'Token has not been issued yet.';

	try {
		// 마운트마다 토큰 체크
		const existingToken = getCachedKisAccessToken();
		const token = await ensureKisAccessToken();

		tokenStatus = existingToken
			? 'Using the cached access token.'
			: `Issued a new access token. Expires at: ${new Date(token.expiresAt).toLocaleString('ko-KR')}`;
	} catch (error) {
		tokenStatus =
			error instanceof Error ? error.message : 'Unknown error occurred while issuing the token.';
	}

	return (
		<div className="flex min-h-[calc(100vh-72px)] w-full gap-[20px] p-6 text-black">
			<section className="flex-[1] rounded-[15px] bg-white p-[30px] shadow-xl">
				<LeftSection tokenStatus={tokenStatus} />
			</section>

			<section className="flex-[4] rounded-[15px] bg-white p-[30px] shadow-xl">
				<RightSection />
			</section>
		</div>
	);
}
