import LiveChartResponsiveLayout from '@/features/stocks/display/components/LiveChartResponsiveLayout';
import { warmKisSession } from '@/lib/kis-session';
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
		const warmup = await warmKisSession();

		tokenStatus.status = warmup.tokenStatus.status;
		tokenStatus.msg = warmup.tokenStatus.msg;
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
		<LiveChartResponsiveLayout
			tokenStatus={tokenStatus}
			supabaseStatus={supabaseStatus}
			stockMasterRows={stockMasterRows}
		/>
	);
}
