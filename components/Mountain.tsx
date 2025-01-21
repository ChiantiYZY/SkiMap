import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import type { Mesh } from "three"

export default function Mountain() {
  const mountainRef = useRef<Mesh>(null!)

  useFrame(() => {
    if (mountainRef.current) {
      mountainRef.current.rotation.y += 0.001
    }
  })

  return (
    <mesh ref={mountainRef} position={[0, -2, 0]}>
      <coneGeometry args={[10, 10, 32]} />
      <meshStandardMaterial color="white" />
    </mesh>
  )
}

