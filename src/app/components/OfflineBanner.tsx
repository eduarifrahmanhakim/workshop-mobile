"use client";
import { useEffect, useState } from "react";


export default function OfflineBanner() {
const [online, setOnline] = useState(true);
useEffect(() => {
const update = () => setOnline(navigator.onLine);
update();
window.addEventListener("online", update);
window.addEventListener("offline", update);
return () => {
window.removeEventListener("online", update);
window.removeEventListener("offline", update);
};
}, []);


if (online) return null;
return (
<div className="bg-amber-100 text-amber-900 px-3 py-2 text-sm text-center">
Anda sedang offline. Beberapa fitur mungkin terbatas.
</div>
);
}