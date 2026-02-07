import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getRoasts } from '@/lib/storage';
import { RoastCard } from '@/components/RoastCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ArrowLeft, Calendar, Coffee } from 'lucide-react';

const CalendarDayRoasts = () => {
  const navigate = useNavigate();
  const { date } = useParams<{ date: string }>();

  const roasts = getRoasts();

  const dayRoasts = useMemo(() => {
    if (!date) return [];
    return roasts.filter((roast) => {
      const roastDate = new Date(roast.startTime).toISOString().split('T')[0];
      return roastDate === date;
    });
  }, [roasts, date]);

  const formatDateDisplay = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(d);
  };

  const handleViewRoast = (roastId: string) => {
    navigate(`/roast/${roastId}`);
  };

  return (
    <div className="min-h-screen bg-background safe-area-inset">
      {/* AdMob Banner Space */}
      <div className="h-14 bg-muted/30 flex items-center justify-center text-xs text-muted-foreground">
        AdMob Banner Space
      </div>

      {/* Header */}
      <header className="sticky top-14 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/calendar')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Calendar</span>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-4">
        {/* Date Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">
              {date ? formatDateDisplay(date) : 'Unknown Date'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {dayRoasts.length} roast{dayRoasts.length !== 1 ? 's' : ''} on this day
            </p>
          </div>
        </div>

        {/* Roasts List */}
        {dayRoasts.length === 0 ? (
          <Card className="p-8 text-center">
            <Coffee className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No roasts found for this date</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate('/calendar')}
            >
              Back to Calendar
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {dayRoasts.map((roast) => (
              <RoastCard
                key={roast.id}
                roast={roast}
                onClick={() => handleViewRoast(roast.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CalendarDayRoasts;
