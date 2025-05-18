import type React from "react"

interface DemoOverlayProps {
  step: number
  collisionOccurred: boolean
}

const DemoOverlay: React.FC<DemoOverlayProps> = ({ step, collisionOccurred }) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-10"></div>

      {/* Demo step indicators */}
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

        {step === 1 && !collisionOccurred && (
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
            <p className="mt-2 text-xs italic text-red-600">
              If sprites aren't moving, look for the blue animation counter at the top of the screen.
            </p>
          </div>
        )}

        {step === 2 && collisionOccurred && (
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

      {/* Step indicators at the bottom */}
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
  )
}

export default DemoOverlay
