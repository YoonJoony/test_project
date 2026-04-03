import { NextRequest, NextResponse } from 'next/server';

import { searchStocks } from '@/features/stocks/search/services/searchStocks';

export async function GET(request: NextRequest) {
	const query = request.nextUrl.searchParams.get('q')?.trim() ?? '';

	if (!query) {
		return NextResponse.json({
			success: true,
			output: [],
		});
	}

	try {
		const output = await searchStocks(query);
		console.log(output);
		return NextResponse.json({
			success: true,
			output,
		});
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				msg: error instanceof Error ? error.message : 'Unexpected search error occurred.',
				output: [],
			},
			{ status: 500 },
		);
	}
}
