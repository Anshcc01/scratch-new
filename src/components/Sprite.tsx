"use client"

import type React from "react"

interface SpriteProps {
  costume: string
  direction: number
  isSelected: boolean
  onClick: (e: React.MouseEvent) => void
  onMouseDown: (e: React.MouseEvent) => void
  collided?: boolean
}

const Sprite: React.FC<SpriteProps> = ({ costume, direction, isSelected, onClick, onMouseDown, collided = false }) => {
  return (
    <div
      className={`cursor-move ${isSelected ? "ring-2 ring-blue-500 rounded-full" : ""} ${
        collided ? "animate-pulse" : ""
      }`}
      onClick={onClick}
      onMouseDown={onMouseDown}
    >
      <div
        className={`relative inline-block ${collided ? "ring-4 ring-yellow-400 rounded-full" : ""}`}
        style={{
          transform: `rotate(${direction - 90}deg)`,
          transition: "transform 0.3s ease-in-out",
        }}
      >
        <div className="text-4xl">{costume}</div>
        {/* Direction indicator */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
          <div className="h-6 w-2 bg-red-500 rounded-t-full"></div>
        </div>
      </div>
    </div>
  )
}

export default Sprite
