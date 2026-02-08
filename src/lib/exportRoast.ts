import * as XLSX from 'xlsx';
import { Roast, DataPoint, RoastSettings } from '@/types/roast';

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatDuration = (seconds?: number): string => {
  if (!seconds) return '';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

const getPointLabel = (point: DataPoint, settings: RoastSettings): string => {
  if (point.type === 'custom' && point.customButtonId) {
    const button = settings.buttons.find(b => b.id === point.customButtonId);
    return button?.name || 'Custom';
  }
  switch (point.type) {
    case 'first-crack': return 'First Crack';
    case 'second-crack': return 'Second Crack';
    case 'charge': return 'Charge';
    case 'temperature': return 'Temperature';
    case 'note': return 'Note';
    case 'voice': return 'Voice Note';
    case 'drum-speed': return 'Drum Speed';
    case 'fan-speed': return 'Fan Speed';
    case 'speed': return 'Speed';
    default: return point.type.charAt(0).toUpperCase() + point.type.slice(1);
  }
};

export const exportRoastToExcel = (roast: Roast, settings: RoastSettings): void => {
  const workbook = XLSX.utils.book_new();

  // Summary Sheet
  const summaryData = [
    ['Roast Summary'],
    [],
    ['Coffee Name', roast.coffeeName],
    ['Roast Date & Time', formatDate(roast.startTime)],
    ['Roast Duration', formatDuration(roast.duration)],
    [],
    ['Weight Tracking'],
    ['Green Weight (g)', roast.greenWeight ?? ''],
    ['Roasted Weight (g)', roast.roastedWeight ?? ''],
    ['Weight Loss %', roast.weightLossPercent ? `${roast.weightLossPercent.toFixed(1)}%` : ''],
  ];

  // Find key milestones
  const firstCrack = roast.dataPoints.find(dp => dp.type === 'first-crack');
  const secondCrack = roast.dataPoints.find(dp => dp.type === 'second-crack');
  const charge = roast.dataPoints.find(dp => dp.type === 'charge');
  const maxTemp = Math.max(
    ...roast.dataPoints
      .filter(dp => dp.temperature)
      .map(dp => dp.temperature!)
  );

  summaryData.push(
    [],
    ['Key Milestones'],
    ['Charge', charge ? `${formatTime(charge.timestamp)}${charge.temperature ? ` @ ${charge.temperature}°C` : ''}` : 'Not recorded'],
    ['First Crack', firstCrack ? formatTime(firstCrack.timestamp) : 'Not recorded'],
    ['Second Crack', secondCrack ? formatTime(secondCrack.timestamp) : 'Not recorded'],
    ['Max Temperature', isFinite(maxTemp) ? `${maxTemp}°C` : 'Not recorded'],
  );

  // Add notes if present
  if (roast.notes) {
    summaryData.push([], ['Notes', roast.notes]);
  }

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Set column widths for summary
  summarySheet['!cols'] = [{ wch: 20 }, { wch: 40 }];
  
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Timeline Sheet
  const timelineHeaders = ['Time', 'Event Type', 'Temperature (°C)', 'Speed Value', 'Notes'];
  const timelineData = [
    timelineHeaders,
    ...roast.dataPoints
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(point => [
        formatTime(point.timestamp),
        getPointLabel(point, settings),
        point.temperature ?? '',
        point.speedValue ? `${point.speedValue}${point.speedUnit || ''}` : '',
        point.note || (point.voiceNote ? '[Voice Note]' : ''),
      ])
  ];

  const timelineSheet = XLSX.utils.aoa_to_sheet(timelineData);
  
  // Set column widths for timeline
  timelineSheet['!cols'] = [
    { wch: 10 },  // Time
    { wch: 15 },  // Event Type
    { wch: 15 },  // Temperature
    { wch: 12 },  // Speed Value
    { wch: 40 },  // Notes
  ];
  
  XLSX.utils.book_append_sheet(workbook, timelineSheet, 'Timeline');

  // Temperature Data Sheet (for graphing)
  const tempPoints = roast.dataPoints
    .filter(dp => dp.temperature)
    .sort((a, b) => a.timestamp - b.timestamp);

  if (tempPoints.length > 0) {
    const tempData = [
      ['Time (seconds)', 'Time (mm:ss)', 'Temperature (°C)'],
      ...tempPoints.map(point => [
        point.timestamp,
        formatTime(point.timestamp),
        point.temperature,
      ])
    ];

    const tempSheet = XLSX.utils.aoa_to_sheet(tempData);
    tempSheet['!cols'] = [{ wch: 15 }, { wch: 12 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(workbook, tempSheet, 'Temperature Data');
  }

  // Generate filename
  const dateStr = new Date(roast.startTime).toISOString().split('T')[0];
  const safeCoffeeName = roast.coffeeName.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `RoastLog_${safeCoffeeName}_${dateStr}.xlsx`;

  // Write file and trigger download
  XLSX.writeFile(workbook, filename);
};
