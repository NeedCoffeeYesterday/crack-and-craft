import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoasts } from '@/lib/storage';
import { Roast } from '@/types/roast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Home, Flame } from 'lucide-react';

const Calendar = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const roasts = getRoasts();

  // Get roast counts by date (YYYY-MM-DD format)
  const roastsByDate = useMemo(() => {
    const counts: Record<string, Roast[]> = {};
    roasts.forEach((roast) => {
      const dateKey = new Date(roast.startTime).toISOString().split('T')[0];
      if (!counts[dateKey]) {
        counts[dateKey] = [];
      }
      counts[dateKey].push(roast);
    });
    return counts;
  }, [roasts]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const today = new Date();
  const todayKey = today.toISOString().split('T')[0];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (dateKey: string) => {
    if (roastsByDate[dateKey]?.length) {
      navigate(`/calendar/${dateKey}`);
    }
  };

  // Generate calendar grid
  const calendarDays = [];
  
  // Add empty cells for days before the first day of month
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarDays.push({
      day,
      dateKey,
      roasts: roastsByDate[dateKey] || [],
      isToday: dateKey === todayKey,
    });
  }

  return (
    <div className="min-h-screen bg-background safe-area-inset">
      {/* AdMob Banner Space */}
      <div className="h-14 bg-muted/30 flex items-center justify-center text-xs text-muted-foreground">
        AdMob Banner Space
      </div>

      {/* Header */}
      <header className="sticky top-14 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Calendar</h1>
                <p className="text-sm text-muted-foreground">Roast history by date</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="text-muted-foreground hover:text-foreground"
              >
                <Home className="w-5 h-5" />
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-4">
        {/* Month Navigation */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={goToPrevMonth}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            <div className="text-center">
              <h2 className="text-lg font-semibold">
                {monthNames[month]} {year}
              </h2>
              <button
                onClick={goToToday}
                className="text-xs text-primary hover:underline"
              >
                Today
              </button>
            </div>
            
            <Button variant="ghost" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </Card>

        {/* Calendar Grid */}
        <Card className="p-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar cells */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((dayData, index) => {
              if (!dayData) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const hasRoasts = dayData.roasts.length > 0;
              const roastCount = dayData.roasts.length;

              return (
                <button
                  key={dayData.dateKey}
                  onClick={() => handleDateClick(dayData.dateKey)}
                  disabled={!hasRoasts}
                  className={`
                    aspect-square rounded-lg flex flex-col items-center justify-center relative
                    transition-all duration-200 touch-manipulation
                    ${dayData.isToday 
                      ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' 
                      : ''
                    }
                    ${hasRoasts 
                      ? 'bg-primary/15 hover:bg-primary/25 cursor-pointer active:scale-95' 
                      : 'text-muted-foreground'
                    }
                  `}
                >
                  <span className={`text-sm font-medium ${hasRoasts ? 'text-primary' : ''}`}>
                    {dayData.day}
                  </span>
                  
                  {hasRoasts && (
                    <div className="flex items-center gap-0.5 mt-0.5">
                      <Flame className="w-3 h-3 text-primary" />
                      {roastCount > 1 && (
                        <span className="text-[10px] font-bold text-primary">
                          {roastCount}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-primary/15 flex items-center justify-center">
              <Flame className="w-2.5 h-2.5 text-primary" />
            </div>
            <span>Roast day</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded ring-2 ring-primary ring-offset-1 ring-offset-background" />
            <span>Today</span>
          </div>
        </div>

        {/* Quick Stats */}
        <Card className="p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Roasts this month:</span>
            <span className="font-semibold text-primary">
              {Object.entries(roastsByDate)
                .filter(([dateKey]) => {
                  const date = new Date(dateKey);
                  return date.getMonth() === month && date.getFullYear() === year;
                })
                .reduce((sum, [, roasts]) => sum + roasts.length, 0)
              }
            </span>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Calendar;
