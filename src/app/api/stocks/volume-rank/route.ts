import { NextRequest, NextResponse } from 'next/server';

import { fetchTopVolumeStocks } from '@/features/stocks/search/services/fetchTopVolumeStocks';

export async function GET() {
	const result = fetchTopVolumeStocks();
	return result;
}
