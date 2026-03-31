import type { RightSectionProps } from '@/features/stocks/display/types';

type ConnectionStatusSectionProps = {
	supabaseStatus: RightSectionProps['supabaseStatus'];
	previewCount: number;
};

export default function ConnectionStatusSection({
	supabaseStatus,
	previewCount,
}: ConnectionStatusSectionProps) {
	return (
		<div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-500">
			<p className="font-semibold text-slate-700">
				Supabase status: {supabaseStatus.status ? 'connected' : 'not connected'}
			</p>
			<p className="mt-2 break-all">{supabaseStatus.msg}</p>
			<p className="mt-3">Preview rows: {previewCount}</p>
		</div>
	);
}
