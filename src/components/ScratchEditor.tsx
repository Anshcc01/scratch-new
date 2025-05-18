"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import BlockPalette from "./BlockPalette"
import SpriteCanvas from "./SpriteCanvas"
import SpriteList from "./SpriteList"
import DemoOverlay from "./DemoOverlay"
import type { Sprite, Block } from "../types"
import { checkCollisions } from "../utils/collisionDetection"
import { v4 as uuidv4 } from "uuid"
import { Lightbulb, XCircle } from "lucide-react"

const ScratchEditor: React.FC = () => {
  const [sprites, setSprites] = useState<Sprite[]>([
    {
      id: "sprite1",
      name: "Sprite 1",
      x: 200,
      y: 200,
      direction: 90,
      blocks: [],
      costume: "🐱",
      saying: "",
      thinking: "",
      sayingTimer: null,
      thinkingTimer: null,
      collided: false,
      collisionCooldown: 0,
    },
  ])

  const [selectedSpriteId, setSelectedSpriteId] = useState<string>("sprite1")
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false)
  const [demoStep, setDemoStep] = useState<number>(0)
  const [demoCollisionOccurred, setDemoCollisionOccurred] = useState<boolean>(false)
  const animationFrameRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)
  const [collisionOccurred, setCollisionOccurred] = useState<boolean>(false)
  const collisionTimerRef = useRef<NodeJS.Timeout | null>(null)
  const demoTimerRef = useRef<NodeJS.Timeout | null>(null)
  const collidedSpritesRef = useRef<Set<string>>(new Set())

  // Track demo animation progress
  const demoIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [demoTick, setDemoTick] = useState<number>(0)

  // Add this near the top of the ScratchEditor component, after the state declarations
  const [debugMode, setDebugMode] = useState<boolean>(false)

  const selectedSprite = sprites.find((sprite) => sprite.id === selectedSpriteId)

  const addBlock = (block: Block) => {
    if (!selectedSprite || isDemoMode) return

    setSprites((prevSprites) =>
      prevSprites.map((sprite) =>
        sprite.id === selectedSpriteId ? { ...sprite, blocks: [...sprite.blocks, block] } : sprite,
      ),
    )
  }

  const addBlockToSprite = (block: Block, spriteId: string) => {
    if (isDemoMode) return

    setSprites((prevSprites) =>
      prevSprites.map((sprite) => (sprite.id === spriteId ? { ...sprite, blocks: [...sprite.blocks, block] } : sprite)),
    )
  }

  const updateBlock = (spriteId: string, blockId: string, updates: Partial<Block>) => {
    if (isDemoMode) return

    setSprites((prevSprites) =>
      prevSprites.map((sprite) =>
        sprite.id === spriteId
          ? {
              ...sprite,
              blocks: sprite.blocks.map((block) => (block.id === blockId ? { ...block, ...updates } : block)),
            }
          : sprite,
      ),
    )
  }

  const removeBlock = (spriteId: string, blockId: string) => {
    if (isDemoMode) return

    // Find the block to be removed
    const spriteToUpdate = sprites.find((s) => s.id === spriteId)
    if (!spriteToUpdate) return

    const blockToRemove = spriteToUpdate.blocks.find((b) => b.id === blockId)
    if (!blockToRemove) return

    // Clear any ongoing effects from this block
    if (blockToRemove.type === "say" && spriteToUpdate.sayingTimer) {
      clearTimeout(spriteToUpdate.sayingTimer)
    }

    if (blockToRemove.type === "think" && spriteToUpdate.thinkingTimer) {
      clearTimeout(spriteToUpdate.thinkingTimer)
    }

    // Update the sprite
    setSprites((prevSprites) =>
      prevSprites.map((sprite) => {
        if (sprite.id === spriteId) {
          const updatedSprite = {
            ...sprite,
            blocks: sprite.blocks.filter((block) => block.id !== blockId),
          }

          // Clear any ongoing effects
          if (blockToRemove.type === "say") {
            updatedSprite.saying = ""
            updatedSprite.sayingTimer = null
          }

          if (blockToRemove.type === "think") {
            updatedSprite.thinking = ""
            updatedSprite.thinkingTimer = null
          }

          return updatedSprite
        }
        return sprite
      }),
    )
  }

  const moveBlockToSprite = (blockId: string, fromSpriteId: string, toSpriteId: string) => {
    if (isDemoMode) return

    setSprites((prevSprites) => {
      // Find the source sprite and block
      const sourceSprite = prevSprites.find((s) => s.id === fromSpriteId)
      if (!sourceSprite) return prevSprites

      const blockToMove = sourceSprite.blocks.find((b) => b.id === blockId)
      if (!blockToMove) return prevSprites

      // Create a new block with a new ID to avoid conflicts
      const newBlock = { ...blockToMove, id: uuidv4() }

      // Return updated sprites array
      return prevSprites.map((sprite) => {
        if (sprite.id === fromSpriteId) {
          return {
            ...sprite,
            blocks: sprite.blocks.filter((b) => b.id !== blockId),
          }
        } else if (sprite.id === toSpriteId) {
          return {
            ...sprite,
            blocks: [...sprite.blocks, newBlock],
          }
        }
        return sprite
      })
    })
  }

  const updateSpritePosition = (spriteId: string, x: number, y: number) => {
    if (isDemoMode) return

    setSprites((prevSprites) => prevSprites.map((sprite) => (sprite.id === spriteId ? { ...sprite, x, y } : sprite)))
  }

  const addSprite = () => {
    if (isDemoMode) return

    const newSpriteId = `sprite${sprites.length + 1}`
    const newSprite: Sprite = {
      id: newSpriteId,
      name: `Sprite ${sprites.length + 1}`,
      x: Math.random() * 300 + 100,
      y: Math.random() * 300 + 100,
      direction: 90,
      blocks: [],
      costume: ["🐱", "🐶", "🐰", "🦊", "🐻"][Math.floor(Math.random() * 5)],
      saying: "",
      thinking: "",
      sayingTimer: null,
      thinkingTimer: null,
      collided: false,
      collisionCooldown: 0,
    }

    setSprites((prevSprites) => [...prevSprites, newSprite])
    setSelectedSpriteId(newSpriteId)
  }

  const deleteSprite = (spriteId: string) => {
    if (isDemoMode) return

    // Don't allow deleting the last sprite
    if (sprites.length <= 1) return

    // Clean up any timers
    const spriteToDelete = sprites.find((s) => s.id === spriteId)
    if (spriteToDelete) {
      if (spriteToDelete.sayingTimer) clearTimeout(spriteToDelete.sayingTimer)
      if (spriteToDelete.thinkingTimer) clearTimeout(spriteToDelete.thinkingTimer)
    }

    // Remove the sprite
    setSprites((prevSprites) => prevSprites.filter((sprite) => sprite.id !== spriteId))

    // If we're deleting the selected sprite, select another one
    if (spriteId === selectedSpriteId) {
      const remainingSprites = sprites.filter((s) => s.id !== spriteId)
      if (remainingSprites.length > 0) {
        setSelectedSpriteId(remainingSprites[0].id)
      }
    }
  }

  // Improved executeBlock function with better movement handling
  const executeBlock = (sprite: Sprite, block: Block): Sprite => {
    let updatedSprite = { ...sprite }

    switch (block.type) {
      case "move":
        if (block.steps !== null) {
          // Calculate movement based on direction and steps
          const radians = (updatedSprite.direction - 90) * (Math.PI / 180)

          // Apply movement
          updatedSprite.x += Math.cos(radians) * block.steps
          updatedSprite.y += Math.sin(radians) * block.steps
        }
        break

      case "turn":
        if (block.degrees !== null) {
          // Apply the rotation with a smooth transition
          updatedSprite.direction = (updatedSprite.direction + block.degrees) % 360
          // If negative, convert to positive equivalent
          if (updatedSprite.direction < 0) {
            updatedSprite.direction += 360
          }
        }
        break

      case "goto":
        if (block.x !== null) updatedSprite.x = block.x
        if (block.y !== null) updatedSprite.y = block.y
        break

      case "say":
        if (block.text !== undefined && block.duration !== null) {
          updatedSprite.saying = block.text
          // Clear any existing timer
          if (updatedSprite.sayingTimer) {
            clearTimeout(updatedSprite.sayingTimer)
          }

          // Set a new timer if duration is provided
          const timerId = setTimeout(() => {
            setSprites((prevSprites) =>
              prevSprites.map((s) => (s.id === sprite.id ? { ...s, saying: "", sayingTimer: null } : s)),
            )
          }, block.duration * 1000)

          updatedSprite.sayingTimer = timerId
        }
        break

      case "think":
        if (block.text !== undefined && block.duration !== null) {
          updatedSprite.thinking = block.text
          // Clear any existing timer
          if (updatedSprite.thinkingTimer) {
            clearTimeout(updatedSprite.thinkingTimer)
          }

          // Set a new timer if duration is provided
          const timerId = setTimeout(() => {
            setSprites((prevSprites) =>
              prevSprites.map((s) => (s.id === sprite.id ? { ...s, thinking: "", thinkingTimer: null } : s)),
            )
          }, block.duration * 1000)

          updatedSprite.thinkingTimer = timerId
        }
        break

      case "repeat":
        if (block.blocks && block.count !== null) {
          // Execute the nested blocks 'count' times
          for (let i = 0; i < block.count; i++) {
            for (const nestedBlock of sprite.blocks) {
              if (nestedBlock.type !== "repeat") {
                // Avoid nested repeats for now
                updatedSprite = executeBlock(updatedSprite, nestedBlock)
              }
            }
          }
        }
        break
    }

    return updatedSprite
  }

  // Function to separate sprites after collision
  const separateSpritesAfterCollision = (spriteA: Sprite, spriteB: Sprite): [Sprite, Sprite] => {
    // Calculate vector from A to B
    const dx = spriteB.x - spriteA.x
    const dy = spriteB.y - spriteA.y

    // Calculate distance
    const distance = Math.sqrt(dx * dx + dy * dy)

    // If sprites are exactly on top of each other, move them in random directions
    if (distance < 0.1) {
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
      // Move sprites apart along the direction vector
      const moveX = (nx * separationNeeded) / 2
      const moveY = (ny * separationNeeded) / 2

      return [
        { ...spriteA, x: spriteA.x - moveX, y: spriteA.y - moveY },
        { ...spriteB, x: spriteB.x + moveX, y: spriteB.y + moveY },
      ]
    }

    return [spriteA, spriteB]
  }

  const executeBlocks = (timestamp: number) => {
    if (!isPlaying || isDemoMode) return // Skip normal execution in demo mode

    const deltaTime = timestamp - lastTimeRef.current
    lastTimeRef.current = timestamp

    // Add debug logging in production
    console.log(`Animation frame executing, deltaTime: ${deltaTime}ms`)

    // Reset the collided sprites set at the beginning of each frame
    collidedSpritesRef.current = new Set()

    // Execute blocks for each sprite
    let updatedSprites = [...sprites]

    // First, update collision cooldowns
    updatedSprites = updatedSprites.map((sprite) => ({
      ...sprite,
      collisionCooldown: Math.max(0, sprite.collisionCooldown - deltaTime),
    }))

    // Check for collisions between sprites that aren't on cooldown
    const eligibleSprites = updatedSprites.filter((s) => s.collisionCooldown <= 0)
    const collisions = checkCollisions(eligibleSprites)

    // Add debug logging for collision detection
    if (eligibleSprites.length > 1) {
      console.log(`Checking collisions among ${eligibleSprites.length} sprites`)
      console.log(`Detected ${collisions.length} collisions`)
    }

    if (collisions.length > 0) {
      console.log("Collision detected! Processing collision...")

      // Set collision flag for visual feedback
      setCollisionOccurred(true)

      // Clear any existing collision timer
      if (collisionTimerRef.current) {
        clearTimeout(collisionTimerRef.current)
      }

      // Reset collision flag after a short delay
      collisionTimerRef.current = setTimeout(() => {
        setCollisionOccurred(false)
      }, 500)

      // Process each collision and swap blocks
      for (const [spriteAId, spriteBId] of collisions) {
        console.log(`Processing collision between sprites ${spriteAId} and ${spriteBId}`)

        // Find the sprites involved in the collision
        const spriteAIndex = updatedSprites.findIndex((s) => s.id === spriteAId)
        const spriteBIndex = updatedSprites.findIndex((s) => s.id === spriteBId)

        if (spriteAIndex !== -1 && spriteBIndex !== -1) {
          console.log("Found both sprites, processing collision effects")

          // Mark sprites as collided for visual feedback
          updatedSprites[spriteAIndex].collided = true
          updatedSprites[spriteBIndex].collided = true

          // Set collision cooldown to prevent immediate re-collision
          updatedSprites[spriteAIndex].collisionCooldown = 2000 // 2 seconds cooldown
          updatedSprites[spriteBIndex].collisionCooldown = 2000

          // Separate the sprites to prevent them from getting stuck
          const [separatedA, separatedB] = separateSpritesAfterCollision(
            updatedSprites[spriteAIndex],
            updatedSprites[spriteBIndex],
          )

          updatedSprites[spriteAIndex] = separatedA
          updatedSprites[spriteBIndex] = separatedB

          // Add to collided sprites set to track them
          collidedSpritesRef.current.add(spriteAId)
          collidedSpritesRef.current.add(spriteBId)

          // Swap blocks between sprites (create deep copies to avoid reference issues)
          const tempBlocks = JSON.parse(JSON.stringify(updatedSprites[spriteAIndex].blocks))
          updatedSprites[spriteAIndex].blocks = JSON.parse(JSON.stringify(updatedSprites[spriteBIndex].blocks))
          updatedSprites[spriteBIndex].blocks = tempBlocks

          console.log("Blocks swapped successfully")

          // Announce the collision with speech bubbles
          updatedSprites[spriteAIndex].saying = "Swapped blocks!"
          updatedSprites[spriteBIndex].saying = "Swapped blocks!"

          // Clear the speech bubbles after a short delay
          if (updatedSprites[spriteAIndex].sayingTimer) {
            clearTimeout(updatedSprites[spriteAIndex].sayingTimer)
          }
          if (updatedSprites[spriteBIndex].sayingTimer) {
            clearTimeout(updatedSprites[spriteBIndex].sayingTimer)
          }

          const spriteATimerId = setTimeout(() => {
            setSprites((prevSprites) =>
              prevSprites.map((s) => (s.id === spriteAId ? { ...s, saying: "", sayingTimer: null } : s)),
            )
          }, 1500)

          const spriteBTimerId = setTimeout(() => {
            setSprites((prevSprites) =>
              prevSprites.map((s) => (s.id === spriteBId ? { ...s, saying: "", sayingTimer: null } : s)),
            )
          }, 1500)

          updatedSprites[spriteAIndex].sayingTimer = spriteATimerId as unknown as NodeJS.Timeout
          updatedSprites[spriteBIndex].sayingTimer = spriteBTimerId as unknown as NodeJS.Timeout

          // Reset the collided flag after a short delay
          setTimeout(() => {
            setSprites((prevSprites) =>
              prevSprites.map((s) => (s.id === spriteAId || s.id === spriteBId ? { ...s, collided: false } : s)),
            )
          }, 500)
        } else {
          console.warn(`Could not find one or both sprites: ${spriteAId}, ${spriteBId}`)
        }
      }
    }

    // Now execute blocks for ALL sprites with their potentially new blocks
    updatedSprites = updatedSprites.map((sprite) => {
      let updatedSprite = { ...sprite }

      // Only execute if the sprite has blocks
      if (sprite.blocks && sprite.blocks.length > 0) {
        // Handle repeat blocks separately
        const repeatBlock = sprite.blocks.find((b) => b.type === "repeat")
        if (repeatBlock && repeatBlock.count !== null) {
          // Execute non-repeat blocks first
          for (const block of sprite.blocks) {
            if (block.type !== "repeat") {
              updatedSprite = executeBlock(updatedSprite, block)
            }
          }

          // Then execute the repeat block (which will execute all blocks multiple times)
          updatedSprite = executeBlock(updatedSprite, repeatBlock)
        } else {
          // No repeat block, just execute all blocks normally
          for (const block of sprite.blocks) {
            updatedSprite = executeBlock(updatedSprite, block)
          }
        }
      }

      return updatedSprite
    })

    // Keep sprites within canvas bounds
    updatedSprites = updatedSprites.map((sprite) => ({
      ...sprite,
      x: Math.max(0, Math.min(sprite.x, 800)), // Assuming canvas width is 800
      y: Math.max(0, Math.min(sprite.y, 600)), // Assuming canvas height is 600
    }))

    setSprites(updatedSprites)

    // Continue the animation loop
    animationFrameRef.current = requestAnimationFrame(executeBlocks)
  }

  // SUPER SIMPLE DEMO ANIMATION - Using a simple interval
  const startSimpleDemoAnimation = () => {
    console.log("Starting simple demo animation")

    // Set up demo sprites
    setSprites([
      {
        id: "demoSprite1",
        name: "Sprite 1",
        x: 150,
        y: 200,
        direction: 90,
        blocks: [{ id: uuidv4(), type: "move", category: "motion", steps: 50 }],
        costume: "🐱",
        saying: "I move right!",
        thinking: "",
        sayingTimer: null,
        thinkingTimer: null,
        collided: false,
        collisionCooldown: 0,
      },
      {
        id: "demoSprite2",
        name: "Sprite 2",
        x: 450,
        y: 200,
        direction: 90,
        blocks: [{ id: uuidv4(), type: "move", category: "motion", steps: -50 }],
        costume: "🐶",
        saying: "I move left!",
        thinking: "",
        sayingTimer: null,
        thinkingTimer: null,
        collided: false,
        collisionCooldown: 0,
      },
    ])

    // Set demo step to 0 (intro)
    setDemoStep(0)
    setDemoTick(0)

    // Clear initial speech bubbles after a delay
    setTimeout(() => {
      if (isDemoMode) {
        setSprites((prev) => prev.map((s) => ({ ...s, saying: "" })))
        console.log("Speech bubbles cleared, animation starting...")

        // Start animation after speech bubbles are cleared
        setTimeout(() => {
          setDemoStep(1) // Move to step 1: sprites moving

          // Start a simple interval that updates sprite positions every 100ms
          if (demoIntervalRef.current) {
            clearInterval(demoIntervalRef.current)
          }

          const interval = setInterval(() => {
            if (!isDemoMode) {
              clearInterval(interval)
              return
            }

            setDemoTick((prev) => prev + 1)

            // Update sprite positions
            setSprites((prevSprites) => {
              // Make a copy of the sprites
              const newSprites = [...prevSprites]

              // Check if we have exactly 2 sprites
              if (newSprites.length !== 2) return prevSprites

              // Check if collision has occurred
              const dx = newSprites[0].x - newSprites[1].x
              const dy = newSprites[0].y - newSprites[1].y
              const distance = Math.sqrt(dx * dx + dy * dy)

              // If collision hasn't occurred yet
              if (distance > 60 && !demoCollisionOccurred) {
                // Move sprite 1 right
                newSprites[0] = { ...newSprites[0], x: newSprites[0].x + 10 }

                // Move sprite 2 left
                newSprites[1] = { ...newSprites[1], x: newSprites[1].x - 10 }

                console.log(`Demo tick ${demoTick}: sprite1.x = ${newSprites[0].x}, sprite2.x = ${newSprites[1].x}`)
                return newSprites
              }
              // If collision just occurred
              else if (distance <= 60 && !demoCollisionOccurred) {
                console.log("Demo collision detected!")

                // Process collision
                setDemoCollisionOccurred(true)
                setCollisionOccurred(true)
                setDemoStep(2)

                // Mark sprites as collided
                newSprites[0] = { ...newSprites[0], collided: true, saying: "Swapped blocks!" }
                newSprites[1] = { ...newSprites[1], collided: true, saying: "Swapped blocks!" }

                // Separate sprites
                newSprites[0] = { ...newSprites[0], x: newSprites[0].x - 40 }
                newSprites[1] = { ...newSprites[1], x: newSprites[1].x + 40 }

                // Clear collision visual after a delay
                setTimeout(() => {
                  setCollisionOccurred(false)
                  setSprites((prev) => prev.map((s) => ({ ...s, collided: false })))
                }, 500)

                // Clear speech bubbles after a delay
                setTimeout(() => {
                  setSprites((prev) => prev.map((s) => ({ ...s, saying: "" })))
                }, 1500)

                return newSprites
              }
              // After collision, move in opposite directions
              else if (demoCollisionOccurred) {
                // Move sprite 1 left (reversed direction)
                newSprites[0] = { ...newSprites[0], x: newSprites[0].x - 10 }

                // Move sprite 2 right (reversed direction)
                newSprites[1] = { ...newSprites[1], x: newSprites[1].x + 10 }

                return newSprites
              }

              return prevSprites
            })
          }, 100) // Update every 100ms

          demoIntervalRef.current = interval
        }, 500)
      }
    }, 2000)
  }

  const togglePlay = () => {
    if (isDemoMode) return // Prevent manual play/stop during demo

    // If stopping, clear all speech/thought bubbles
    if (isPlaying) {
      setSprites((prevSprites) =>
        prevSprites.map((sprite) => ({
          ...sprite,
          saying: "",
          thinking: "",
          collided: false,
          collisionCooldown: 0,
          sayingTimer: sprite.sayingTimer ? (clearTimeout(sprite.sayingTimer), null) : null,
          thinkingTimer: sprite.thinkingTimer ? (clearTimeout(sprite.thinkingTimer), null) : null,
        })),
      )
    }

    setIsPlaying((prev) => !prev)
  }

  const resetProject = () => {
    if (isDemoMode) return // Prevent reset during demo

    // Stop any ongoing animations
    if (isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      setIsPlaying(false)
    }

    // Clear any timers
    sprites.forEach((sprite) => {
      if (sprite.sayingTimer) clearTimeout(sprite.sayingTimer)
      if (sprite.thinkingTimer) clearTimeout(sprite.thinkingTimer)
    })

    if (collisionTimerRef.current) {
      clearTimeout(collisionTimerRef.current)
    }

    // Reset collision state
    setCollisionOccurred(false)
    collidedSpritesRef.current.clear()

    // Reset to initial sprite (keep only one default sprite)
    setSprites([
      {
        id: "sprite1",
        name: "Sprite 1",
        x: 200,
        y: 200,
        direction: 90,
        blocks: [],
        costume: "🐱",
        saying: "",
        thinking: "",
        sayingTimer: null,
        thinkingTimer: null,
        collided: false,
        collisionCooldown: 0,
      },
    ])

    // Set selected sprite to the default one
    setSelectedSpriteId("sprite1")
  }

  // Function to start the demo mode
  const startDemoMode = () => {
    console.log("Starting demo mode")

    // Clear any existing timers
    if (demoTimerRef.current) {
      clearTimeout(demoTimerRef.current)
      demoTimerRef.current = null
    }

    if (demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current)
      demoIntervalRef.current = null
    }

    // Stop any ongoing animations
    if (isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      setIsPlaying(false)
    }

    // Reset collision state
    setCollisionOccurred(false)
    setDemoCollisionOccurred(false)
    collidedSpritesRef.current.clear()
    setDemoTick(0)

    // Set demo mode
    setIsDemoMode(true)

    // Start the simple demo animation
    startSimpleDemoAnimation()
  }

  // Function to exit demo mode
  const exitDemoMode = () => {
    console.log("Exiting demo mode")

    // Clear any timers
    if (demoTimerRef.current) {
      clearTimeout(demoTimerRef.current)
      demoTimerRef.current = null
    }

    if (demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current)
      demoIntervalRef.current = null
    }

    sprites.forEach((sprite) => {
      if (sprite.sayingTimer) clearTimeout(sprite.sayingTimer)
      if (sprite.thinkingTimer) clearTimeout(sprite.thinkingTimer)
    })

    // Reset to normal mode
    setIsDemoMode(false)
    setDemoStep(0)
    setDemoCollisionOccurred(false)
    setCollisionOccurred(false)
    setDemoTick(0)

    // Reset to initial sprite
    setSprites([
      {
        id: "sprite1",
        name: "Sprite 1",
        x: 200,
        y: 200,
        direction: 90,
        blocks: [],
        costume: "🐱",
        saying: "",
        thinking: "",
        sayingTimer: null,
        thinkingTimer: null,
        collided: false,
        collisionCooldown: 0,
      },
    ])

    setSelectedSpriteId("sprite1")
  }

  // Toggle demo mode
  const toggleDemoMode = () => {
    if (isDemoMode) {
      exitDemoMode()
    } else {
      startDemoMode()
    }
  }

  useEffect(() => {
    if (isPlaying && !isDemoMode) {
      lastTimeRef.current = performance.now()
      animationFrameRef.current = requestAnimationFrame(executeBlocks)
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
    // executeBlocks references state variables that change frequently
    // Adding it to the dependency array would cause too many re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, isDemoMode])

  // Clean up timers and animation frames when component unmounts
  useEffect(() => {
    return () => {
      sprites.forEach((sprite) => {
        if (sprite.sayingTimer) clearTimeout(sprite.sayingTimer)
        if (sprite.thinkingTimer) clearTimeout(sprite.thinkingTimer)
      })

      if (collisionTimerRef.current) {
        clearTimeout(collisionTimerRef.current)
      }

      if (demoTimerRef.current) {
        clearTimeout(demoTimerRef.current)
      }

      if (demoIntervalRef.current) {
        clearInterval(demoIntervalRef.current)
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [sprites])

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-screen bg-gray-100">
        <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Scratch Clone</h1>
          <div className="flex space-x-2">
            <button
              className={`px-4 py-2 rounded-md font-bold ${
                isPlaying ? "bg-red-500 text-white" : "bg-green-500 text-white"
              } ${isDemoMode ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={togglePlay}
              disabled={isDemoMode}
            >
              {isPlaying ? "Stop" : "Play All Sprites"}
            </button>
            <button
              className={`px-4 py-2 bg-blue-500 text-white rounded-md font-bold ${
                isDemoMode ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={addSprite}
              disabled={isDemoMode}
            >
              Add Sprite
            </button>
            <button
              className={`px-4 py-2 bg-yellow-500 text-white rounded-md font-bold hover:bg-yellow-600 transition-colors ${
                isDemoMode ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => {
                if (
                  window.confirm("Are you sure you want to reset the project? All sprites and blocks will be removed.")
                ) {
                  resetProject()
                }
              }}
              disabled={isDemoMode}
            >
              Reset All
            </button>
            <button
              className={`px-4 py-2 rounded-md font-bold flex items-center ${
                isDemoMode ? "bg-red-500 text-white hover:bg-red-600" : "bg-purple-500 text-white hover:bg-purple-600"
              } transition-colors`}
              onClick={toggleDemoMode}
            >
              {isDemoMode ? (
                <>
                  <XCircle className="mr-1" size={18} />
                  Exit Demo
                </>
              ) : (
                <>
                  <Lightbulb className="mr-1" size={18} />
                  Hero Feature Demo
                </>
              )}
            </button>
            <button
              className="px-4 py-2 bg-gray-500 text-white rounded-md font-bold hover:bg-gray-600 transition-colors"
              onClick={() => setDebugMode(!debugMode)}
            >
              {debugMode ? "Disable Debug" : "Enable Debug"}
            </button>
          </div>
        </header>

        {debugMode && (
          <div className="bg-black text-green-400 p-2 font-mono text-xs overflow-auto" style={{ maxHeight: "150px" }}>
            <div>Debug Mode Active</div>
            <div>Sprites: {sprites.length}</div>
            <div>Selected: {selectedSpriteId}</div>
            <div>Playing: {isPlaying ? "Yes" : "No"}</div>
            <div>Demo Mode: {isDemoMode ? "Yes" : "No"}</div>
            <div>Demo Step: {demoStep}</div>
            <div>Collision: {collisionOccurred ? "Yes" : "No"}</div>
            <div>Demo Collision: {demoCollisionOccurred ? "Yes" : "No"}</div>
            <div>Demo Tick: {demoTick}</div>
            <div>
              Sprite Positions:
              {sprites.map((s) => (
                <div key={s.id}>
                  {s.name}: ({s.x.toFixed(0)}, {s.y.toFixed(0)}) - Blocks: {s.blocks.length}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          <div className="w-64 bg-gray-200 p-4 overflow-y-auto">
            <BlockPalette addBlock={addBlock} />
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-4 relative">
              <SpriteCanvas
                sprites={sprites}
                selectedSpriteId={selectedSpriteId}
                setSelectedSpriteId={setSelectedSpriteId}
                updateSpritePosition={updateSpritePosition}
                collisionOccurred={collisionOccurred}
              />

              {collisionOccurred && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-4 py-2 rounded-md font-bold animate-bounce">
                  Collision Detected! Blocks Swapped!
                </div>
              )}

              {/* Debug info overlay */}
              {isDemoMode && demoTick > 0 && (
                <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-md font-mono text-sm">
                  Animation Frame: {demoTick}
                </div>
              )}

              {/* Demo Mode Overlay */}
              {isDemoMode && <DemoOverlay step={demoStep} collisionOccurred={demoCollisionOccurred} />}
            </div>

            <div className="bg-gray-200 p-4 overflow-y-auto" style={{ maxHeight: "40vh" }}>
              <SpriteList
                sprites={sprites}
                selectedSpriteId={selectedSpriteId}
                setSelectedSpriteId={setSelectedSpriteId}
                updateBlock={updateBlock}
                removeBlock={removeBlock}
                moveBlockToSprite={moveBlockToSprite}
                addBlockToSprite={addBlockToSprite}
                deleteSprite={deleteSprite}
                isDemoMode={isDemoMode}
              />
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  )
}

export default ScratchEditor
