"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { XCircle } from "lucide-react"

interface SimpleDemoModeProps {
  onExit: () => void
}

const SimpleDemoMode: React.FC<SimpleDemoModeProps> = ({ onExit }) => {
  const [step, setStep] = useState(0)
  const [collided, setCollided] = useState(false)

  // Use useEffect to control the demo steps
  useEffect(() => {
    console.log("SimpleDemoMode mounted")

    // Step 0: Initial state with speech bubbles
    const step1Timer = setTimeout(() => {
      console.log("Moving to step 1")
      setStep(1) // Start movement
    }, 2000)

    // Step 2: Collision
    const collisionTimer = setTimeout(() => {
      console.log("Collision detected")
      setCollided(true)
      setStep(2)
    }, 5000)

    // Force re-render every 100ms to ensure animations are running
    const renderInterval = setInterval(() => {
      // This empty setState forces a re-render
      setStep((prevStep) => prevStep)
    }, 100)

    return () => {
      clearTimeout(step1Timer)
      clearTimeout(collisionTimer)
      clearInterval(renderInterval)
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Scratch Clone - Demo Mode</h1>
        <button className="px-4 py-2 bg-red-500 text-white rounded-md font-bold flex items-center" onClick={onExit}>
          <XCircle className="mr-1" size={18} />
          Exit Demo
        </button>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative bg-gray-100 overflow-hidden">
        {/* Sprite 1 - Cat */}
        <div
          className={`absolute transition-all ${step === 0 ? "" : step === 1 ? "cat-move-right" : "cat-move-left"} ${collided ? "scale-110" : ""}`}
          style={{
            left: "150px",
            top: "200px",
            transform: "translate(-50%, -50%)",
            zIndex: 10,
          }}
        >
          <div className="text-4xl">🐱</div>

          {/* Speech bubble */}
          {step === 0 && (
            <div
              className="absolute bg-white border-2 border-black rounded-lg p-2 max-w-xs z-20"
              style={{
                left: "30px",
                top: "-50px",
              }}
            >
              I move right!
              <div
                className="absolute w-4 h-4 bg-white border-r-2 border-b-2 border-black transform rotate-45"
                style={{
                  left: "-5px",
                  bottom: "10px",
                }}
              />
            </div>
          )}

          {collided && (
            <div
              className="absolute bg-white border-2 border-black rounded-lg p-2 max-w-xs z-20"
              style={{
                left: "30px",
                top: "-50px",
              }}
            >
              Swapped blocks!
              <div
                className="absolute w-4 h-4 bg-white border-r-2 border-b-2 border-black transform rotate-45"
                style={{
                  left: "-5px",
                  bottom: "10px",
                }}
              />
            </div>
          )}
        </div>

        {/* Sprite 2 - Dog */}
        <div
          className={`absolute transition-all ${step === 0 ? "" : step === 1 ? "dog-move-left" : "dog-move-right"} ${collided ? "scale-110" : ""}`}
          style={{
            left: "450px",
            top: "200px",
            transform: "translate(-50%, -50%)",
            zIndex: 1,
          }}
        >
          <div className="text-4xl">🐶</div>

          {/* Speech bubble */}
          {step === 0 && (
            <div
              className="absolute bg-white border-2 border-black rounded-lg p-2 max-w-xs z-20"
              style={{
                left: "30px",
                top: "-50px",
              }}
            >
              I move left!
              <div
                className="absolute w-4 h-4 bg-white border-r-2 border-b-2 border-black transform rotate-45"
                style={{
                  left: "-5px",
                  bottom: "10px",
                }}
              />
            </div>
          )}

          {collided && (
            <div
              className="absolute bg-white border-2 border-black rounded-lg p-2 max-w-xs z-20"
              style={{
                left: "30px",
                top: "-50px",
              }}
            >
              Swapped blocks!
              <div
                className="absolute w-4 h-4 bg-white border-r-2 border-b-2 border-black transform rotate-45"
                style={{
                  left: "-5px",
                  bottom: "10px",
                }}
              />
            </div>
          )}
        </div>

        {/* Collision notification */}
        {collided && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-4 py-2 rounded-md font-bold animate-bounce">
            Collision Detected! Blocks Swapped!
          </div>
        )}

        {/* Demo overlay */}
        <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg border-2 border-purple-500 max-w-md">
          <h3 className="text-lg font-bold text-purple-700 mb-2 flex items-center">
            <span className="mr-2">🎮</span>
            Hero Feature Demo
          </h3>

          {step === 0 && (
            <div className="text-sm">
              <p className="mb-2">
                <span className="font-bold">Welcome to the demo!</span> This will show you how sprites can swap their
                blocks when they collide.
              </p>
              <p>
                We've set up two sprites with opposite movement blocks:
                <br />- The cat will move <span className="font-bold text-green-600">right</span>
                <br />- The dog will move <span className="font-bold text-red-600">left</span>
              </p>
              <p className="mt-2 text-xs italic">The demo will begin automatically in a moment...</p>
            </div>
          )}

          {step === 1 && !collided && (
            <div className="text-sm">
              <p className="mb-2">
                <span className="font-bold">Sprites are moving!</span> Watch as they move toward each other.
              </p>
              <p>
                - The cat is moving <span className="font-bold text-green-600">right</span>
                <br />- The dog is moving <span className="font-bold text-red-600">left</span>
                <br />
                They will collide in a moment...
              </p>
            </div>
          )}

          {step === 2 && collided && (
            <div className="text-sm">
              <p className="mb-2">
                <span className="font-bold text-yellow-600">Collision detected!</span> The sprites have swapped their
                blocks!
              </p>
              <p>
                Now their movements are reversed:
                <br />- The cat is moving <span className="font-bold text-red-600">left</span>
                <br />- The dog is moving <span className="font-bold text-green-600">right</span>
                <br />
                This is the hero feature of our Scratch clone - sprites exchange their behaviors when they collide!
              </p>
            </div>
          )}

          <div className="mt-3 text-xs text-gray-500">Click "Exit Demo" to return to normal mode</div>
        </div>

        {/* Step indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${
              step === 0 ? "bg-purple-600" : "bg-gray-400"
            } transition-colors duration-300`}
          ></div>
          <div
            className={`w-3 h-3 rounded-full ${
              step === 1 ? "bg-purple-600" : "bg-gray-400"
            } transition-colors duration-300`}
          ></div>
          <div
            className={`w-3 h-3 rounded-full ${
              step === 2 ? "bg-purple-600" : "bg-gray-400"
            } transition-colors duration-300`}
          ></div>
        </div>
      </div>
    </div>
  )
}

export default SimpleDemoMode
