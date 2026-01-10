import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

// We will override styles in globals.css or here via className
// But react-calendar styles are global. We'll wrap it.

interface CalendarViewProps {
  // Dates that have at least one completed task
  activeDates: Date[];
}

export function CalendarView({ activeDates }: CalendarViewProps) {
  const [date] = useState<Date>(new Date());

  // Helper to check if a date is active
  const isDateActive = (d: Date) => {
    return activeDates.some(
      (activeDate) =>
        activeDate.getDate() === d.getDate() &&
        activeDate.getMonth() === d.getMonth() &&
        activeDate.getFullYear() === d.getFullYear()
    );
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
      <h3 className="font-medium text-slate-300 mb-4 px-2">Calendar</h3>
      <div className="custom-calendar-wrapper">
        <Calendar
          value={date}
          className="bg-transparent border-none text-slate-300 w-full"
          tileClassName={({ date, view }) =>
            [
              'rounded-lg hover:bg-slate-800 focus:bg-indigo-500/20',
              view === 'month' && isDateActive(date)
                ? 'text-indigo-400 font-bold'
                : '',
            ].join(' ')
          }
          tileContent={({ date, view }) => {
            if (view === 'month' && isDateActive(date)) {
              return (
                <div className="flex justify-center mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                </div>
              );
            }
            return null;
          }}
          prevLabel={<span className="text-slate-400">‹</span>}
          nextLabel={<span className="text-slate-400">›</span>}
          prev2Label={null}
          next2Label={null}
          formatShortWeekday={(_, date) =>
            ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()]
          }
        />
      </div>
    </div>
  );
}

