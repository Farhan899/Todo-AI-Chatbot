"use client";

import { useState } from "react";
import {
  Check,
  Trash2,
  Loader2,
  Calendar,
  MoreHorizontal,
  Flag,
  Pencil,
} from "lucide-react";
import toast from "react-hot-toast";
import { toggleTaskCompletion, deleteTask } from "@/lib/api";
import { Task, Priority } from "@/lib/types";
import TaskEditModal from "./task-edit-modal";

interface TaskListProps {
  tasks: Task[];
  onTaskUpdated: (task: Task) => void;
  onTaskDeleted: (taskId: number) => void;
}

const priorityConfig: Record<
  Exclude<Priority, null>,
  { color: string; bgColor: string; label: string }
> = {
  high: { color: "text-red-600", bgColor: "bg-red-50", label: "High" },
  medium: { color: "text-amber-600", bgColor: "bg-amber-50", label: "Medium" },
  low: { color: "text-green-600", bgColor: "bg-green-50", label: "Low" },
};

function formatDueDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  today.setHours(0, 0, 0, 0);
  tomorrow.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  if (date.getTime() === today.getTime()) {
    return "Today";
  } else if (date.getTime() === tomorrow.getTime()) {
    return "Tomorrow";
  } else if (date < today) {
    return "Overdue";
  } else {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
}

function getDueDateColor(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  if (date < today) {
    return "text-red-600 bg-red-50";
  } else if (date.getTime() === today.getTime()) {
    return "text-blue-600 bg-blue-50";
  }
  return "text-gray-500 bg-gray-50";
}

export default function TaskList({
  tasks,
  onTaskUpdated,
  onTaskDeleted,
}: TaskListProps) {
  const [loadingTaskId, setLoadingTaskId] = useState<number | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  async function handleToggle(task: Task) {
    setLoadingTaskId(task.id);
    try {
      const updatedTask = await toggleTaskCompletion(task.id);
      onTaskUpdated(updatedTask);
      toast.success(
        updatedTask.is_completed ? "Task completed!" : "Task reopened"
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update task");
    } finally {
      setLoadingTaskId(null);
    }
  }

  async function handleDelete(taskId: number) {
    setMenuOpenId(null);
    setDeletingTaskId(taskId);
    try {
      await deleteTask(taskId);
      onTaskDeleted(taskId);
      toast.success("Task deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete task");
      setDeletingTaskId(null);
    }
  }

  function handleEdit(task: Task) {
    setMenuOpenId(null);
    setEditingTask(task);
  }

  return (
    <>
      <div className="space-y-3">
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className={`group bg-white rounded-xl border border-gray-100 p-4 card-hover animate-fade-in ${
              task.is_completed ? "opacity-60" : ""
            } ${deletingTaskId === task.id ? "opacity-40 scale-98" : ""}`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start gap-4">
              {/* Custom Checkbox */}
              <button
                onClick={() => handleToggle(task)}
                disabled={loadingTaskId === task.id || deletingTaskId === task.id}
                className={`flex-shrink-0 mt-0.5 w-[22px] h-[22px] rounded-md border-2 flex items-center justify-center transition-all duration-200 disabled:cursor-not-allowed ${
                  task.is_completed
                    ? "bg-blue-500 border-blue-500"
                    : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                }`}
              >
                {loadingTaskId === task.id ? (
                  <Loader2 size={14} className="animate-spin text-gray-400" />
                ) : (
                  task.is_completed && <Check size={14} className="text-white" />
                )}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3
                    className={`text-[15px] font-medium leading-snug ${
                      task.is_completed
                        ? "line-through text-gray-400"
                        : "text-gray-800"
                    }`}
                  >
                    {task.title}
                  </h3>

                  {/* More Menu */}
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() =>
                        setMenuOpenId(menuOpenId === task.id ? null : task.id)
                      }
                      className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
                    >
                      <MoreHorizontal size={16} />
                    </button>

                    {menuOpenId === task.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setMenuOpenId(null)}
                        />
                        <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20 animate-scale-in min-w-[140px]">
                          <button
                            onClick={() => handleEdit(task)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Pencil size={14} />
                            Edit task
                          </button>
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={14} />
                            Delete task
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Description */}
                {task.description && (
                  <p
                    className={`mt-1 text-sm leading-relaxed ${
                      task.is_completed ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {task.description}
                  </p>
                )}

                {/* Meta: Priority & Due Date */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {/* Priority Badge */}
                  {task.priority && (
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${
                        priorityConfig[task.priority].bgColor
                      } ${priorityConfig[task.priority].color}`}
                    >
                      <Flag size={10} />
                      {priorityConfig[task.priority].label}
                    </span>
                  )}

                  {/* Due Date Badge */}
                  {task.due_date && (
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${getDueDateColor(
                        task.due_date
                      )}`}
                    >
                      <Calendar size={10} />
                      {formatDueDate(task.due_date)}
                    </span>
                  )}

                  {/* Created Date */}
                  <span className="text-xs text-gray-400">
                    Created {new Date(task.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingTask && (
        <TaskEditModal
          task={editingTask}
          isOpen={true}
          onClose={() => setEditingTask(null)}
          onTaskUpdated={(updatedTask) => {
            onTaskUpdated(updatedTask);
            setEditingTask(null);
          }}
        />
      )}
    </>
  );
}

// Empty State Component
export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mb-6">
        <Check size={36} className="text-blue-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        No tasks yet
      </h3>
      <p className="text-gray-500 text-center max-w-sm">
        Get started by adding your first task above. Stay organized and boost
        your productivity!
      </p>
    </div>
  );
}
