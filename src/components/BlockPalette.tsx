import type React from "react"
import { useDrag } from "react-dnd"
import { v4 as uuidv4 } from "uuid"
import type { Block } from "../types"

interface BlockPaletteProps {
  addBlock: (block: Block) => void
}

interface BlockTemplateProps {
  block: Block
  addBlock: (block: Block) => void
}

const BlockTemplate: React.FC<BlockTemplateProps> = ({ block, addBlock }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "BLOCK",
    item: { ...block, id: uuidv4() },
    end: (_item, _monitor) => {
      // We'll let the drop target handle the block addition
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
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

  return (
    <div
      ref={drag}
      className={`${getBlockColor(block.category)} text-white p-2 rounded-md mb-2 cursor-move ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      {block.type === "move" && (
        <div>
          Move <span className="font-bold bg-blue-600 px-1 rounded">__</span> steps
        </div>
      )}
      {block.type === "turn" && (
        <div>
          Turn <span className="font-bold bg-blue-600 px-1 rounded">__</span> degrees
        </div>
      )}
      {block.type === "goto" && (
        <div>
          Go to x: <span className="font-bold bg-blue-600 px-1 rounded">__</span> y:{" "}
          <span className="font-bold bg-blue-600 px-1 rounded">__</span>
        </div>
      )}
      {block.type === "say" && (
        <div>
          Say <span className="font-bold bg-purple-600 px-1 rounded">__</span> for{" "}
          <span className="font-bold bg-purple-600 px-1 rounded">__</span> seconds
        </div>
      )}
      {block.type === "think" && (
        <div>
          Think <span className="font-bold bg-purple-600 px-1 rounded">__</span> for{" "}
          <span className="font-bold bg-purple-600 px-1 rounded">__</span> seconds
        </div>
      )}
      {block.type === "repeat" && (
        <div>
          Repeat <span className="font-bold bg-yellow-600 px-1 rounded">__</span> times
          <div className="text-xs mt-1 bg-yellow-600 p-1 rounded">Will repeat all blocks in this sprite</div>
        </div>
      )}
    </div>
  )
}

const BlockPalette: React.FC<BlockPaletteProps> = ({ addBlock }) => {
  const motionBlocks: Block[] = [
    { id: "", type: "move", category: "motion", steps: null },
    { id: "", type: "turn", category: "motion", degrees: null },
    { id: "", type: "goto", category: "motion", x: null, y: null },
  ]

  const looksBlocks: Block[] = [
    { id: "", type: "say", category: "looks", text: "", duration: null },
    { id: "", type: "think", category: "looks", text: "", duration: null },
  ]

  const controlBlocks: Block[] = [{ id: "", type: "repeat", category: "control", count: null, blocks: [] }]

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">Motion</h2>
      {motionBlocks.map((block, index) => (
        <BlockTemplate key={`motion-${index}`} block={block} addBlock={addBlock} />
      ))}

      <h2 className="text-lg font-bold mb-2 mt-4">Looks</h2>
      {looksBlocks.map((block, index) => (
        <BlockTemplate key={`looks-${index}`} block={block} addBlock={addBlock} />
      ))}

      <h2 className="text-lg font-bold mb-2 mt-4">Control</h2>
      {controlBlocks.map((block, index) => (
        <BlockTemplate key={`control-${index}`} block={block} addBlock={addBlock} />
      ))}
    </div>
  )
}

export default BlockPalette
