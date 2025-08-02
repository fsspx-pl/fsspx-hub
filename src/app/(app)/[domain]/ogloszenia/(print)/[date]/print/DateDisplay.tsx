import { formatInPolishTime } from "@/common/timezone";
import { isSunday } from "date-fns";

interface DateDisplayProps {
  date: Date | string;
  className?: string;
}

export function DateDisplay({ date, className = "" }: DateDisplayProps) {
  const dayNum = formatInPolishTime(date, 'd');
  const monthAbbr = formatInPolishTime(date, 'MMM').toUpperCase();
  const weekdayAbbr = formatInPolishTime(date, 'EE').toLowerCase();
  const isDateSunday = isSunday(typeof date === 'string' ? new Date(date) : date);

  return (
    <div className={`text-center flex-shrink-0 ${className}`}>
      <div 
        className="p-1 border rounded bg-white"
        style={{ 
          borderColor: isDateSunday ? '#e9c9c9' : "#ddd"
        }}
      >
        <div 
          className="text-lg font-bold leading-tight"
          style={{ color: isDateSunday ? '#C62828' : "#333" }}
        >
          {dayNum}
        </div>
        <div className="text-xs font-semibold text-gray-600 uppercase leading-tight">
          {monthAbbr}
        </div>
        <div className="text-xs text-gray-500 leading-tight">
          {weekdayAbbr}
        </div>
      </div>
    </div>
  );
} 