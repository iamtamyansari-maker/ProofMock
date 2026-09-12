# ProofMock 🚀

**ProofMock** is a modern, high-performance web application designed for creating 3D perspective device mockups with real-time homography transformations, green screen quad warping, individual corner radius controls, 3D curved surfaces, precision Bezier pen masking, and AI environment lighting auto-tuning.

![ProofMock Banner](/public/poorfmock-logo.png)

---

## ✨ Features

- 📐 **Real-Time 3D Perspective Homography**: Warp any 2D UI artwork onto 3D laptop, phone, monitor, or tablet displays using Hartley-normalized 3x3 homography.
- 🟢 **Green Screen Mockup Quad**: Automatically fills empty screen areas with a green screen placeholder (`#00e600`) and a central floating `+` button to add artwork directly.
- ✒️ **Photoshop & Figma Bezier Pen Tool**: Draw vector cutout masks with line guidelines, node handle controls, and magnetic start-node close snapping.
- ✂️ **Figma-Style Image Crop**: Interactive 8-point crop tool with 3x3 rule-of-thirds grid overlay.
- 🔗 **Individual & Uniform Corner Radius**: Lock or unlock custom corner rounding radii for Top-Left, Top-Right, Bottom-Right, and Bottom-Left display corners.
- 🏺 **3D Curved Surface Smart Objects**: Warp artwork over 3D cylindrical surfaces (jars, bottles, cans, mugs) and spherical arcs with non-linear UV displacement.
- ✨ **Smart AI Environment Lighting Assistant**: Automatically detects background brightness gradients, shadows, and reflection angles to optimize glare and inner bevel shadow.
- 📋 **OS Clipboard Integration**: Seamlessly paste images (`Ctrl+V`) from your desktop/browser and copy export results directly to your system clipboard.
- 🖥️ **Minimalist White L-Bracket Handles**: Professional white frame corner indicators (`┌ ┐ ┘ └`) and soft frame lines.
- 📥 **Export Studio**: High-resolution PNG/JPG exports up to 4K Extreme (3840px).

---

## 🚀 Quick Start Guide

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18 or higher) installed on your system.

### 1. Clone the Repository
```bash
git clone https://github.com/iamtamyansari-maker/ProofMock.git
cd ProofMock
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Local Dev Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173/` (or the port specified in terminal).

### 4. Build for Production
```bash
npm run build
```

---

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS (Dark Studio Theme)
- **Math Engine**: Custom Hartley 3x3 Homography Matrix Solver + Bilinear Mipmap Filtering
- **Testing**: Vitest + TypeScript Strict Typechecking

---

## 👨‍💻 Creator & Author

**ProofMock** was created and developed by **Taimoor Ansari**.

- 🌐 **Portfolio & Website**: [taimooransari.framer.website](https://taimooransari.framer.website/)
- 💼 **LinkedIn**: [linkedin.com/in/taimur-ansarii](https://www.linkedin.com/in/taimur-ansarii/)
- ✉️ **Email**: `iamtamyansari@gmail.com`
- 🐙 **GitHub Repository**: [github.com/iamtamyansari-maker/ProofMock](https://github.com/iamtamyansari-maker/ProofMock/tree/main)

---

## 📄 License

Open Source — Feel free to use, modify, and distribute for personal or commercial projects.
