"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useDrag } from "react-dnd"
import type { Block } from "../types"

interface EditableBlockProps {
  block: Block
  updateBlock: (blockId: string, updates: Partial<Block>) => void
  removeBlock: (blockId: string) => void
  spriteId: string
  isDemoMode?: boolean
}

const EditableBlock: React.FC<EditableBlockProps> = ({
  block,
  updateBlock,
  removeBlock,
  spriteId,
  isDemoMode = false,
}) => {
  const [isEditing, setIsEditing] = useState(false)

  // Auto-open editing for new blocks with null values
  useEffect(() => {
    if (
      (block.type === "move" && block.steps === null) ||
      (block.type === "turn" && block.degrees === null) ||
      (block.type === "goto" && (block.x === null || block.y === null)) ||
      (block.type === "say" && (block.duration === null || block.text === "")) ||
      (block.type === "think" && (block.duration === null || block.text === "")) ||
      (block.type === "repeat" && block.count === null)
    ) {
      setIsEditing(true)
    }
  }, [block])

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "SPRITE_BLOCK",
    item: { ...block, spriteId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: !isDemoMode, // Disable dragging in demo mode
  }))

  const getBlockColor = (category: string) => {
    switch (category) {
      case "motion":
        return "bg-blue-500"
      case "looks":
        return "bg-purple-500"
      case "control":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const value =
      e.target.type === "number" ? (e.target.value ? Number.parseFloat(e.target.value) : null) : e.target.value
    updateBlock(block.id, { [field]: value })
  }

  const handleDelete = () => {
    removeBlock(block.id)
  }

  // Get placeholder or default values
  const getSteps = () => (block.steps === null ? "" : block.steps)
  const getDegrees = () => (block.degrees === null ? "" : block.degrees)
  const getX = () => (block.x === null ? "" : block.x)
  const getY = () => (block.y === null ? "" : block.y)
  const getText = () => block.text || ""
  const getDuration = () => (block.duration === null ? "" : block.duration)
  const getCount = () => (block.count === null ? "" : block.count)

  return (
    <div
      ref={!isDemoMode ? drag : undefined}
      className={`${getBlockColor(block.category)} text-white p-2 rounded-md mb-2 relative ${
        isDemoMode ? "cursor-not-allowed" : "cursor-move"
      } ${isDragging ? "opacity-50" : "opacity-100"}`}
      onClick={(e) => {
        if (isDemoMode) return
        e.stopPropagation()
        setIsEditing(true)
      }}
    >
      {block.type === "move" && (
        <div>
          Move
          {isEditing && !isDemoMode ? (
            <input
              type="number"
              value={getSteps()}
              onChange={(e) => handleInputChange(e, "steps")}
              className="w-16 mx-1 text-black px-1 rounded"
              onClick={(e) => e.stopPropagation()}
              placeholder="steps"
              autoFocus
              onBlur={() => setIsEditing(false)}
            />
          ) : (
            <span className="font-bold mx-1 bg-blue-600 px-2 rounded">{block.steps === null ? "__" : block.steps}</span>
          )}
          steps
        </div>
      )}

      {block.type === "turn" && (
        <div>
          Turn
          {isEditing && !isDemoMode ? (
            <input
              type="number"
              value={getDegrees()}
              onChange={(e) => handleInputChange(e, "degrees")}
              className="w-16 mx-1 text-black px-1 rounded"
              onClick={(e) => e.stopPropagation()}
              placeholder="degrees"
              autoFocus
              onBlur={() => setIsEditing(false)}
            />
          ) : (
            <span className="font-bold mx-1 bg-blue-600 px-2 rounded">
              {block.degrees === null ? "__" : block.degrees}
            </span>
          )}
          degrees
        </div>
      )}

      {block.type === "goto" && (
        <div>
          Go to x:
          {isEditing && !isDemoMode ? (
            <input
              type="number"
              value={getX()}
              onChange={(e) => handleInputChange(e, "x")}
              className="w-16 mx-1 text-black px-1 rounded"
              onClick={(e) => e.stopPropagation()}
              placeholder="x"
              autoFocus
              onBlur={() => setIsEditing(false)}
            />
          ) : (
            <span className="font-bold mx-1 bg-blue-600 px-2 rounded">{block.x === null ? "__" : block.x}</span>
          )}
          y:
          {isEditing && !isDemoMode ? (
            <input
              type="number"
              value={getY()}
              onChange={(e) => handleInputChange(e, "y")}
              className="w-16 mx-1 text-black px-1 rounded"
              onClick={(e) => e.stopPropagation()}
              placeholder="y"
              onBlur={() => setIsEditing(false)}
            />
          ) : (
            <span className="font-bold mx-1 bg-blue-600 px-2 rounded">{block.y === null ? "__" : block.y}</span>
          )}
        </div>
      )}

      {block.type === "say" && (
        <div>
          Say
          {isEditing && !isDemoMode ? (
            <input
              type="text"
              value={getText()}
              onChange={(e) => handleInputChange(e, "text")}
              className="w-24 mx-1 text-black px-1 rounded"
              onClick={(e) => e.stopPropagation()}
              placeholder="text"
              autoFocus
            />
          ) : (
            <span className="font-bold mx-1 bg-purple-600 px-2 rounded">{block.text === "" ? "__" : block.text}</span>
          )}
          for
          {isEditing && !isDemoMode ? (
            <input
              type="number"
              value={getDuration()}
              onChange={(e) => handleInputChange(e, "duration")}
              className="w-16 mx-1 text-black px-1 rounded"
              onClick={(e) => e.stopPropagation()}
              placeholder="seconds"
              onBlur={() => setIsEditing(false)}
            />
          ) : (
            <span className="font-bold mx-1 bg-purple-600 px-2 rounded">
              {block.duration === null ? "__" : block.duration}
            </span>
          )}
          seconds
        </div>
      )}

      {block.type === "think" && (
        <div>
          Think
          {isEditing && !isDemoMode ? (
            <input
              type="text"
              value={getText()}
              onChange={(e) => handleInputChange(e, "text")}
              className="w-24 mx-1 text-black px-1 rounded"
              onClick={(e) => e.stopPropagation()}
              placeholder="text"
              autoFocus
            />
          ) : (
            <span className="font-bold mx-1 bg-purple-600 px-2 rounded">{block.text === "" ? "__" : block.text}</span>
          )}
          for
          {isEditing && !isDemoMode ? (
            <input
              type="number"
              value={getDuration()}
              onChange={(e) => handleInputChange(e, "duration")}
              className="w-16 mx-1 text-black px-1 rounded"
              onClick={(e) => e.stopPropagation()}
              placeholder="seconds"
              onBlur={() => setIsEditing(false)}
            />
          ) : (
            <span className="font-bold mx-1 bg-purple-600 px-2 rounded">
              {block.duration === null ? "__" : block.duration}
            </span>
          )}
          seconds
        </div>
      )}

      {block.type === "repeat" && (
        <div>
          Repeat
          {isEditing && !isDemoMode ? (
            <input
              type="number"
              value={getCount()}
              onChange={(e) => handleInputChange(e, "count")}
              className="w-16 mx-1 text-black px-1 rounded"
              onClick={(e) => e.stopPropagation()}
              placeholder="times"
              autoFocus
              onBlur={() => setIsEditing(false)}
            />
          ) : (
            <span className="font-bold mx-1 bg-yellow-600 px-2 rounded">
              {block.count === null ? "__" : block.count}
            </span>
          )}
          times
          {/* Display a note about nested blocks */}
          <div className="text-xs mt-1 bg-yellow-600 p-1 rounded">Will repeat all blocks in this sprite</div>
        </div>
      )}

      {!isDemoMode && (
        <button
          className="absolute top-1 right-1 text-xs bg-red-700 hover:bg-red-800 px-1 rounded"
          onClick={(e) => {
            e.stopPropagation()
            handleDelete()
          }}
        >
          ✕
        </button>
      )}
    </div>
  )
}

export default EditableBlock
