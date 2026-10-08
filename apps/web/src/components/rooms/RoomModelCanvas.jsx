import { useMemo } from 'react'
import { Canvas, useLoader } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { DoubleSide, MeshStandardMaterial } from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { CENTER, ZONES } from './zones.js'

function Model() {
  const source = useLoader(OBJLoader, '/models/urbanedge-shell.obj')
  const copy = useMemo(() => {
    const object = source.clone()
    const walls = new MeshStandardMaterial({ color: 0xe7e4dd, side: DoubleSide, roughness: .9 })
    const glass = new MeshStandardMaterial({ color: 0xa4c4ce, side: DoubleSide, transparent: true, opacity: .28, depthWrite: false })
    object.traverse((part) => {
      if (part.isMesh) part.material = part.material?.name === 'Glass' ? glass : walls
    })
    object.scale.setScalar(.001)
    object.position.set(-CENTER.x, 0, -CENTER.z)
    return object
  }, [source])
  return <primitive object={copy} />
}

export default function RoomModelCanvas({ active, onSelect, reduced, onReady, onFailure }) {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [10, 13, 14], fov: 43, near: .1, far: 100 }} frameloop="demand" gl={{ antialias: true, powerPreference: 'low-power' }} onCreated={({ gl }) => { onReady(); gl.domElement.addEventListener('webglcontextlost', onFailure, { once: true }) }} onError={onFailure}>
      <color attach="background" args={['#1a1a1a']} />
      <ambientLight intensity={2} />
      <directionalLight position={[-4, 10, 7]} intensity={2.4} />
      <directionalLight position={[6, 7, -4]} intensity={1.1} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -.025, 0]}><planeGeometry args={[14.1, 7.7]} /><meshStandardMaterial color="#343433" /></mesh>
      <gridHelper args={[14, 28, '#50504a', '#393936']} position={[0, -.016, 0]} />
      {ZONES.map((zone) => <group key={zone.id} position={[zone.x - CENTER.x, 0, zone.z - CENTER.z]}>
        <mesh position={[0, .065, 0]} rotation={[-Math.PI / 2, 0, 0]} onClick={(event) => { event.stopPropagation(); onSelect(zone.id) }} onPointerOver={() => { document.body.style.cursor = 'pointer' }} onPointerOut={() => { document.body.style.cursor = '' }}>
          <planeGeometry args={[zone.w, zone.d]} />
          <meshBasicMaterial color={active === zone.id ? '#f5c518' : '#c6b567'} transparent opacity={active === zone.id ? .9 : .21} depthWrite={false} side={DoubleSide} />
        </mesh>
        <mesh position={[0, 2.16, 0]} onClick={(event) => { event.stopPropagation(); onSelect(zone.id) }}><sphereGeometry args={[.19, 16, 12]} /><meshStandardMaterial color={active === zone.id ? '#f5c518' : '#bfbfba'} emissive={active === zone.id ? '#f5c518' : '#000000'} emissiveIntensity={.3} /></mesh>
        {active === zone.id && <mesh position={[0, 1.12, 0]}><cylinderGeometry args={[.014, .014, 2.05, 8]} /><meshBasicMaterial color="#f5c518" /></mesh>}
      </group>)}
      <Model />
      <OrbitControls enablePan={false} enableDamping={!reduced} minDistance={10} maxDistance={31} minPolarAngle={.35} maxPolarAngle={1.25} target={[0, .15, 0]} />
    </Canvas>
  )
}
