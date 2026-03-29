import { NextRequest, NextResponse } from 'next/server';
import { ensureKisAccessToken, getKisConfig } from '@/lib/kis-auth';

type KisVolumeRankItem = {
	hts_kor_isnm?: string;
	data_rank?: string;
	stck_prpr?: string;
	vol_inrt?: string;
	avrg_tr_pbmn?: string;
};

type KisVolumeRankResponse = {
	rt_cd?: string;
	msg_cd?: string;
	msg1?: string;
	output?: KisVolumeRankItem[];
};

type KisQuoteResult =
	| {
			requestedCode: string;
			success: true;
			output: Array<{
				hts_kor_isnm: string;
				data_rank: string;
				stck_prpr: string;
				vol_inrt: string;
				avrg_tr_pbmn: string;
			}>;
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
		console.log(code);
		const params = new URLSearchParams({
			fid_cond_mrkt_div_code: 'J',
			fid_cond_scr_div_code: '20171',
			fid_input_iscd: code,
			fid_div_cls_code: '0',
			fid_blng_cls_code: '0',
			fid_trgt_cls_code: '111111111',
			fid_trgt_exls_cls_code: '0000000000',
			fid_input_price_1: '0',
			fid_input_price_2: '11111111111',
			fid_vol_cnt: '',
			fid_input_date_1: '',
		});

		const response = await fetch(
			`${baseUrl}/uapi/domestic-stock/v1/quotations/volume-rank?${params.toString()}`,
			{
				method: 'GET',
				headers: {
					authorization: `Bearer ${token.accessToken}`,
					appkey: appKey,
					appsecret: appSecret,
					tr_id: 'FHPST01710000',
					custtype: 'P',
				},
				cache: 'no-store',
			},
		);

		const data: KisVolumeRankResponse = await response.json();
		console.log(data);

		if (!response.ok || data.rt_cd !== '0' || !data.output?.length) {
			return NextResponse.json<KisQuoteResult>(
				{
					requestedCode: code,
					success: false,
					msg_cd: data.msg_cd ?? String(response.status),
					msg1: data.msg1 ?? 'KIS volume rank request failed.',
					output: data.output ?? null,
				},
				{ status: response.ok ? 200 : response.status },
			);
		}

		return NextResponse.json<KisQuoteResult>({
			requestedCode: code,
			success: true,
			output: data.output.map((item) => ({
				hts_kor_isnm: item.hts_kor_isnm ?? '',
				data_rank: item.data_rank ?? '',
				stck_prpr: item.stck_prpr ?? '',
				vol_inrt: item.vol_inrt ?? '',
				avrg_tr_pbmn: item.avrg_tr_pbmn ?? '',
			})),
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
