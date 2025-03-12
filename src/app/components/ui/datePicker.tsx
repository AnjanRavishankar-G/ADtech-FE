"use client";
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DateRangePickerProps {
  onDateRangeChange?: (startDate: Date, endDate: Date) => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
}

type PresetOption = 'custom' | 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'thisYear';

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  onDateRangeChange,
  initialStartDate = new Date(2022, 1, 15), // Feb 15, 2022
  initialEndDate = new Date(2022, 1, 21), // Feb 21, 2022
}) => {
  // State for current view months
  const [viewDate, setViewDate] = useState<Date>(new Date(2022, 1)); // February 2022
  
  // Selected range state
  const [startDate, setStartDate] = useState<Date>(initialStartDate);
  const [endDate, setEndDate] = useState<Date>(initialEndDate);
  const [selecting, setSelecting] = useState<boolean>(false);
  
  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Get month name
  const getMonthName = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  
  // Navigate months
  const prevMonth = (): void => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setViewDate(newDate);
  };
  
  const nextMonth = (): void => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setViewDate(newDate);
  };
  
  // Generate calendar data
  const generateCalendar = (monthOffset: number = 0): (Date | null)[][] => {
    const targetDate = new Date(viewDate);
    targetDate.setMonth(targetDate.getMonth() + monthOffset);
    
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const calendar: (Date | null)[][] = [];
    let week = Array(7).fill(null);
    
    // Fill in first week with empty cells and first days
    for (let i = 0; i < 7; i++) {
      if (i >= firstDay) {
        week[i] = new Date(year, month, i - firstDay + 1);
      }
    }
    calendar.push(week);
    
    // Fill in remaining weeks
    let currentDay = 8 - firstDay;
    while (currentDay <= daysInMonth) {
      week = Array(7).fill(null);
      for (let i = 0; i < 7 && currentDay <= daysInMonth; i++) {
        week[i] = new Date(year, month, currentDay);
        currentDay++;
      }
      calendar.push(week);
    }
    
    return calendar;
  };
  
  // Handle date selection
  const handleDateClick = (date: Date): void => {
    if (!selecting) {
      setStartDate(date);
      setEndDate(date);
      setSelecting(true);
    } else {
      if (date < startDate) {
        setStartDate(date);
        setEndDate(startDate);
      } else {
        setEndDate(date);
      }
      setSelecting(false);
    }
    
    // Call the callback with updated dates
    onDateRangeChange?.(selecting ? date : startDate, selecting ? startDate : date);
  };
  
  // Check if a date is within the selected range
  const isInRange = (date: Date | null): boolean => {
    if (!date) return false;
    return date >= startDate && date <= endDate;
  };
  
  // Check if a date is the start or end date
  const isStartDate = (date: Date | null): boolean => {
    if (!date) return false;
    return date.toDateString() === startDate.toDateString();
  };
  
  const isEndDate = (date: Date | null): boolean => {
    if (!date) return false;
    return date.toDateString() === endDate.toDateString();
  };
  
  // Preset date ranges
  const applyPreset = (preset: PresetOption): void => {
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    let newStartDate: Date = startDate;
    let newEndDate: Date = endDate;
    
    switch(preset) {
      case 'today':
        newStartDate = todayDate;
        newEndDate = todayDate;
        break;
      case 'yesterday':
        const yesterday = new Date(todayDate);
        yesterday.setDate(yesterday.getDate() - 1);
        newStartDate = yesterday;
        newEndDate = yesterday;
        break;
      case 'thisWeek':
        const thisWeekStart = new Date(todayDate);
        thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
        const thisWeekEnd = new Date(thisWeekStart);
        thisWeekEnd.setDate(thisWeekEnd.getDate() + 6);
        newStartDate = thisWeekStart;
        newEndDate = thisWeekEnd;
        break;
      case 'lastWeek':
        const lastWeekStart = new Date(todayDate);
        lastWeekStart.setDate(lastWeekStart.getDate() - lastWeekStart.getDay() - 7);
        const lastWeekEnd = new Date(lastWeekStart);
        lastWeekEnd.setDate(lastWeekEnd.getDate() + 6);
        newStartDate = lastWeekStart;
        newEndDate = lastWeekEnd;
        break;
      case 'thisMonth':
        const thisMonthStart = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
        const thisMonthEnd = new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 0);
        newStartDate = thisMonthStart;
        newEndDate = thisMonthEnd;
        break;
      case 'lastMonth':
        const lastMonthStart = new Date(todayDate.getFullYear(), todayDate.getMonth() - 1, 1);
        const lastMonthEnd = new Date(todayDate.getFullYear(), todayDate.getMonth(), 0);
        newStartDate = lastMonthStart;
        newEndDate = lastMonthEnd;
        break;
      case 'thisYear':
        const thisYearStart = new Date(todayDate.getFullYear(), 0, 1);
        const thisYearEnd = new Date(todayDate.getFullYear(), 11, 31);
        newStartDate = thisYearStart;
        newEndDate = thisYearEnd;
        break;
      default:
        break;
    }
    
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    
    // Update view to show start date month
    if (preset !== 'custom') {
      setViewDate(new Date(newStartDate.getFullYear(), newStartDate.getMonth()));
    }
    
    // Call the callback with updated dates
    onDateRangeChange?.(newStartDate, newEndDate);
  };
  
  // Calendar for current and next month
  const currentMonthCalendar = generateCalendar(0);
  const nextMonthCalendar = generateCalendar(1);

   
  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-md w-full max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">Timespan</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded p-1">
            <span className="text-sm px-2 text-gray-900 dark:text-gray-100">{formatDate(startDate)}</span>
            <span className="mx-1 text-gray-400 dark:text-gray-400">to</span>
            <span className="text-sm px-2 text-gray-900 dark:text-gray-100">{formatDate(endDate)}</span>
          </div>
        </div>
      </div>
      
      <div className="flex border-b border-gray-200 dark:border-gray-600 mb-2">
        <div className="grid grid-cols-1 w-32">
          <button 
            className="p-2 text-left text-violet-600 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            onClick={() => applyPreset('custom')}
          >
            Custom
          </button>
          <button 
            className="p-2 text-left text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg"
            onClick={() => applyPreset('today')}
          >
            Today
          </button>
          <button 
            className="p-2 text-left text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg"
            onClick={() => applyPreset('yesterday')}
          >
            Yesterday
          </button>
          <button 
            className="p-2 text-left text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg"
            onClick={() => applyPreset('thisWeek')}
          >
            This week
          </button>
          <button 
            className="p-2 text-left text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg"
            onClick={() => applyPreset('lastWeek')}
          >
            Last week
          </button>
          <button 
            className="p-2 text-left text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg"
            onClick={() => applyPreset('thisMonth')}
          >
            This month
          </button>
          <button 
            className="p-2 text-left text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg"
            onClick={() => applyPreset('lastMonth')}
          >
            Last month
          </button>
          <button 
            className="p-2 text-left text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg"
            onClick={() => applyPreset('thisYear')}
          >
            This year
          </button>
        </div>
        
        <div className="flex-1 p-4">
          <div className="flex justify-between mb-6">
            <div className="relative w-1/2 pr-2">
              <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth}>
                  <ChevronLeft className="text-gray-500 cursor-pointer" size={20} />
                </button>
                <span className="text-sm font-medium">{getMonthName(viewDate)}</span>
                <div className="w-5"></div> {/* Spacer */}
              </div>
              
              <div className="grid grid-cols-7 gap-1 text-center">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-xs text-gray-500">{day}</div>
                ))}
                
                {currentMonthCalendar.flat().map((date, i) => (
                  <div key={`current-${i}`} className="aspect-square flex items-center justify-center">
                    {date && (
                      <button 
                        className={`w-8 h-8 flex items-center justify-center text-sm rounded-full
                          ${isStartDate(date) ? 'bg-violet-600 text-white' : ''}
                          ${isEndDate(date) && !isStartDate(date) ? 'bg-violet-600 text-white' : ''}
                          ${isInRange(date) && !isStartDate(date) && !isEndDate(date) 
                            ? 'bg-violet-100 text-violet-900' : ''}
                          ${!isInRange(date) ? 'text-gray-600 hover:bg-gray-100' : ''}
                        `}
                        onClick={() => handleDateClick(date)}
                      >
                        {date.getDate()}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative w-1/2 pl-2">
              <div className="flex items-center justify-between mb-4">
                <div className="w-5"></div> {/* Spacer */}
                <span className="text-sm font-medium">
                  {getMonthName(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))}
                </span>
                <button onClick={nextMonth}>
                  <ChevronRight className="text-gray-500 cursor-pointer" size={20} />
                </button>
              </div>
              
              <div className="grid grid-cols-7 gap-1 text-center">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-xs text-gray-500">{day}</div>
                ))}
                
                {nextMonthCalendar.flat().map((date, i) => (
                  <div key={`next-${i}`} className="aspect-square flex items-center justify-center">
                    {date && (
                      <button 
                        className={`w-8 h-8 flex items-center justify-center text-sm rounded-full
                          ${isStartDate(date) ? 'bg-violet-600 text-white' : ''}
                          ${isEndDate(date) && !isStartDate(date) ? 'bg-violet-600 text-white' : ''}
                          ${isInRange(date) && !isStartDate(date) && !isEndDate(date) 
                            ? 'bg-violet-100 text-violet-900' : ''}
                          ${!isInRange(date) ? 'text-gray-600 hover:bg-gray-100' : ''}
                        `}
                        onClick={() => handleDateClick(date)}
                      >
                        {date.getDate()}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateRangePicker;