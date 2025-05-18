"use client"

import type React from "react"
import { useRef, useState } from "react"
import type { Sprite as SpriteType } from "../types"
import Sprite from "./Sprite"

interface SpriteCanvasProps {
  sprites: SpriteType[]
  selectedSpriteId: string
  setSelectedSpriteId: (id: string) => void
  updateSpritePosition: (id: string, x: number, y: number) => void
  collisionOccurred: boolean
}

const SpriteCanvas: React.FC<SpriteCanvasProps> = ({
  sprites,
  selectedSpriteId,
  setSelectedSpriteId,
  updateSpritePosition,
  collisionOccurred,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [draggingSprite, setDraggingSprite] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const handleSpriteClick = (spriteId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedSpriteId(spriteId)
  }

  const handleMouseDown = (spriteId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const sprite = sprites.find((s) => s.id === spriteId)
    if (!sprite) return

    setDraggingSprite(spriteId)
    setSelectedSpriteId(spriteId)

    // Calculate offset from sprite center to mouse position
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    const offsetX = e.clientX - rect.left - rect.width / 2
    const offsetY = e.clientY - rect.top - rect.height / 2

    setDragOffset({ x: offsetX, y: offsetY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingSprite || !canvasRef.current) return

    const canvasRect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - canvasRect.left - dragOffset.x
    const y = e.clientY - canvasRect.top - dragOffset.y

    updateSpritePosition(draggingSprite, x, y)
  }

  const handleMouseUp = () => {
    setDraggingSprite(null)
  }

  return (
    <div
      ref={canvasRef}
      className={`w-full h-full bg-white border-2 border-gray-300 rounded-md relative overflow-hidden ${
        collisionOccurred ? "bg-yellow-50" : ""
      }`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Debug info for canvas dimensions */}
      <div className="absolute top-0 left-0 bg-black bg-opacity-50 text-white text-xs p-1 z-50">
        Canvas:{" "}
        {canvasRef.current ? `${canvasRef.current.clientWidth}x${canvasRef.current.clientHeight}` : "Loading..."}
      </div>

      {sprites.map((sprite) => (
        <div
          key={sprite.id}
          data-sprite-id={sprite.id}
          className={`absolute transition-all duration-300 ${sprite.collided ? "scale-110" : ""}`}
          style={{
            left: `${sprite.x}px`,
            top: `${sprite.y}px`,
            transform: `translate(-50%, -50%)`,
            zIndex: selectedSpriteId === sprite.id ? 10 : 1,
          }}
        >
          {/* Debug info for sprite position */}
          <div className="absolute -top-5 left-0 bg-blue-500 bg-opacity-75 text-white text-xs px-1 rounded">
            {sprite.x.toFixed(0)},{sprite.y.toFixed(0)}
          </div>

          <Sprite
            costume={sprite.costume}
            direction={sprite.direction}
            isSelected={selectedSpriteId === sprite.id}
            onClick={(e) => handleSpriteClick(sprite.id, e)}
            onMouseDown={(e) => handleMouseDown(sprite.id, e)}
            collided={sprite.collided}
          />

          {/* Speech bubble */}
          {sprite.saying && (
            <div
              className="absolute bg-white border-2 border-black rounded-lg p-2 max-w-xs z-20"
              style={{
                left: `30px`,
                top: `-50px`,
              }}
            >
              {sprite.saying}
              <div
                className="absolute w-4 h-4 bg-white border-r-2 border-b-2 border-black transform rotate-45"
                style={{
                  left: "-5px",
                  bottom: "10px",
                }}
              />
            </div>
          )}

          {/* Thought bubble */}
          {sprite.thinking && (
            <div
              className="absolute bg-white border-2 border-black rounded-lg p-2 max-w-xs z-20"
              style={{
                left: `30px`,
                top: `-50px`,
              }}
            >
              {sprite.thinking}
              <div className="absolute flex flex-col items-center" style={{ left: "-15px", bottom: "5px" }}>
                <div className="w-3 h-3 bg-white border border-black rounded-full mb-1" />
                <div className="w-5 h-5 bg-white border border-black rounded-full" />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default SpriteCanvas
