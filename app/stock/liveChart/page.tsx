import LeftSection from '@/components/stock/LeftSection';
import RightSection from '@/components/stock/RightSection';
import { ensureKisAccessToken, getCachedKisAccessToken } from '@/lib/kis-auth';
import { getSupabaseServerInstance } from '@/lib/supabase';

type TokenStatus = {
	status?: boolean;
	msg?: string;
};

type SupabaseStatus = {
	status?: boolean;
	msg?: string;
};

type StockMasterRow = {
	mksc_shrn_iscd: string | null;
	stnd_iscd: string | null;
};

export default async function TemplatePage() {
	const tokenStatus = {
		status: false,
		msg: 'Token has not been issued yet.',
	} as TokenStatus;

	try {
		// 마운트마다 토큰 체크
		const existingToken = getCachedKisAccessToken();
		const token = await ensureKisAccessToken();

		tokenStatus.status = existingToken ? true : false;
		tokenStatus.msg = tokenStatus.status
			? 'Using the cached access token.'
			: `Issued a new access token. Expires at: ${new Date(token.expiresAt).toLocaleString('ko-KR')}`;
	} catch (error) {
		tokenStatus.msg =
			error instanceof Error ? error.message : 'Unknown error occurred while issuing the token.';
	}

	const supabaseStatus = {
		status: false,
		msg: 'Supabase connection has not been checked yet.',
	} as SupabaseStatus;
	let stockMasterRows: StockMasterRow[] = [];

	try {
		const supabase = getSupabaseServerInstance();
		const { data, error } = await supabase.from('TB_STOCK_KOSPI_MST').select('*').limit(10);

		if (error) {
			throw new Error(error.message);
		}

		stockMasterRows = (data ?? []).map((row) => ({
			mksc_shrn_iscd: typeof row.mksc_shrn_iscd === 'string' ? row.mksc_shrn_iscd : null,
			stnd_iscd: typeof row.stnd_iscd === 'string' ? row.stnd_iscd : null,
		}));

		supabaseStatus.status = true;
		supabaseStatus.msg = `Supabase query succeeded. ${stockMasterRows.length} rows loaded.`;
	} catch (error) {
		supabaseStatus.msg =
			error instanceof Error ? error.message : 'Unknown error occurred while querying Supabase.';
	}

	return (
		<div className="flex h-[calc(100vh-72px)] w-full gap-[20px] overflow-hidden p-6 text-black">
			<section className="flex h-full min-h-0 flex-[1] rounded-[15px] bg-white p-[10px] shadow-xl">
				<LeftSection tokenStatus={tokenStatus} />
			</section>

			<section className="flex h-full min-h-0 flex-[3] rounded-[15px] bg-white p-[30px] shadow-xl">
				<RightSection supabaseStatus={supabaseStatus} stockMasterRows={stockMasterRows} />
			</section>
		</div>
	);
}
