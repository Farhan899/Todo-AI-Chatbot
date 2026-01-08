"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Flag, ChevronDown, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { updateTask } from "@/lib/api";
import { Task, Priority } from "@/lib/types";

interface TaskEditModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated: (task: Task) => void;
}

const priorityOptions: { value: Priority; label: string; color: string }[] = [
  { value: "high", label: "High", color: "bg-red-500" },
  { value: "medium", label: "Medium", color: "bg-amber-500" },
  { value: "low", label: "Low", color: "bg-green-500" },
];

export default function TaskEditModal({
  task,
  isOpen,
  onClose,
  onTaskUpdated,
}: TaskEditModalProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [dueDate, setDueDate] = useState(task.due_date || "");
  const [loading, setLoading] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);

  // Reset form when task changes
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || "");
    setPriority(task.priority);
    setDueDate(task.due_date || "");
  }, [task]);

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
      const updatedTask = await updateTask(task.id, {
        title: title.trim(),
        description: description.trim() || null,
        priority: priority,
        due_date: dueDate || null,
      });

      onTaskUpdated(updatedTask);
      toast.success("Task updated!");
      onClose();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update task";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  const selectedPriority = priorityOptions.find((p) => p.value === priority);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Edit Task</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label
              htmlFor="edit-title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="edit-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
              maxLength={200}
            />
            <p className="mt-1 text-xs text-gray-400">{title.length}/200</p>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="edit-description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              rows={3}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
              maxLength={2000}
            />
            <p className="mt-1 text-xs text-gray-400">
              {description.length}/2000
            </p>
          </div>

          {/* Priority & Due Date Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Priority Dropdown */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <button
                type="button"
                onClick={() => setShowPriorityMenu(!showPriorityMenu)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm hover:bg-gray-100 transition-colors min-w-[130px]"
              >
                <Flag size={14} className="text-gray-500" />
                <span className="flex-1 text-left">
                  {selectedPriority?.label || "None"}
                </span>
                {priority && (
                  <span
                    className={`w-2 h-2 rounded-full ${selectedPriority?.color}`}
                  />
                )}
                <ChevronDown size={14} className="text-gray-400" />
              </button>

              {showPriorityMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowPriorityMenu(false)}
                  />
                  <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 animate-scale-in min-w-[130px]">
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
                        <span
                          className={`w-2 h-2 rounded-full ${option.color}`}
                        />
                        {option.label}
                      </button>
                    ))}
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
                      Clear
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
                <Calendar size={14} className="text-gray-500" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="text-sm text-gray-700 focus:outline-none bg-transparent cursor-pointer"
                />
                {dueDate && (
                  <button
                    type="button"
                    onClick={() => setDueDate("")}
                    className="p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
