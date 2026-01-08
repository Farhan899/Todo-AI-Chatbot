"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  CheckCircle2,
  FolderKanban,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Sun,
  LogOut,
  X,
  Menu,
  CheckCheck,
  ListTodo,
} from "lucide-react";

export type NavItem = "all" | "today" | "upcoming" | "completed" | "projects" | "calendar";

interface SidebarProps {
  activeItem?: NavItem;
  onNavigate?: (item: NavItem) => void;
  onLogout?: () => void;
  userName?: string;
  userEmail?: string;
  completedToday?: number;
  totalToday?: number;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({
  activeItem = "all",
  onNavigate,
  onLogout,
  userName = "User",
  userEmail = "",
  completedToday = 0,
  totalToday = 0,
  isMobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Close mobile sidebar on escape key
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape" && isMobileOpen) {
        onMobileClose?.();
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMobileOpen, onMobileClose]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const navItems: { id: NavItem; label: string; icon: typeof Sun }[] = [
    { id: "all", label: "All Tasks", icon: ListTodo },
    { id: "today", label: "Today", icon: Sun },
    { id: "upcoming", label: "Upcoming", icon: CalendarDays },
    { id: "completed", label: "Completed", icon: CheckCheck },
    { id: "calendar", label: "Calendar", icon: Calendar },
  ];

  const progress = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-100">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-md">
              <CheckCircle2 size={22} className="text-white" />
            </div>
            <span className="font-semibold text-lg text-gray-800">TaskFlow</span>
          </div>
        )}
        {/* Desktop collapse button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
        {/* Mobile close button */}
        <button
          onClick={onMobileClose}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      </div>

      {/* Daily Progress */}
      {!isCollapsed && totalToday > 0 && (
        <div className="mx-4 mt-4 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-800">Today's Progress</span>
            <span className="text-sm font-semibold text-blue-600">
              {completedToday}/{totalToday}
            </span>
          </div>
          <div className="h-2 bg-blue-200/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          {progress === 100 && (
            <p className="mt-2 text-xs text-blue-600 font-medium">
              All done for today!
            </p>
          )}
        </div>
      )}

      {/* Collapsed Progress Ring */}
      {isCollapsed && totalToday > 0 && (
        <div className="flex justify-center mt-4">
          <div className="relative w-12 h-12">
            <svg className="progress-ring w-12 h-12" viewBox="0 0 48 48">
              <circle
                className="text-gray-200"
                strokeWidth="4"
                stroke="currentColor"
                fill="transparent"
                r="18"
                cx="24"
                cy="24"
              />
              <circle
                className="text-blue-500 progress-ring__circle"
                strokeWidth="4"
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="18"
                cx="24"
                cy="24"
                style={{
                  strokeDasharray: `${2 * Math.PI * 18}`,
                  strokeDashoffset: `${2 * Math.PI * 18 * (1 - progress / 100)}`,
                }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-700">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 mt-4 px-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    onNavigate?.(item.id);
                    onMobileClose?.();
                  }}
                  className={`nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                    isActive
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  } ${isCollapsed ? "justify-center" : ""}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon
                    size={20}
                    className={isActive ? "text-blue-600" : "text-gray-500"}
                  />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile & Logout */}
      <div className="p-3 border-t border-gray-100">
        {!isCollapsed ? (
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-medium text-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{userName}</p>
              {userEmail && (
                <p className="text-xs text-gray-500 truncate">{userEmail}</p>
              )}
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-medium text-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex fixed left-0 top-0 h-screen bg-white border-r border-gray-100 flex-col z-40 transition-all duration-300 ${
          isCollapsed ? "w-[72px]" : "w-[280px]"
        }`}
        style={{
          boxShadow: "2px 0 8px rgba(0,0,0,0.03)",
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`lg:hidden fixed left-0 top-0 h-screen w-[280px] bg-white border-r border-gray-100 flex flex-col z-50 transition-transform duration-300 ease-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          boxShadow: isMobileOpen ? "2px 0 8px rgba(0,0,0,0.1)" : "none",
        }}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

// Mobile Menu Button Component
export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
      aria-label="Open menu"
    >
      <Menu size={24} />
    </button>
  );
}
