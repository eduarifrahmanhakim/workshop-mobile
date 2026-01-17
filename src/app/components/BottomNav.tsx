"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";


const tabs = [
{ href: "/", label: "Home", emoji: "🏠" },
{ href: "/before", label: "Before", emoji: "📷" },
{ href: "/services", label: "Services", emoji: "🛠️" },
{ href: "/profile", label: "Profile", emoji: "👤" },
];


export default function BottomNav() {
const pathname = usePathname();
return (
<nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t bg-white">
<ul className="flex items-center justify-around py-2">
{tabs.map((t) => {
const active = pathname === t.href;
return (
<li key={t.href}>
<Link
href={t.href}
className={`flex flex-col items-center text-xs ${active ? "text-blue-600" : "text-gray-500"}`}
>
<span aria-hidden>{t.emoji}</span>
<span>{t.label}</span>
</Link>
</li>
);
})}
</ul>
</nav>
);
}