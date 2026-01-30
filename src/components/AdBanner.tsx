import { useEffect } from "react";

interface AdBannerProps {
  adSlot: string;
  adFormat?: "auto" | "horizontal" | "vertical" | "rectangle";
  className?: string;
}

const ADSENSE_PUBLISHER_ID = "ca-pub-1623540206966807";

export function AdBanner({ adSlot, adFormat = "auto", className = "" }: AdBannerProps) {
  useEffect(() => {
    // Only try to push ads if AdSense is configured
    if (ADSENSE_PUBLISHER_ID && typeof window !== "undefined") {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error("AdSense error:", err);
      }
    }
  }, []);

  // Show placeholder if AdSense is not configured
  if (!ADSENSE_PUBLISHER_ID) {
    return (
      <div
        className={`flex items-center justify-center bg-muted/50 border border-dashed border-border rounded-lg text-muted-foreground text-sm ${className}`}
        style={{ minHeight: "90px" }}
      >
        <div className="text-center p-4">
          <p className="font-medium">Ad Space</p>
          <p className="text-xs">Configure ADSENSE_PUBLISHER_ID in AdBanner.tsx</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_PUBLISHER_ID}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
}
