import type { Sprite } from "../types"

// Enhanced collision detection with improved accuracy and debugging
export const checkCollisions = (sprites: Sprite[]): [string, string][] => {
  const collisions: [string, string][] = []
  const collidedSprites = new Set<string>() // Track sprites that have already collided

  // Debug info
  console.log(`Checking collisions among ${sprites.length} sprites`)

  // Check each pair of sprites for collision
  for (let i = 0; i < sprites.length; i++) {
    for (let j = i + 1; j < sprites.length; j++) {
      const spriteA = sprites[i]
      const spriteB = sprites[j]

      // Skip if either sprite has already been in a collision this frame
      if (collidedSprites.has(spriteA.id) || collidedSprites.has(spriteB.id)) {
        continue
      }

      // Skip if either sprite is on cooldown
      if (spriteA.collisionCooldown > 0 || spriteB.collisionCooldown > 0) {
        continue
      }

      // Calculate distance between sprites
      const dx = spriteA.x - spriteB.x
      const dy = spriteA.y - spriteB.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      // Debug distance
      console.log(`Distance between ${spriteA.name} and ${spriteB.name}: ${distance.toFixed(2)}px`)

      // If distance is less than 60px, consider it a collision
      if (distance < 60) {
        console.log(`COLLISION DETECTED between ${spriteA.name} and ${spriteB.name}!`)
        collisions.push([spriteA.id, spriteB.id])

        // Mark these sprites as having collided
        collidedSprites.add(spriteA.id)
        collidedSprites.add(spriteB.id)
      }
    }
  }

  return collisions
}
