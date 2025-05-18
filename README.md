
# 🧩 Scratch Clone

A visual programming environment inspired by MIT Scratch, built with **React**, **TypeScript**, and **TailwindCSS**.

It allows users to drag and drop motion and looks blocks, add multiple sprites, and see them animate — including a **Hero Feature** where sprites swap their logic on collision!

---

## 🚀 Deployed Application

> ⚠️ **Hero Feature Limitation**:  
> **The Hero Feature does not function on the deployed site.** For a working demonstration, please refer to the **screen recording** provided in the Drive link below.
>
> 🔄 A "Hero Feature Demo" button exists in the interface, but due to deployment constraints, it does not function properly and can be ignored.


- **🔗 Live App**: [https://scratch-new.vercel.app/](https://scratch-new.vercel.app/)
- **🎥 Screen Recording**: [Watch on Google Drive](https://drive.google.com/file/d/1vnxQWiaJkErzcg8zp8jnZNv247jlBWD6/view?usp=sharing)

> ⚠️ **Important Note**:  
> The **Hero Feature (Collision-Based Animation Swap)** might not function as expected in the deployed version due to how `console.log` and internal state reactivity are handled on Vercel.  
> However, it works perfectly in **local development**, as demonstrated in the screen recording above.

---

## ✨ Features

### 🎯 Motion Animations
Implemented blocks under the “Motion” category:
- `Move ___ steps`
- `Turn ___ degrees`
- `Go to x: ___ y: ___`
- `Repeat ___ times` (from Control)

### 🗨️ Looks Animations
Implemented blocks under the “Looks” category:
- `Say ___ for ___ seconds`
- `Think ___ for ___ seconds`

Supports **drag-and-drop** with **editable inputs**, just like the original Scratch environment.

### 🧍 Multiple Sprite Support
- Add and manage multiple sprites
- Assign different blocks to each sprite
- Play all sprite logic at once with the **Play All Sprites** button

### 💥 Hero Feature – Collision-Based Animation Swap
- When two sprites **collide**, they **swap block logic**
- Example:
  - Sprite 1: `Move 50 steps`
  - Sprite 2: `Move -50 steps`
  - After collision:
    - Sprite 1: `Move -50 steps`
    - Sprite 2: `Move 50 steps`
- Adds dynamic and interactive logic changes to the playground

---

## 🖼️ Screenshots

### Before Collision
![Before Collision](Screenshot%202025-05-19%20004426.png)

### After Collision – Hero Feature Activated
![After Collision](Screenshot%202025-05-19%20004542.png)

---

## 🧪 How to Use

### 🔧 Controls
- **Add Sprite** – Adds a new sprite to the canvas
- **Play All Sprites** – Starts all sprites’ animations
- **Reset All** – Clears all sprites and block logic
- **Hero Feature Demo** – Auto-runs a collision scenario showing block swap

### 🧱 Working with Blocks
- Drag blocks from the left panel into any sprite’s workspace
- Edit block values directly
- Drag sprites to position them for collision
- When two sprites collide, their logic swaps dynamically

---

## 🛠️ Installation & Setup

### 📦 Prerequisites
- [Node.js](https://nodejs.org/) (v14+ recommended)
- npm or yarn

### 🔍 Steps

1. **Clone or Download the Repo**
   ```bash
   git clone https://github.com/your-username/scratch-clone.git
   cd scratch-clone
   ```

2. **Install Dependencies**

   Using npm:
   ```bash
   npm install --legacy-peer-deps
   ```

   Or with yarn:
   ```bash
   yarn install
   ```

3. **Run the App Locally**

   Using npm:
   ```bash
   npm start
   ```

   Or with yarn:
   ```bash
   yarn start
   ```

4. **Open in Browser**

   Go to [http://localhost:3000](http://localhost:3000)

---

## 🗂️ Project Structure

```
scratch-clone/
├── src/
│   ├── components/       # React components
│   ├── types/            # TypeScript types
│   └── utils/            # Utility functions
├── public/
├── package.json
└── README.md
```

---

## 🧰 Technologies Used

- React
- TypeScript
- Tailwind CSS
- React DnD (drag-and-drop)
- Vite (or Create React App, depending on config)

---

## 📄 License

This project is open-sourced under the **MIT License**.

---

## 🙌 Acknowledgements

Inspired by [MIT Scratch](https://scratch.mit.edu), an amazing platform for visual programming education.
