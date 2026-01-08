"use client";

import { useState } from "react";
import { Plus, Calendar, Flag, X, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { createTask } from "@/lib/api";
import { Task, Priority } from "@/lib/types";

interface TaskFormProps {
  onTaskCreated: (task: Task) => void;
}

const priorityOptions: { value: Priority; label: string; color: string }[] = [
  { value: "high", label: "High", color: "bg-red-500" },
  { value: "medium", label: "Medium", color: "bg-amber-500" },
  { value: "low", label: "Low", color: "bg-green-500" },
];

export default function TaskForm({ onTaskCreated }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>(null);
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    if (title.length > 200) {
      toast.error("Title must be 200 characters or less");
      return;
    }

    if (description.length > 2000) {
      toast.error("Description must be 2000 characters or less");
      return;
    }

    setLoading(true);

    try {
      const newTask = await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        priority: priority,
        due_date: dueDate || undefined,
      });

      onTaskCreated(newTask);
      toast.success("Task created!");

      // Reset form
      setTitle("");
      setDescription("");
      setPriority(null);
      setDueDate("");
      setIsExpanded(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create task";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey && !isExpanded) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  const selectedPriority = priorityOptions.find((p) => p.value === priority);

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in"
    >
      {/* Quick Add Input */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
            <Plus size={14} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsExpanded(true)}
            placeholder="Add a new task..."
            className="flex-1 text-gray-800 placeholder:text-gray-400 focus:outline-none text-[15px]"
            maxLength={200}
          />
          {!isExpanded && title.trim() && (
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2 text-sm py-2 px-4"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Plus size={16} />
                  Add
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Expanded Form */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4 animate-fade-in">
          {/* Description */}
          <div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              rows={2}
              className="w-full text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none resize-none"
              maxLength={2000}
            />
          </div>

          {/* Options Row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Priority Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPriorityMenu(!showPriorityMenu)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  priority
                    ? "bg-gray-100 text-gray-700"
                    : "hover:bg-gray-100 text-gray-500"
                }`}
              >
                <Flag size={14} className={selectedPriority ? "text-current" : ""} />
                <span>{selectedPriority?.label || "Priority"}</span>
                {priority && (
                  <span className={`w-2 h-2 rounded-full ${selectedPriority?.color}`} />
                )}
                <ChevronDown size={14} />
              </button>

              {showPriorityMenu && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10 animate-scale-in">
                  {priorityOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setPriority(option.value);
                        setShowPriorityMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <span className={`w-2 h-2 rounded-full ${option.color}`} />
                      {option.label}
                    </button>
                  ))}
                  {priority && (
                    <>
                      <div className="border-t border-gray-100 my-1" />
                      <button
                        type="button"
                        onClick={() => {
                          setPriority(null);
                          setShowPriorityMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50"
                      >
                        <X size={14} />
                        Clear priority
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Due Date */}
            <div className="relative">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <Calendar size={14} className="text-gray-500" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="text-sm text-gray-600 focus:outline-none bg-transparent cursor-pointer"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            {/* Clear Due Date */}
            {dueDate && (
              <button
                type="button"
                onClick={() => setDueDate("")}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                setIsExpanded(false);
                setDescription("");
                setPriority(null);
                setDueDate("");
              }}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="btn-primary flex items-center gap-2 text-sm py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              Add Task
            </button>
          </div>
        </div>
      )}
    </form>
  );
}

// Quick Add Button (for header)
export function QuickAddButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="quick-add-btn"
      aria-label="Quick add task"
    >
      <Plus size={22} />
    </button>
  );
}
