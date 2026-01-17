
import Link from "next/link";

export default function Home() {
return (
<main className="pb-16">{/* space for bottom nav */}
<header className="sticky top-0 z-40 bg-blue-600 p-3 text-center text-white shadow">
<h1 className="text-lg font-bold">PT Mitra Toyotaka Indonesia</h1>
<p className="text-xs opacity-90">PT Mitra Toyotama Indonesia</p>
</header>




<section className="p-4 space-y-3">
<h2 className="text-base font-semibold">Quick Actions</h2>
<div className="grid grid-cols-2 gap-3">
<Link href="/before/create" className="rounded-xl bg-blue-50 p-4 text-blue-700 shadow-sm">
<div className="text-2xl">📷</div>
<div className="mt-1 text-sm font-medium">Create Service Request (Before)</div>
</Link>
<Link href="/services" className="rounded-xl bg-gray-50 p-4 text-gray-700 shadow-sm">
<div className="text-2xl">📝</div>
<div className="mt-1 text-sm font-medium">Cek SPK</div>
</Link>
</div>
</section>



</main>
);
}
