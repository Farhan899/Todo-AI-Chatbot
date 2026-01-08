"use client";

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  className?: string;
}

export default function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 6,
  showLabel = true,
  className = "",
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        className="progress-ring"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background circle */}
        <circle
          className="text-gray-100"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          className="text-blue-500 progress-ring__circle"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      {showLabel && (
        <span className="absolute text-sm font-semibold text-gray-700">
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
}

// Daily Progress Card with Ring
interface DailyProgressProps {
  completed: number;
  total: number;
}

export function DailyProgressCard({ completed, total }: DailyProgressProps) {
  const progress = total > 0 ? (completed / total) * 100 : 0;
  const isAllDone = completed === total && total > 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-fade-in">
      <div className="flex items-center gap-6">
        <ProgressRing progress={progress} size={72} strokeWidth={6} />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Today's Progress</h3>
          <p className="text-2xl font-semibold text-gray-800">
            {completed} <span className="text-gray-400 font-normal">/ {total}</span>
          </p>
          {isAllDone ? (
            <p className="text-sm text-blue-600 font-medium mt-1">
              All tasks completed!
            </p>
          ) : total > 0 ? (
            <p className="text-sm text-gray-500 mt-1">
              {total - completed} task{total - completed !== 1 ? "s" : ""} remaining
            </p>
          ) : (
            <p className="text-sm text-gray-400 mt-1">No tasks for today</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Inline Progress Bar
interface ProgressBarProps {
  progress: number;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({
  progress,
  className = "",
  showLabel = false,
}: ProgressBarProps) {
  return (
    <div className={`${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">Progress</span>
          <span className="text-xs font-medium text-gray-700">{Math.round(progress)}%</span>
        </div>
      )}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
