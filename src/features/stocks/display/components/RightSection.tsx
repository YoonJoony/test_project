'use client';

import {
	ACTIVE_CHART_TAB,
	CHART_POINTS,
	CHART_TABS,
	INVESTMENT_POINTS,
	MARKET_NOTES,
	MOCK_STOCK,
	NEWS_ITEMS,
	ORDER_BOOK,
	RELATED_STOCKS,
	STAT_ITEMS,
} from '@/features/stocks/display/mock';
import ConnectionStatusSection from '@/features/stocks/display/components/sections/ConnectionStatusSection';
import OrderPanelSection from '@/features/stocks/display/components/sections/OrderPanelSection';
import RelatedStocksSection from '@/features/stocks/display/components/sections/RelatedStocksSection';
import StockChartSection from '@/features/stocks/display/components/sections/StockChartSection';
import StockHeroSection from '@/features/stocks/display/components/sections/StockHeroSection';
import StockInsightsSection from '@/features/stocks/display/components/sections/StockInsightsSection';
import type { RightSectionProps } from '@/features/stocks/display/types';

export default function RightSection({ supabaseStatus, stockMasterRows }: RightSectionProps) {
	const previewCount = stockMasterRows.length;

	return (
		<div className="flex h-full w-full min-h-0 flex-col">
			<div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto pr-1">
				<div className="space-y-5">
					<StockHeroSection stock={MOCK_STOCK} isConnected={!!supabaseStatus.status} />

					<section className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.88fr)]">
						<div className="space-y-5">
							<StockChartSection
								stock={MOCK_STOCK}
								stats={STAT_ITEMS}
								chartTabs={CHART_TABS}
								activeChartTab={ACTIVE_CHART_TAB}
								chartPoints={CHART_POINTS}
							/>
							<StockInsightsSection
								investmentPoints={INVESTMENT_POINTS}
								marketNotes={MARKET_NOTES}
								newsItems={NEWS_ITEMS}
							/>
						</div>

						<div className="space-y-5">
							<OrderPanelSection orderBook={ORDER_BOOK} />
							<RelatedStocksSection relatedStocks={RELATED_STOCKS} />
							<ConnectionStatusSection
								supabaseStatus={supabaseStatus}
								previewCount={previewCount}
							/>
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}
