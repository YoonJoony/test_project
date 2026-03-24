import { NextRequest, NextResponse } from 'next/server';
import { ensureKisAccessToken, getKisConfig } from '@/lib/kis-auth';

type KisQuoteSuccessResponse = {
	rt_cd?: string;
	msg_cd?: string;
	msg1?: string;
	output?: {
		iscd_stat_cls_code?: string;
		rprs_mrkt_kor_name?: string;
		bstp_kor_isnm?: string;
		stck_prpr?: string;
		prdy_vrss?: string;
	};
};

type KisQuoteResult =
	| {
			requestedCode: string;
			success: true;
			iscd_stat_cls_code: string;
			rprs_mrkt_kor_name: string;
			bstp_kor_isnm: string;
			stck_prpr: string;
			prdy_vrss: string;
	  }
	| {
			requestedCode: string;
			success: false;
			msg_cd: string;
			msg1: string;
			output: unknown;
	  };

export async function GET(request: NextRequest) {
	const code = request.nextUrl.searchParams.get('code')?.trim();

	if (!code) {
		return NextResponse.json<KisQuoteResult>(
			{
				requestedCode: '',
				success: false,
				msg_cd: 'INVALID_REQUEST',
				msg1: 'The code query parameter is required.',
				output: null,
			},
			{ status: 400 },
		);
	}

	try {
		const token = await ensureKisAccessToken();
		const { baseUrl, appKey, appSecret } = getKisConfig();

		const params = new URLSearchParams({
			fid_cond_mrkt_div_code: 'J',
			fid_input_iscd: code,
		});

		const response = await fetch(
			`${baseUrl}/uapi/domestic-stock/v1/quotations/inquire-price?${params.toString()}`,
			{
				method: 'GET',
				headers: {
					authorization: `Bearer ${token.accessToken}`,
					appkey: appKey,
					appsecret: appSecret,
					tr_id: 'FHKST01010100',
					custtype: 'P',
				},
				cache: 'no-store',
			},
		);

		const data = (await response.json()) as KisQuoteSuccessResponse;

		if (!response.ok || data.rt_cd !== '0' || !data.output) {
			return NextResponse.json<KisQuoteResult>(
				{
					requestedCode: code,
					success: false,
					msg_cd: data.msg_cd ?? String(response.status),
					msg1: data.msg1 ?? 'KIS quote request failed.',
					output: data.output ?? null,
				},
				{ status: response.ok ? 200 : response.status },
			);
		}

		return NextResponse.json<KisQuoteResult>({
			requestedCode: code,
			success: true,
			iscd_stat_cls_code: data.output.iscd_stat_cls_code ?? '',
			rprs_mrkt_kor_name: data.output.rprs_mrkt_kor_name ?? '',
			bstp_kor_isnm: data.output.bstp_kor_isnm ?? '',
			stck_prpr: data.output.stck_prpr ?? '',
			prdy_vrss: data.output.prdy_vrss ?? '',
		});
	} catch (error) {
		return NextResponse.json<KisQuoteResult>(
			{
				requestedCode: code,
				success: false,
				msg_cd: 'SERVER_ERROR',
				msg1: error instanceof Error ? error.message : 'Unexpected server error occurred.',
				output: null,
			},
			{ status: 500 },
		);
	}
}
