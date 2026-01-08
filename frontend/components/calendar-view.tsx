"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Task } from "@/lib/types";

interface CalendarViewProps {
  tasks: Task[];
}

export default function CalendarView({ tasks }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { year, month } = useMemo(() => {
    return {
      year: currentDate.getFullYear(),
      month: currentDate.getMonth(),
    };
  }, [currentDate]);

  const daysInMonth = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }, [year, month]);

  const tasksByDate = useMemo(() => {
    const byDate: Record<string, Task[]> = {};
    tasks.forEach((task) => {
      if (task.due_date) {
        if (!byDate[task.due_date]) {
          byDate[task.due_date] = [];
        }
        byDate[task.due_date].push(task);
      }
    });
    return byDate;
  }, [tasks]);

  const monthName = useMemo(() => {
    return currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [currentDate]);

  function goToPreviousMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function goToNextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  function goToToday() {
    setCurrentDate(new Date());
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-800">{monthName}</h2>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            Today
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dateStr = date.toISOString().split("T")[0];
          const dayTasks = tasksByDate[dateStr] || [];
          const isToday = date.getTime() === today.getTime();
          const isPast = date.getTime() < today.getTime();

          return (
            <div
              key={dateStr}
              className={`relative aspect-square p-1 ${dayTasks.length > 0 ? "group cursor-pointer" : ""}`}
            >
              <div
                className={`w-full h-full rounded-lg flex flex-col items-center justify-center text-sm transition-all border-2 ${
                  isToday
                    ? "bg-blue-600 text-white font-semibold border-blue-600"
                    : dayTasks.length > 0
                    ? "border-blue-300 bg-blue-50"
                    : isPast
                    ? "text-gray-400"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>{date.getDate()}</span>
                {dayTasks.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dayTasks.slice(0, 3).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${
                          isToday ? "bg-white" : "bg-blue-500"
                        }`}
                      />
                    ))}
                    {dayTasks.length > 3 && (
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          isToday ? "bg-white" : "bg-blue-300"
                        }`}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Tooltip */}
              {dayTasks.length > 0 && (
                <div className="absolute z-50 left-1/2 bottom-full mb-2 -translate-x-1/2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none">
                  <div className="bg-gray-900 text-white text-xs rounded-lg shadow-xl p-3 min-w-[200px] max-w-[280px]">
                    <div className="font-medium mb-2">
                      {date.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {dayTasks.map((task) => (
                        <div key={task.id} className="border-l-2 border-blue-400 pl-2">
                          <div className="font-medium truncate">{task.title}</div>
                          {task.description && (
                            <div className="text-gray-400 text-xs line-clamp-2">
                              {task.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Tooltip arrow */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-gray-900" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Task due date</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-600" />
            <span>Today</span>
          </div>
        </div>
      </div>
    </div>
  );
}
