import type { Sprite } from "../types"

// Utility function to separate sprites after a collision
export const separateSprites = (spriteA: Sprite, spriteB: Sprite): [Sprite, Sprite] => {
  // Calculate vector from A to B
  const dx = spriteB.x - spriteA.x
  const dy = spriteB.y - spriteA.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  console.log(`Separating sprites. Current distance: ${distance.toFixed(2)}px`)

  // If sprites are exactly on top of each other, move them in random directions
  if (distance < 0.1) {
    console.log("Sprites are exactly overlapping, moving in opposite directions")
    return [
      { ...spriteA, x: spriteA.x - 30, y: spriteA.y - 30 },
      { ...spriteB, x: spriteB.x + 30, y: spriteB.y + 30 },
    ]
  }

  // Calculate normalized direction vector
  const nx = dx / distance
  const ny = dy / distance

  // Minimum separation distance
  const minSeparation = 60
  const separationNeeded = minSeparation - distance

  if (separationNeeded > 0) {
    console.log(`Separation needed: ${separationNeeded.toFixed(2)}px`)

    // Move sprites apart along the direction vector
    const moveX = (nx * separationNeeded) / 2
    const moveY = (ny * separationNeeded) / 2

    console.log(`Moving sprites by x: ${moveX.toFixed(2)}, y: ${moveY.toFixed(2)}`)

    return [
      { ...spriteA, x: spriteA.x - moveX, y: spriteA.y - moveY },
      { ...spriteB, x: spriteB.x + moveX, y: spriteB.y + moveY },
    ]
  }

  return [spriteA, spriteB]
}
