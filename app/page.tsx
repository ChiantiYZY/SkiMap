"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { useRunsData } from "@/components/SkiRuns"
import { skiRunsData } from "@/components/SkiRuns"

const SkiMap = dynamic(() => import("@/components/SkiMap"), { ssr: false })

export default function Home() {
  const { dynamicRuns, handleFetchRuns } = useRunsData();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex justify-between w-full">
        <h1 className="text-4xl font-bold mb-8">3D Ski Map Visualization</h1>
      </div>

      <div className="w-full h-[600px] relative">
        <Suspense fallback={<div>Loading...</div>}>
          <SkiMap dynamicRuns={dynamicRuns} />
        </Suspense>
      </div>

      <div className="mt-8 flex gap-4">
        <Button>Toggle Ski Runs</Button>
        <Button 
          onClick={handleFetchRuns}
        >
          Fetch Runs
        </Button>
      </div>
    </main>
  )
}

