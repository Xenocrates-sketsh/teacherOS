"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Badge from "@/app/components/ui/Badge";

interface CalendarEvent {
  id: string;
  title: string;
  start_time: string;
  end_time?: string;
  event_type: string;
  class_id?: string;
}

interface CalendarProps {
  events: CalendarEvent[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

const eventTypeColors: Record<string, string> = {
  class: "bg-blue-500",
  homework_due: "bg-orange-500",
  exam: "bg-red-500/100/100/100/100/100/100/100",
  meeting: "bg-green-500/100/100/100/100/100/100/100",
  other: "bg-[rgba(212,175,55,0.15)]",
};

const eventTypeLabels: Record<string, string> = {
  class: "Class",
  homework_due: "Homework Due",
  exam: "Exam",
  meeting: "Meeting",
  other: "Other",
};

export default function Calendar({
  events,
  onDateClick,
  onEventClick,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-4">
      <button
        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        className="p-2 hover:bg-[rgba(212,175,55,0.08)] rounded-lg transition-colors"
      >
        <ChevronLeft className="w-5 h-5 text-[#9d8ab5]" />
      </button>
      <h2 className="text-lg font-semibold text-[#f8f4ff]">
        {format(currentMonth, "MMMM yyyy")}
      </h2>
      <button
        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        className="p-2 hover:bg-[rgba(212,175,55,0.08)] rounded-lg transition-colors"
      >
        <ChevronRight className="w-5 h-5 text-[#9d8ab5]" />
      </button>
    </div>
  );

  const renderDays = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return (
      <div className="grid grid-cols-7 mb-2">
        {days.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-[#7b6b8d] py-2"
          >
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = calStart;

    while (day <= calEnd) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const dayEvents = events.filter((event) =>
          isSameDay(new Date(event.start_time), cloneDay)
        );

        days.push(
          <div
            key={day.toString()}
            className={`min-h-[80px] p-2 border border-[rgba(212,175,55,0.08)] ${
              !isSameMonth(day, monthStart)
                ? "bg-surface text-[#6b5b7d]"
                : "bg-surface-card/80 backdrop-blur-xl hover:bg-[rgba(212,175,55,0.05)]"
            } ${
              selectedDate && isSameDay(day, selectedDate)
                ? "ring-2 ring-primary-500"
                : ""
            } cursor-pointer transition-colors`}
            onClick={() => {
              setSelectedDate(cloneDay);
              onDateClick?.(cloneDay);
            }}
          >
            <span
              className={`text-sm ${
                isSameDay(day, new Date())
                  ? "bg-primary-600 text-white w-6 h-6 rounded-full flex items-center justify-center"
                  : "text-[#cbd5e1]"
              }`}
            >
              {format(day, "d")}
            </span>
            <div className="mt-1 space-y-1">
              {dayEvents.slice(0, 2).map((event) => (
                <div
                  key={event.id}
                  className={`text-xs px-1.5 py-0.5 rounded text-white truncate ${
                    eventTypeColors[event.event_type] || "bg-[rgba(212,175,55,0.15)]"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick?.(event);
                  }}
                >
                  {event.title}
                </div>
              ))}
              {dayEvents.length > 2 && (
                <span className="text-xs text-[#7b6b8d]">
                  +{dayEvents.length - 2} more
                </span>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }

    return <div className="border border-[rgba(212,175,55,0.08)] rounded-lg overflow-hidden">{rows}</div>;
  };

  return (
    <div className="glass-card p-4">
      {renderHeader()}
      {renderDays()}
      {renderCells()}

      <div className="mt-4 flex flex-wrap gap-2">
        {Object.entries(eventTypeLabels).map(([type, label]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div
              className={`w-3 h-3 rounded-full ${
                eventTypeColors[type]
              }`}
            />
            <span className="text-xs text-[#7b6b8d]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
