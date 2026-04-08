'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import type { StockRealtimePriceItem } from '@/features/stocks/search/types';

type RealtimeServerMessage =
	| {
			type: 'snapshot';
			items: StockRealtimePriceItem[];
	  }
	| {
			type: 'price';
			item: StockRealtimePriceItem;
	  }
	| {
			type: 'subscribed';
			codes: string[];
	  }
	| {
			type: 'error';
			message: string;
	  };

function getRealtimeServerUrl() {
	if (typeof window === 'undefined') {
		return null;
	}

	const configuredUrl = process.env.NEXT_PUBLIC_REALTIME_SERVER_URL;

	if (configuredUrl) {
		return configuredUrl;
	}

	const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';

	return `${protocol}://${window.location.hostname}:3001`;
}

function diffCodes(source: string[], target: string[]) {
	const targetSet = new Set(target);

	return source.filter((code) => !targetSet.has(code));
}

export function useRealtimePreviewPrices(codes: string[], enabled: boolean) {
	const [itemsByCode, setItemsByCode] = useState<Record<string, StockRealtimePriceItem>>({});
	const socketRef = useRef<WebSocket | null>(null);
	const desiredCodesRef = useRef<string[]>([]);
	const subscribedCodesRef = useRef<string[]>([]);
	const normalizedCodes = useMemo(
		() => Array.from(new Set(codes.map((code) => code.trim()).filter(Boolean))).sort(),
		[codes],
	);
	const activeItemsByCode = useMemo(() => {
		if (!enabled || normalizedCodes.length === 0) {
			return {} as Record<string, StockRealtimePriceItem>;
		}

		return normalizedCodes.reduce<Record<string, StockRealtimePriceItem>>((result, code) => {
			const item = itemsByCode[code];

			if (item) {
				result[code] = item;
			}

			return result;
		}, {});
	}, [enabled, itemsByCode, normalizedCodes]);

	useEffect(() => {
		const realtimeServerUrl = getRealtimeServerUrl();

		if (!realtimeServerUrl) {
			return;
		}

		const socket = new WebSocket(realtimeServerUrl);
		socketRef.current = socket;

		socket.addEventListener('open', () => {
			const currentDesiredCodes = desiredCodesRef.current;

			if (currentDesiredCodes.length === 0) {
				return;
			}

			socket.send(
				JSON.stringify({
					type: 'subscribe',
					codes: currentDesiredCodes,
				}),
			);
			subscribedCodesRef.current = currentDesiredCodes;
		});

		socket.addEventListener('message', (event) => {
			const payload = JSON.parse(event.data) as RealtimeServerMessage;

			if (payload.type === 'snapshot') {
				setItemsByCode((prev) => {
					const next = { ...prev };

					for (const item of payload.items) {
						next[item.code] = item;
					}

					return next;
				});
				return;
			}

			if (payload.type === 'price') {
				setItemsByCode((prev) => ({
					...prev,
					[payload.item.code]: payload.item,
				}));
			}
		});

		return () => {
			socket.close();
			socketRef.current = null;
			desiredCodesRef.current = [];
			subscribedCodesRef.current = [];
		};
	}, []);

	useEffect(() => {
		const nextDesiredCodes = enabled ? normalizedCodes : [];
		desiredCodesRef.current = nextDesiredCodes;

		const socket = socketRef.current;

		if (!socket || socket.readyState !== WebSocket.OPEN) {
			if (!enabled) {
				subscribedCodesRef.current = [];
			}

			return;
		}

		const previousCodes = subscribedCodesRef.current;
		const codesToSubscribe = diffCodes(nextDesiredCodes, previousCodes);
		const codesToUnsubscribe = diffCodes(previousCodes, nextDesiredCodes);

		if (codesToUnsubscribe.length > 0) {
			socket.send(
				JSON.stringify({
					type: 'unsubscribe',
					codes: codesToUnsubscribe,
				}),
			);
		}

		if (codesToSubscribe.length > 0) {
			socket.send(
				JSON.stringify({
					type: 'subscribe',
					codes: codesToSubscribe,
				}),
			);
		}

		subscribedCodesRef.current = nextDesiredCodes;
	}, [enabled, normalizedCodes]);

	return activeItemsByCode;
}
