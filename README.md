# DECStudioHub — Everyday Digital Toolbox

[![Deploy to GitHub Pages](https://github.com/DECStudioHub/DECStudioHub-DigitalTool/actions/workflows/deploy.yml/badge.svg)](https://github.com/DECStudioHub/DECStudioHub-DigitalTool/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

> **Live Application**: [https://decstudiohub.github.io/DECStudioHub-DigitalTool/](https://decstudiohub.github.io/DECStudioHub-DigitalTool/)

**DECStudioHub** is a fast, modern, and private web-based digital toolbox designed for everyday engineering, solar electrical planning, network diagnostics, automotive trip tracking, financial calculations, and media conversion.

Everything executes **100% client-side** in your browser — zero tracking, zero server latency, and complete privacy for all calculations.

---

## 🚀 Key Modules & Tools

### 🖥️ IT & Networking
- **IP Calculator**: IPv4 class analysis, binary notation, wildcard mask, private/public range check.
- **Subnet Calculator**: CIDR subnet mask generator, network/broadcast addresses, usable host counts, subnetwork breakdown.
- **WiFi Signal Calculator**: Free-space path loss (FSPL), RSSI estimation, signal strength grading (Excellent, Good, Fair, Poor), and recommended coverage radius.
- **Bandwidth Calculator**: Transfer speed vs. file size duration estimation, download/upload throughput conversions.
- **Command Prompt (CMD) Reference**: Searchable database of Windows CMD and PowerShell commands with syntax and examples.
- **Windows Built-in Tools Launcher**: Shortcuts and instructions for native administrative tools (`dxdiag`, `resmon`, `msconfig`, `diskmgmt.msc`, etc.).

### 🏍️ Motorcycle Utilities
- **Fuel Calculator**: Cost per distance, liter consumption, and total expense per ride.
- **Trip Cost Calculator**: Comprehensive ride planner accounting for fuel, tolls, meals, maintenance wear, and split costs.
- **km/L Calculator**: Real-world fuel efficiency benchmark from odometer logs.
- **Maintenance Tracker**: Service interval logging for engine oil, coolant, spark plug, brake pads, tires, and drive chain.

### ☀️ Solar System
- **Solar Setup Wizard**: Step-by-step complete photovoltaic (PV) sizing wizard based on daily electrical loads and sun hours.
- **Solar Panel & System Calculator**: Total wattage, panel count, array configuration (series/parallel), and roof footprint.
- **Battery Storage Calculator**: Battery bank capacity (Ah & kWh), depth of discharge (DoD), and autonomy days.
- **Inverter Sizing Calculator**: Continuous running wattage, inductive motor surge capacity, and DC voltage matching.
- **Charge Controller Calculator**: MPPT and PWM sizing, Voc safety margin, and maximum charging amperage.
- **Solar Wire & Protection**: DC/AC wire gauge sizing (AWG/mm²), voltage drop compliance (<3%), circuit breakers, and fuses.
- **Solar System Summary**: Comprehensive bill of materials, equipment specs, and expected daily generation.

### 🏠 Household Electricity
- **Household Wiring Calculator**: Wire gauge (THHN/THWN-2), allowable ampacity, conduit size, and run-length voltage drop.
- **Household Panel Board**: Main breaker sizing, branch circuit distribution (lighting, convenience outlets, AC, cooking), and load schedules.
- **Electricity Consumption Calculator**: Daily and monthly kWh consumption audit with device wattage presets.
- **Electricity Bill Calculator**: Tiered electric bill estimation with VAT, distribution charges, and lifeline discounts.

### 🧮 General Calculators
- **Number Calculator**: Standard and scientific arithmetic calculator with memory register.
- **Percentage Calculator**: Quick percentage of value, percentage increase/decrease, and ratio comparison.
- **Age Calculator**: Precise years, months, days, hours, and next birthday countdown.
- **Date Calculator**: Working days between dates, date addition/subtraction, and leap year checks.
- **Loan & Amortization**: Monthly payment, total interest, and full repayment schedule.
- **Salary & Tax Calculator**: Net income, deductions, and annual earnings projections.
- **Discount Calculator**: Final discounted price, savings, and multi-tier promotions.
- **Profit & Margin Calculator**: Cost of goods, markup percentage, margin ratio, and gross profit.

### 📏 Unit Converter & 🖼️ Image Tools
- **Unit Converter**: Length, weight/mass, temperature, volume, area, speed, energy, pressure, and digital storage.
- **Image Tools**: Client-side image compressor, dimension resizer, and image format converter (PNG, JPEG, WebP) with zero server upload.

### ⭐ Productivity Features
- **Favorites System**: Bookmark frequently used tools with one click (saved in browser `localStorage`).
- **Global Search**: Instant keyboard shortcut (`Ctrl + K` or `Cmd + K`) to search any tool, formula, or keyword.

---

## 🛠️ Technology Stack

- **Framework**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Motion](https://motion.dev/)
- **Hosting**: [GitHub Pages](https://pages.github.com/) via GitHub Actions

---

## 💻 Local Development

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (or `pnpm` / `bun`)

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/DECStudioHub/DECStudioHub-DigitalTool.git
   cd DECStudioHub-DigitalTool
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Run TypeScript type checks:**
   ```bash
   npm run lint
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```
   The compiled static files will be generated in the `dist/` directory.

---

## 🌐 Publishing to GitHub & GitHub Pages

This project comes pre-configured with automated GitHub Actions deployment located at `.github/workflows/deploy.yml`.

### Step 1: Initialize Git and Push to GitHub

If you haven't linked your local workspace to your GitHub repository yet:

```bash
# Initialize git repository
git init

# Add all project files
git add .

# Commit changes
git commit -m "Initial commit: DECStudioHub Everyday Digital Toolbox"

# Set branch name to main
git branch -M main

# Link remote repository
git remote add origin https://github.com/DECStudioHub/DECStudioHub-DigitalTool.git

# Push code to GitHub
git push -u origin main
```

*(Note: If the GitHub repository already contains files like a README or License, run `git pull origin main --rebase` before `git push`)*

### Step 2: Enable GitHub Pages

1. Navigate to your GitHub repository: [https://github.com/DECStudioHub/DECStudioHub-DigitalTool](https://github.com/DECStudioHub/DECStudioHub-DigitalTool)
2. Click **Settings** (tab at the top right).
3. In the left sidebar, click **Pages**.
4. Under **Build and deployment** > **Source**, select **GitHub Actions**.
5. That's it! Every push to the `main` branch will automatically trigger the deployment workflow, and your website will be live at:
   **`https://decstudiohub.github.io/DECStudioHub-DigitalTool/`**

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
