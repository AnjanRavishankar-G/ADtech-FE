"use client";

import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from "lucide-react";


const DateRangePicker = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}: {
  startDate: Date | null;
  endDate: Date | null;
  setStartDate: (date: Date | null) => void;
  setEndDate: (date: Date | null) => void;
}) => {
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  return (
    <div className="flex flex-row items-center gap-6">
      {/* Start Date Picker */}
      <div className="relative">
        <button
          onClick={() => setStartOpen(!startOpen)}
          className="flex items-center gap-2 rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Calendar className="h-4 w-4" />
          <span>
            {startDate ? startDate.toLocaleString() : "Start Date & Time"}
          </span>
        </button>
        {startOpen && (
          <div className="absolute left-0 z-10 mt-2 flex bg-white p-2 shadow-lg border rounded-md">
            {/* Date Picker */}
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="yyyy-MM-dd"
              inline
            />
            {/* Time Picker */}
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={30}
              timeCaption="Time"
              dateFormat="h:mm aa"
              inline
              className="ml-2"
            />
          </div>
        )}
      </div>

      {/* End Date Picker */}
      <div className="relative">
        <button
          onClick={() => setEndOpen(!endOpen)}
          className="flex items-center gap-2 rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Calendar className="h-4 w-4" />
          <span>
            {endDate ? endDate.toLocaleString() : "End Date & Time"}
          </span>
        </button>
        {endOpen && (
          <div className="absolute left-0 z-10 mt-2 flex bg-white p-2 shadow-lg border rounded-md">
            {/* Date Picker */}
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="yyyy-MM-dd"
              inline
            />
            {/* Time Picker */}
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={30}
              timeCaption="Time"
              dateFormat="h:mm aa"
              inline
              className="ml-2"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DateRangePicker;
