import { Canvas } from "@react-three/fiber"
import { OrbitControls, Sky, Environment } from "@react-three/drei"
import Mountain from "./Mountain"
import SkiRuns from "./SkiRuns"
import { RunData } from "./SkiRuns"

interface SkiMapProps {
  dynamicRuns: RunData[];
}

export default function SkiMap({ dynamicRuns }: SkiMapProps) {
  return (
    <Canvas camera={{ position: [0, 10, 20], fov: 75 }}>
      <Sky sunPosition={[100, 20, 100]} />
      <Environment preset="sunset" />
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <Mountain />
      <SkiRuns dynamicRuns={dynamicRuns} />
      <OrbitControls />
    </Canvas>
  )
}

