import { Html } from '@react-three/drei'

export function TooltipHelp({ text, position = [0, 0, 0] as [number, number, number] }) {
  return (
    <Html position={position} style={{ pointerEvents: 'none' }}>
      <div style={{ background: 'rgba(0,0,0,0.65)', color: '#fff', padding: '6px 8px', borderRadius: 6, fontSize: 12 }}>
        {text}
      </div>
    </Html>
  )
}

export default TooltipHelp


