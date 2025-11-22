import {
    ClipboardList,
    Utensils,
    Backpack,
    HeartPulse,
    ShieldAlert,
    BookOpen,
    Wrench,
    Car,
    Flame,
    Lightbulb
} from "lucide-react"

export const KNOWLEDGE_CATEGORIES = [
  {
    id: "basics-planning",
    label: "Basics & Planning",
    icon: ClipboardList,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  {
    id: "food-water",
    label: "Food & Water",
    icon: Utensils,
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  {
    id: "gear-equipment",
    label: "Gear & Equipment",
    icon: Backpack,
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
  },
  {
    id: "first-aid-health",
    label: "First Aid & Health",
    icon: HeartPulse,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
  },
  {
    id: "home-defense",
    label: "Home Defense & Security",
    icon: ShieldAlert,
    color: "text-slate-700",
    bg: "bg-slate-100",
    border: "border-slate-300",
  },
  {
    id: "disaster-guides",
    label: "Disaster Guides",
    icon: BookOpen,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
  },
  {
    id: "skills-diy",
    label: "Skills & DIY",
    icon: Wrench,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  {
    id: "vehicle-prep",
    label: "Vehicle Prep",
    icon: Car,
    color: "text-zinc-600",
    bg: "bg-zinc-100",
    border: "border-zinc-300",
  },
  {
    id: "survival",
    label: "Survival",
    icon: Flame,
    color: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
  },
  {
    id: "other",
    label: "Other",
    icon: Lightbulb,
    color: "text-gray-600",
    bg: "bg-gray-50",
    border: "border-gray-200",
  }
] as const

export function getCategoryById(id: string) {
    return KNOWLEDGE_CATEGORIES.find(c => c.id === id) || KNOWLEDGE_CATEGORIES.find(c => c.id === 'other')!
}
