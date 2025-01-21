"use client"

import dynamic from "next/dynamic"
import { Suspense, useState } from "react"
import { Search } from "lucide-react"
import ResortList from "@/components/ResortList"
import { ResortName } from '@/app/json/resortCoordinates'

const TerrainMap = dynamic(() => import("@/components/TerrainMap"), {
  ssr: false,
  loading: () => <div>Loading map...</div>
})

export default function Home() {
  const [selectedResort, setSelectedResort] = useState<ResortName>('Palisades Tahoe');

  return (
    <main className="flex flex-col h-screen">

      <ResortList 
        onResortChange={setSelectedResort}
        selectedResort={selectedResort}
      />
      <div className="flex-1 relative">
        <div className="absolute top-4 right-4 bg-black/30 text-white px-4 py-2 rounded-lg backdrop-blur-sm z-10">
          {selectedResort}
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <TerrainMap resortName={selectedResort} />
        </Suspense>
      </div>
    </main>
  )
}

