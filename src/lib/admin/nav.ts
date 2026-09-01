import {
  Calendar,
  Columns3,
  FileText,
  HelpCircle,
  Image,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  Star,
  Users,
  Wrench,
  Boxes,
  ListOrdered,
} from "lucide-react";

export const crmNav = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Leads", href: "/admin/leads", icon: MessageSquare },
  { label: "Calendar", href: "/admin/calendar", icon: Calendar },
  { label: "Kanban", href: "/admin/kanban", icon: Columns3 },
  { label: "Bookings", href: "/admin/bookings", icon: ListOrdered },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes },
] as const;

export const contentNav = [
  { label: "Site Settings", href: "/admin/content/site-settings", icon: Settings },
  { label: "Services", href: "/admin/content/services", icon: Wrench },
  { label: "Packages", href: "/admin/content/packages", icon: Package },
  { label: "Gallery", href: "/admin/gallery", icon: Image },
  { label: "Testimonials", href: "/admin/content/testimonials", icon: Star },
  { label: "FAQ", href: "/admin/content/faqs", icon: HelpCircle },
  { label: "Page Copy", href: "/admin/content/page-copy", icon: FileText },
] as const;

export const settingsNav = [
  { label: "Google Drive", href: "/admin/settings/google-drive", icon: Settings },
] as const;
