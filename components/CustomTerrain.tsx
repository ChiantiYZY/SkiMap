import { useEffect } from 'react'
import * as THREE from 'three'
import { useLoader } from '@react-three/fiber'

export default function CustomTerrain() {
  const heightMap = useLoader(
    THREE.TextureLoader,
    '/palisades-heightmap.png'  // You'll need to generate this
  )

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
      <planeGeometry args={[60, 60, 128, 128]} />
      <meshStandardMaterial 
        displacementMap={heightMap}
        displacementScale={10}
      />
    </mesh>
  )
} 