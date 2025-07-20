import { Component, Ligature, LucideIcon, Palette } from "lucide-react";

export const ACTIVE_THEME_NAME_COOKIE = "active_theme_name";
export const ACTIVE_THEME_RADIUS_COOKIE = "active_theme_radius";
export const ACTIVE_THEME_OBJECT_COOKIE = "active_theme_object";
export const ACTIVE_THEME_CONFIG_COOKIE = "active_theme_config";

type Badge = "Soon" | "New";
export type NavLink = {
  href: string;
  title: string;
  icon?: LucideIcon;
  badge?: Badge;
};

export const NAV_LINKS: NavLink[] = [
  { href: "/themes", title: "Theme customizer", icon: Palette },
  { href: "/themes/components", title: "Components", icon: Component },
  {
    href: "/themes/fonts",
    title: "Fonts",
    icon: Ligature,
    badge: "Soon",
  },
];

