"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"
import { Search } from "lucide-react"

const TerrainMap = dynamic(() => import("@/components/TerrainMap"), {
  ssr: false,
  loading: () => <div>Loading map...</div>
})

export default function Home() {
  return (
    <main className="flex flex-col h-screen">
      <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm">
        {/* Search Box */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-md border border-gray-200/20">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search lifts..."
            className="bg-transparent outline-none text-white placeholder-gray-400"
          />
          <button className="p-1 hover:bg-white/10 rounded">
            <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 relative">
        <Suspense fallback={<div>Loading...</div>}>
          <TerrainMap />
        </Suspense>
      </div>
    </main>
  )
}

