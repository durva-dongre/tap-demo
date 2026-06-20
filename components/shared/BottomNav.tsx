"use client";
import { useRouter } from "next/navigation";
import { Home, MessageCircle, BookOpen, User } from "lucide-react";
import { useStudent } from "@/lib/student-context";

type Tab = "home" | "chat" | "passport" | "profile";
type Props = { active: Tab };

const ITEMS = [
  { key: "home" as Tab, label: "Home", icon: Home, route: "/home" },
  { key: "chat" as Tab, label: "Chat", icon: MessageCircle, route: "/chat" },
  { key: "passport" as Tab, label: "Passport", icon: BookOpen, route: "/passport" },
  { key: "profile" as Tab, label: "Profile", icon: User, route: "/profile" },
] as const;

export function BottomNav({ active }: Props) {
  const router = useRouter();
  const { student } = useStudent();
  const cityLogo = (student as any).cityLogo as string | undefined;

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex justify-center">
        <div
          className="w-full flex items-center justify-around px-2 py-2"
          style={{
            background: "var(--white)",
            borderTop: "1px solid var(--border-soft)",
          }}
        >
          {ITEMS.map(item => {
            const isActive = item.key === active;
            return (
              <button
                key={item.key}
                onClick={() => router.push(item.route)}
                className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors"
                style={{ color: isActive ? "var(--lavender-strong)" : "var(--text-muted)" }}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.6 : 2.1} />
                <span className="text-[10px] font-bold font-display">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <nav
        className="hidden lg:flex fixed left-0 top-0 bottom-0 z-30 flex-col py-6 px-3 gap-1"
        style={{
          width: "220px",
          background: "var(--white)",
          borderRight: "1px solid var(--border-soft)",
        }}
      >
        <div className="px-3 mb-6 flex items-center gap-2">
          {cityLogo && (
            <img src={cityLogo} alt="city logo" className="w-7 h-7 object-contain shrink-0" />
          )}
          <span className="font-display font-extrabold text-base leading-tight" style={{ color: "#000000" }}>
            The Apprentice Project
          </span>
        </div>
        {ITEMS.map(item => {
          const isActive = item.key === active;
          return (
            <button
              key={item.key}
              onClick={() => router.push(item.route)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left w-full"
              style={{
                background: isActive ? "var(--lavender)" : "transparent",
                color: isActive ? "var(--lavender-strong)" : "var(--text-muted)",
              }}
            >
              <item.icon size={18} strokeWidth={isActive ? 2.6 : 2.1} />
              <span className="text-sm font-bold font-display">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}