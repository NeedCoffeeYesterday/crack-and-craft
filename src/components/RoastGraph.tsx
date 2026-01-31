import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
} from 'recharts';
import { DataPoint } from '@/types/roast';
import { getSettings } from '@/lib/storage';

interface RoastGraphProps {
  dataPoints: DataPoint[];
  currentTime?: number;
  onPointClick?: (point: DataPoint) => void;
}

export const RoastGraph = ({ dataPoints, currentTime, onPointClick }: RoastGraphProps) => {
  const settings = getSettings();
  
  const chartData = useMemo(() => {
    const temperaturePoints = dataPoints
      .filter(dp => (dp.type === 'temperature' || dp.type === 'charge') && dp.temperature !== undefined)
      .sort((a, b) => a.timestamp - b.timestamp);

    if (temperaturePoints.length === 0) {
      return [{ time: 0, temperature: 0 }];
    }

    return temperaturePoints.map(dp => ({
      time: dp.timestamp,
      temperature: dp.temperature,
      id: dp.id,
    }));
  }, [dataPoints]);

  const markers = useMemo(() => {
    return dataPoints.filter(dp => 
      dp.type === 'first-crack' || 
      dp.type === 'second-crack' || 
      dp.type === 'note' ||
      dp.type === 'voice' ||
      dp.type === 'charge' ||
      dp.type === 'custom'
    );
  }, [dataPoints]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get color for markers including custom buttons
  const getMarkerColor = (type: string, customButtonId?: string) => {
    if (type === 'custom' && customButtonId) {
      const customButton = settings.buttons.find(b => b.id === customButtonId);
      return customButton ? `hsl(${customButton.color})` : 'hsl(25, 50%, 40%)';
    }
    switch (type) {
      case 'first-crack': return 'hsl(0, 55%, 50%)';
      case 'second-crack': return 'hsl(30, 65%, 45%)';
      case 'note': return 'hsl(270, 40%, 55%)';
      case 'voice': return 'hsl(150, 45%, 40%)';
      case 'charge': return 'hsl(35, 85%, 45%)';
      default: return 'hsl(25, 50%, 40%)';
    }
  };

  const getMarkerLabel = (marker: DataPoint) => {
    if (marker.type === 'custom' && marker.customButtonId) {
      const customButton = settings.buttons.find(b => b.id === marker.customButtonId);
      return customButton?.shortName || 'Custom';
    }
    switch (marker.type) {
      case 'first-crack': return '1st';
      case 'second-crack': return '2nd';
      case 'charge': return 'Chrg';
      default: return marker.type;
    }
  };

  const maxTime = Math.max(
    ...dataPoints.map(dp => dp.timestamp),
    currentTime || 0,
    60
  );

  const maxTemp = Math.max(
    ...dataPoints
      .filter(dp => dp.temperature)
      .map(dp => dp.temperature!),
    250
  );

  return (
    <div className="graph-container w-full">
      <ResponsiveContainer width="100%" height={220}>
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(30, 15%, 80%)"
            vertical={false}
          />
          <XAxis
            dataKey="time"
            type="number"
            domain={[0, Math.ceil(maxTime / 60) * 60]}
            tickFormatter={formatTime}
            stroke="hsl(25, 20%, 55%)"
            tick={{ fontSize: 11, fill: 'hsl(25, 15%, 45%)' }}
            axisLine={{ stroke: 'hsl(30, 15%, 75%)' }}
          />
          <YAxis
            domain={[0, Math.ceil(maxTemp / 50) * 50]}
            stroke="hsl(25, 20%, 55%)"
            tick={{ fontSize: 11, fill: 'hsl(25, 15%, 45%)' }}
            axisLine={{ stroke: 'hsl(30, 15%, 75%)' }}
            tickFormatter={(value) => `${value}°`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(40, 25%, 94%)',
              border: '1px solid hsl(30, 20%, 80%)',
              borderRadius: '8px',
              fontSize: '12px',
              color: 'hsl(25, 30%, 20%)',
            }}
            labelFormatter={formatTime}
            formatter={(value: number) => [`${value}°C`, 'Temperature']}
          />
          <Line
            type="monotone"
            dataKey="temperature"
            stroke="hsl(25, 50%, 40%)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{
              r: 6,
              fill: 'hsl(25, 50%, 40%)',
              stroke: 'hsl(40, 25%, 92%)',
              strokeWidth: 2,
            }}
          />
          {markers.map(marker => (
            <ReferenceLine
              key={marker.id}
              x={marker.timestamp}
              stroke={getMarkerColor(marker.type, marker.customButtonId)}
              strokeWidth={2}
              strokeDasharray={marker.type === 'note' || marker.type === 'voice' ? '4 4' : undefined}
            />
          ))}
          {currentTime !== undefined && (
            <ReferenceLine
              x={currentTime}
              stroke="hsl(25, 50%, 45%)"
              strokeWidth={1}
              strokeDasharray="2 2"
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      {markers.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border">
          {markers.map(marker => (
            <button
              key={marker.id}
              onClick={() => onPointClick?.(marker)}
              className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-full transition-all hover:opacity-80 active:scale-95"
              style={{ 
                backgroundColor: `${getMarkerColor(marker.type, marker.customButtonId)}18`, 
                color: getMarkerColor(marker.type, marker.customButtonId) 
              }}
            >
              <span 
                className="w-1.5 h-1.5 rounded-full" 
                style={{ backgroundColor: getMarkerColor(marker.type, marker.customButtonId) }} 
              />
              {formatTime(marker.timestamp)} - {getMarkerLabel(marker)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
