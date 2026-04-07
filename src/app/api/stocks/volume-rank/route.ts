import { NextRequest, NextResponse } from 'next/server';

import { fetchTopVolumeStocks } from '@/features/stocks/search/services/fetchTopVolumeStocks';

export async function GET() {
	console.log(1);
	const result = fetchTopVolumeStocks();
	return result;
}
