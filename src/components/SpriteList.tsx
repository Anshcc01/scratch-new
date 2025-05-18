"use client"

import type React from "react"
import { useDrop } from "react-dnd"
import type { Sprite, Block } from "../types"
import EditableBlock from "./EditableBlock"
import { Trash2, Play, ZapIcon, Lightbulb } from "lucide-react"

interface SpriteListProps {
  sprites: Sprite[]
  selectedSpriteId: string
  setSelectedSpriteId: (id: string) => void
  updateBlock: (spriteId: string, blockId: string, updates: Partial<Block>) => void
  removeBlock: (spriteId: string, blockId: string) => void
  moveBlockToSprite: (blockId: string, fromSpriteId: string, toSpriteId: string) => void
  addBlockToSprite: (block: Block, spriteId: string) => void
  deleteSprite: (spriteId: string) => void
  isDemoMode?: boolean
}

const SpriteList: React.FC<SpriteListProps> = ({
  sprites,
  selectedSpriteId,
  setSelectedSpriteId,
  updateBlock,
  removeBlock,
  moveBlockToSprite,
  addBlockToSprite,
  deleteSprite,
  isDemoMode = false,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Sprites and Blocks</h2>
        <div className="text-sm text-green-600 font-medium">
          <Play className="inline-block mr-1" size={16} />
          All sprites run when Play is clicked
        </div>
      </div>

      {isDemoMode ? (
        <div className="bg-purple-100 border-l-4 border-purple-500 p-3 mb-4 rounded">
          <div className="flex items-center">
            <Lightbulb className="text-purple-500 mr-2" size={20} />
            <span className="font-semibold">Demo Mode Active</span>
          </div>
          <p className="text-sm mt-1">
            You're watching a demonstration of the collision feature. When sprites collide, they swap their blocks and
            continue moving with their new behaviors!
          </p>
        </div>
      ) : (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-3 mb-4 rounded">
          <div className="flex items-center">
            <ZapIcon className="text-yellow-500 mr-2" size={20} />
            <span className="font-semibold">Hero Feature:</span>
          </div>
          <p className="text-sm mt-1">
            When sprites collide, they swap their blocks and immediately start moving with their new blocks! Try
            creating two sprites with different movements and watch what happens when they meet.
          </p>
          <p className="text-sm mt-2 italic">Click the "Hero Feature Demo" button to see this in action!</p>
        </div>
      )}

      <div className="flex flex-wrap gap-4">
        {sprites.map((sprite) => (
          <SpriteBlocks
            key={sprite.id}
            sprite={sprite}
            isSelected={sprite.id === selectedSpriteId}
            setSelectedSpriteId={setSelectedSpriteId}
            updateBlock={(blockId, updates) => updateBlock(sprite.id, blockId, updates)}
            removeBlock={(blockId) => removeBlock(sprite.id, blockId)}
            moveBlockToSprite={moveBlockToSprite}
            addBlockToSprite={addBlockToSprite}
            deleteSprite={deleteSprite}
            canDelete={sprites.length > 1} // Only allow deletion if there's more than one sprite
            sprites={sprites}
            isDemoMode={isDemoMode}
          />
        ))}
      </div>
    </div>
  )
}

interface SpriteBlocksProps {
  sprite: Sprite
  isSelected: boolean
  setSelectedSpriteId: (id: string) => void
  updateBlock: (blockId: string, updates: Partial<Block>) => void
  removeBlock: (blockId: string) => void
  moveBlockToSprite: (blockId: string, fromSpriteId: string, toSpriteId: string) => void
  addBlockToSprite: (block: Block, spriteId: string) => void
  deleteSprite: (spriteId: string) => void
  canDelete: boolean
  sprites: Sprite[]
  isDemoMode?: boolean
}

const SpriteBlocks: React.FC<SpriteBlocksProps> = ({
  sprite,
  isSelected,
  setSelectedSpriteId,
  updateBlock,
  removeBlock,
  moveBlockToSprite,
  addBlockToSprite,
  deleteSprite,
  canDelete,
  sprites,
  isDemoMode = false,
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ["BLOCK", "SPRITE_BLOCK"],
    drop: (item: any, monitor) => {
      // Check if this is the target (not just a parent)
      if (!monitor.isOver({ shallow: true })) return

      if (item.type === "SPRITE_BLOCK") {
        if (item.spriteId !== sprite.id) {
          moveBlockToSprite(item.id, item.spriteId, sprite.id)
        }
      } else {
        // This is a new block from the palette
        addBlockToSprite(item, sprite.id)
      }
      return { name: `SpriteBlocks-${sprite.id}`, spriteId: sprite.id }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  }))

  const handleDeleteSprite = (e: React.MouseEvent) => {
    e.stopPropagation()
    deleteSprite(sprite.id)
  }

  return (
    <div
      className={`w-64 border-2 rounded-md p-2 ${
        isSelected ? "border-blue-500" : "border-gray-300"
      } ${isOver ? "bg-blue-100" : ""} ${sprite.collided ? "bg-yellow-100" : ""} ${
        isDemoMode ? "opacity-90 cursor-not-allowed" : ""
      }`}
      onClick={() => !isDemoMode && setSelectedSpriteId(sprite.id)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className="text-2xl mr-2">{sprite.costume}</div>
          <h3 className="text-md font-semibold">{sprite.name}</h3>
        </div>
        {canDelete && !isDemoMode && (
          <button
            className="p-1 text-red-500 hover:bg-red-100 rounded-full transition-colors"
            onClick={handleDeleteSprite}
            title="Delete sprite"
            aria-label="Delete sprite"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div
        ref={!isDemoMode ? drop : undefined}
        className={`min-h-[100px] p-2 border border-gray-200 rounded-md ${isOver ? "bg-blue-100" : "bg-gray-50"} ${
          isDemoMode ? "bg-gray-100" : ""
        }`}
        data-sprite-id={sprite.id}
      >
        {sprite.blocks.length === 0 ? (
          <p className="text-gray-500 italic text-sm">
            {isDemoMode ? "Demo blocks will appear here" : "Drag blocks here"}
          </p>
        ) : (
          <div>
            {sprite.blocks.map((block) => (
              <EditableBlock
                key={block.id}
                block={block}
                updateBlock={updateBlock}
                removeBlock={removeBlock}
                spriteId={sprite.id}
                isDemoMode={isDemoMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SpriteList
