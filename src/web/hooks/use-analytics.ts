import { useCallback } from "react";
import { track } from "@databuddy/sdk";

export function useAnalytics() {
	const trackEvent = useCallback((name: string, props?: Record<string, unknown>) => {
		track(name, props);
	}, []);

	const trackPageView = useCallback((path: string, props?: Record<string, unknown>) => {
		window.databuddy?.screenView({ screen_name: path, ...props });
	}, []);

	return { trackEvent, trackPageView };
}
