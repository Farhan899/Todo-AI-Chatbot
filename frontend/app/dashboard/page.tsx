"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Bell, X, Menu, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import { listTasks } from "@/lib/api";
import { Task } from "@/lib/types";
import TaskList, { EmptyState } from "@/components/task-list";
import TaskForm from "@/components/task-form";
import Sidebar, { type NavItem } from "@/components/sidebar";
import { DailyProgressCard } from "@/components/progress-ring";
import { DashboardSkeleton } from "@/components/skeleton";
import CalendarView from "@/components/calendar-view";
import { ChatWidget } from "@/components/ChatWidget";

type ActiveView = NavItem;

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>("all");
  const [showChatWidget, setShowChatWidget] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const quickAddRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuthAndLoadTasks();
  }, []);

  // Close quick add on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (quickAddRef.current && !quickAddRef.current.contains(event.target as Node)) {
        setShowQuickAdd(false);
      }
    }
    if (showQuickAdd) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showQuickAdd]);

  async function checkAuthAndLoadTasks() {
    try {
      const session = await authClient.getSession();

      if (!session?.data?.user) {
        router.push("/auth/signin");
        return;
      }

      setUserName(session.data.user.name || "User");
      setUserEmail(session.data.user.email || "");
      setUserId(session.data.user.id || "");
      setToken(session.data.session.token || "");

      const fetchedTasks = await listTasks();
      setTasks(fetchedTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await authClient.signOut();
    toast.success("Logged out successfully");
    router.push("/auth/signin");
  }

  function handleNavigate(view: ActiveView) {
    setActiveView(view);
    toast.success(`Switched to ${view.charAt(0).toUpperCase() + view.slice(1)} view`);
  }

  // Filter tasks based on active view and search
  const filteredTasks = useMemo(() => {
    let viewFilteredTasks = tasks;

    // First filter by view
    if (activeView === "all") {
      viewFilteredTasks = tasks; // Show all tasks
    } else if (activeView === "completed") {
      viewFilteredTasks = tasks.filter((task) => task.is_completed);
    } else if (activeView === "today") {
      const today = new Date().toISOString().split("T")[0];
      viewFilteredTasks = tasks.filter((task) => {
        return task.due_date === today;
      });
    } else if (activeView === "upcoming") {
      const today = new Date().toISOString().split("T")[0];
      const upcomingTasks = tasks.filter((task) => {
        return task.due_date && task.due_date > today && !task.is_completed;
      });
      // Sort by due_date and get only the first (earliest) one
      if (upcomingTasks.length > 0) {
        upcomingTasks.sort((a, b) => a.due_date!.localeCompare(b.due_date!));
        viewFilteredTasks = [upcomingTasks[0]]; // Only show the next upcoming task
      } else {
        viewFilteredTasks = [];
      }
    } else if (activeView === "calendar") {
      viewFilteredTasks = tasks; // Calendar handles its own filtering and display
    }

    // Then apply search filter
    if (!searchQuery.trim()) return viewFilteredTasks;
    const query = searchQuery.toLowerCase();
    return viewFilteredTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query)
    );
  }, [tasks, searchQuery, activeView]);

  // Calculate today's progress
  const todayStats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const todayTasks = tasks.filter((task) => {
      const taskDate = task.due_date || task.created_at.split("T")[0];
      return taskDate === today || (task.due_date && task.due_date <= today && !task.is_completed);
    });
    // If no tasks match the filter, show all tasks as "today" for demo purposes
    const relevantTasks = todayTasks.length > 0 ? todayTasks : tasks;
    return {
      total: relevantTasks.length,
      completed: relevantTasks.filter((t) => t.is_completed).length,
    };
  }, [tasks]);

  // Get greeting based on time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Sidebar */}
      <Sidebar
        activeItem={activeView}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        userName={userName}
        userEmail={userEmail}
        completedToday={todayStats.completed}
        totalToday={todayStats.total}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="lg:ml-[280px] min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 glass-header border-b border-gray-100">
          <div className="px-4 sm:px-6 lg:px-8 py-3 lg:py-4 flex items-center justify-between gap-2 sm:gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>

            {/* Search Bar - Desktop */}
            <div className="hidden sm:block relative flex-1 max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="w-full pl-10 pr-4 py-2.5 bg-blue-50/50 border-2 border-blue-100 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 shadow-md focus:outline-none focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-50 focus:shadow-lg transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Mobile: App Title */}
            <h1 className="sm:hidden text-lg font-semibold text-gray-800 flex-1 text-center">
              TaskFlow
            </h1>

            {/* Header Actions */}
            <div className="flex items-center gap-1 sm:gap-3">
              {/* Mobile Search Toggle */}
              <button
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className="sm:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <Search size={20} />
              </button>

              {/* Notifications */}
              <button className="p-2 sm:p-2.5 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 w-2 h-2 bg-blue-500 rounded-full" />
              </button>

              {/* Quick Add Button - Desktop */}
              <button
                onClick={() => setShowQuickAdd(!showQuickAdd)}
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus size={18} />
                <span className="text-sm font-medium">New Task</span>
              </button>

              {/* Quick Add Button - Mobile */}
              <button
                onClick={() => setShowQuickAdd(!showQuickAdd)}
                className="sm:hidden p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
              </button>

              {/* Profile Avatar - Desktop only */}
              {/* Chat Widget Toggle */}
              <button
                onClick={() => setShowChatWidget(!showChatWidget)}
                className={`hidden sm:flex w-10 h-10 rounded-xl items-center justify-center font-medium hover:ring-2 transition-all ${
                  showChatWidget
                    ? "bg-blue-500 text-white hover:ring-blue-200"
                    : "bg-gray-200 text-gray-600 hover:ring-blue-200"
                }`}
                title="Chat with AI Assistant"
              >
                <MessageCircle size={20} />
              </button>

              {/* Profile Avatar - Desktop only */}
              <button className="hidden sm:flex w-10 h-10 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 items-center justify-center text-gray-600 font-medium hover:ring-2 hover:ring-blue-200 transition-all">
                {userName.charAt(0).toUpperCase()}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar - Expandable */}
          {showMobileSearch && (
            <div className="sm:hidden px-4 pb-3 animate-fade-in">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks..."
                  autoFocus
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                />
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setShowMobileSearch(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Quick Add Modal */}
        {showQuickAdd && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setShowQuickAdd(false)}
            />
            <div ref={quickAddRef} className="relative w-full max-w-lg animate-scale-in">
              <TaskForm
                onTaskCreated={(newTask) => {
                  setTasks([newTask, ...tasks]);
                  setShowQuickAdd(false);
                }}
              />
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Error Message */}
          {error && (
            <div className="mb-4 sm:mb-6 rounded-xl bg-red-50 border border-red-100 p-3 sm:p-4 animate-fade-in">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Greeting & Stats */}
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-1">
              {activeView === "all"
                ? `${greeting}, ${userName.split(" ")[0]}!`
                : activeView === "today"
                ? `${greeting}, ${userName.split(" ")[0]}!`
                : activeView.charAt(0).toUpperCase() + activeView.slice(1)}
            </h1>
            <p className="text-sm sm:text-base text-gray-500">
              {activeView === "all" ? (
                `You have ${tasks.length} task${tasks.length !== 1 ? "s" : ""} in total`
              ) : activeView === "today" ? (
                todayStats.total === 0
                  ? "You have no tasks scheduled. Create one to get started!"
                  : todayStats.completed === todayStats.total
                  ? "All tasks completed! Great work!"
                  : `You have ${todayStats.total - todayStats.completed} task${
                      todayStats.total - todayStats.completed !== 1 ? "s" : ""
                    } to complete today.`
              ) : activeView === "upcoming" ? (
                "Your next upcoming task"
              ) : activeView === "completed" ? (
                "View all your completed tasks"
              ) : (
                "See tasks by due date"
              )}
            </p>
          </div>

          {/* Progress Card - Mobile (shown above task form on mobile) */}
          {activeView !== "calendar" && (
            <div className="lg:hidden mb-4">
              <DailyProgressCard
                completed={todayStats.completed}
                total={todayStats.total}
              />
            </div>
          )}

          {/* Progress Card & Task Form - Desktop Grid */}
          {activeView !== "calendar" && (
            <div className="hidden lg:grid grid-cols-3 gap-6 mb-8">
              <div className="col-span-2">
                <TaskForm onTaskCreated={(newTask) => setTasks([newTask, ...tasks])} />
              </div>
              <div>
                <DailyProgressCard
                  completed={todayStats.completed}
                  total={todayStats.total}
                />
              </div>
            </div>
          )}

          {/* Task Form - Mobile/Tablet (full width) */}
          {activeView !== "calendar" && (
            <div className="lg:hidden mb-4 sm:mb-6">
              <TaskForm onTaskCreated={(newTask) => setTasks([newTask, ...tasks])} />
            </div>
          )}

          {/* Calendar View */}
          {activeView === "calendar" && <CalendarView tasks={tasks} />}

          {/* Tasks Section */}
          {activeView !== "calendar" && (
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                  {searchQuery ? "Search Results" : "All Tasks"}
                </h2>
                {filteredTasks.length > 0 && (
                  <span className="text-xs sm:text-sm text-gray-500">
                    {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* Task List */}
              {filteredTasks.length === 0 ? (
                searchQuery ? (
                  <div className="text-center py-8 sm:py-12">
                    <p className="text-gray-500 text-sm sm:text-base">
                      No tasks found matching "{searchQuery}"
                    </p>
                    <button
                      onClick={() => setSearchQuery("")}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  <EmptyState />
                )
              ) : (
                <TaskList
                  tasks={filteredTasks}
                  onTaskUpdated={(updatedTask) => {
                    setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
                  }}
                  onTaskDeleted={(taskId) => {
                    setTasks(tasks.filter((t) => t.id !== taskId));
                  }}
                />
              )}
            </div>
          )}
        </main>

        {/* Chat Widget - Desktop Side Panel */}
        {showChatWidget && userId && (
          <div className="hidden lg:flex flex-col w-96 bg-white border-l border-gray-200 shadow-lg">
            <ChatWidget userId={userId} token={token} />
          </div>
        )}
      </div>

      {/* Chat Widget Modal - Mobile */}
      {showChatWidget && userId && (
        <div className="fixed inset-0 lg:hidden bg-black bg-opacity-50 z-50 flex flex-col">
          <div className="flex-1 bg-white rounded-t-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800">Chat Assistant</h2>
              <button
                onClick={() => setShowChatWidget(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-hidden">
              <ChatWidget userId={userId} token={token} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
