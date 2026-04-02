import { NextRequest, NextResponse } from 'next/server';

import { fetchStockPreviewPrices } from '@/features/stocks/search/services/fetchStockPreviewPrices';

import type { StockSearchItem } from '@/features/stocks/search/types';

type PriceRequestBody = {
	items?: StockSearchItem[];
};

export async function POST(request: NextRequest) {
	let body: PriceRequestBody;

	try {
		body = (await request.json()) as PriceRequestBody;
	} catch {
		return NextResponse.json(
			{
				success: false,
				msg: 'Invalid request body.',
				output: [],
			},
			{ status: 400 },
		);
	}

	const items = Array.isArray(body.items) ? body.items : [];

	if (items.length === 0) {
		return NextResponse.json({
			success: true,
			output: [],
		});
	}

	try {
		const output = await fetchStockPreviewPrices(items);

		return NextResponse.json({
			success: true,
			output,
		});
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				msg: error instanceof Error ? error.message : 'Unexpected price lookup error occurred.',
				output: [],
			},
			{ status: 500 },
		);
	}
}
