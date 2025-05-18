import type React from "react"

const TestComponent: React.FC = () => {
  return (
    <div className="p-4 bg-blue-500 text-white">
      <h1 className="text-2xl font-bold">Test Component</h1>
      <p>If you can see this, basic rendering is working!</p>
    </div>
  )
}

export default TestComponent
