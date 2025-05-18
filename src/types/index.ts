export interface Position {
  x: number
  y: number
}

export interface Block {
  id: string
  type: "move" | "turn" | "goto" | "say" | "think" | "repeat"
  category: "motion" | "looks" | "control"
  steps?: number | null
  degrees?: number | null
  x?: number | null
  y?: number | null
  text?: string
  duration?: number | null
  count?: number | null
  blocks?: Block[]
}

export interface Sprite {
  id: string
  name: string
  x: number
  y: number
  direction: number
  blocks: Block[]
  costume: string
  saying: string
  thinking: string
  sayingTimer: NodeJS.Timeout | null
  thinkingTimer: NodeJS.Timeout | null
  collided?: boolean
  collisionCooldown: number
}
