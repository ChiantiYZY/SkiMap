"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"

const TerrainMap = dynamic(() => import("@/components/TerrainMap"), {
  ssr: false,
  loading: () => <div>Loading map...</div>
})

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex justify-between w-full">
        <h1 className="text-4xl font-bold mb-8">Palisades Tahoe Ski Map</h1>
      </div>

      <div className="w-full h-[600px] relative">
        <Suspense fallback={<div>Loading...</div>}>
          <TerrainMap />
        </Suspense>
      </div>

    </main>
  )
}

