import { NextResponse } from 'next/server';

import { fetchTopVolumeStocks } from '@/features/stocks/search/services/fetchTopVolumeStocks';

export async function GET() {
	try {
		const result = await fetchTopVolumeStocks();

		return NextResponse.json({
			success: true,
			output: result,
		});
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				msg:
					error instanceof Error
						? error.message
						: 'Unexpected top-volume stock lookup error occurred.',
				output: [],
			},
			{ status: 500 },
		);
	}
}
