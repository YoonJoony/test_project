'use client';

type RightSectionProps = {
	supabaseStatus: {
		status?: boolean;
		msg?: string;
	};
	stockMasterRows: Array<{
		mksc_shrn_iscd: string | null;
		stnd_iscd: string | null;
	}>;
};

export default function RightSection({ supabaseStatus, stockMasterRows }: RightSectionProps) {
	return (
		<div className="flex w-full flex-col">
			<h2 className="mb-6 text-2xl font-black text-slate-900">Main Preview</h2>

			<div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
				<p className="font-semibold text-slate-900">
					Supabase status: {supabaseStatus.status ? 'connected' : 'not connected'}
				</p>
				<p className="mt-2 break-all">{supabaseStatus.msg}</p>
			</div>

			<div className="flex h-[400px] w-full flex-col rounded-lg border-2 border-dashed border-gray-200 p-4">
				<h3 className="mb-3 text-lg font-semibold text-slate-900">
					TB_STOCK_KOSPI_MST test result
				</h3>
				<div className="scrollbar-hidden flex-1 space-y-3 overflow-y-auto">
					{stockMasterRows.length === 0 ? (
						<p className="text-sm text-gray-400">No rows loaded.</p>
					) : (
						stockMasterRows.map((row, index) => (
							<pre
								key={`${row.mksc_shrn_iscd ?? 'null'}-${row.stnd_iscd ?? 'null'}-${index}`}
								className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700"
							>
								{`{ mksc_shrn_iscd : ${row.mksc_shrn_iscd ?? 'null'}, stnd_iscd : ${row.stnd_iscd ?? 'null'} }`}
							</pre>
						))
					)}
				</div>
			</div>
		</div>
	);
}
