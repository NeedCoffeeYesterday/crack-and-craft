import { Heart, Coffee, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SupportDialogProps {
  adsEnabled?: boolean;
}

export function SupportDialog({ adsEnabled = false }: SupportDialogProps) {
  const handleWatchAd = () => {
    // This would trigger an ad display when AdSense is configured
    // For now, show a placeholder message
    alert("Ad feature coming soon! Thank you for your support.");
  };

  const handleBuyMeCoffee = () => {
    window.open("https://buymeacoffee.com/BPYn2c3APT", "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-primary/30 hover:bg-primary/10"
        >
          <Heart className="h-4 w-4 text-destructive" />
          <span>Support Me</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-destructive" />
            Support This App
          </DialogTitle>
          <DialogDescription>
            Love The Roast Log? Here are some ways you can support the development!
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-4">
          {adsEnabled && (
            <Button
              variant="secondary"
              className="w-full justify-start gap-3 h-auto py-4"
              onClick={handleWatchAd}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Play className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-medium">Watch an Ad</div>
                <div className="text-sm text-muted-foreground">
                  Support for free by watching a short ad
                </div>
              </div>
            </Button>
          )}
          <Button
            variant="secondary"
            className="w-full justify-start gap-3 h-auto py-4"
            onClick={handleBuyMeCoffee}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFDD00]/20">
              <Coffee className="h-5 w-5 text-[#FFDD00]" />
            </div>
            <div className="text-left">
              <div className="font-medium">Buy Me a Coffee</div>
              <div className="text-sm text-muted-foreground">
                Support with a one-time donation
              </div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
