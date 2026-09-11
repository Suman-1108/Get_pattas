# 🎆 Get Pattasu — Multi-Brand Sivakasi Fireworks Wholesale E-Commerce Platform

> **Direct Factory Consignment & Wholesale Cracker Ordering System**  
> Supports **4 Dedicated Brand Storefronts**, **Centralized Admin Dashboard**, **Automated WhatsApp Order Dispatch**, and **Digital Wholesale Tax Invoice Generation**.

---

## 🌟 Key Highlights

- 🏪 **4 Distinct Brand Storefronts**:
  - **Shop 001**: Sivakasi Muthu Crackers (`/shopno001`)
  - **Shop 002**: Daddy Crackers Sivakasi (`/shopno002`)
  - **Shop 003**: Red Crackers Sivakasi (`/shopno003`)
  - **Shop 004**: Get Pattas Wholesale Depot (`/shopno004` or `/`)
- 📋 **Wholesale Price List Engine**:
  - Full-width interactive catalog with real-time English and Tamil search.
  - One-touch fast increment/decrement quantity steppers.
  - Live row subtotals, total box count, and grand total calculation.
  - Sticky bottom order summary bar with minimum wholesale order threshold validation (₹3,000).
- 📦 **Order Placement & Confirmation Modal**:
  - Non-intrusive placement flow — does **not** forcefully auto-redirect or navigate away.
  - Displays instant congratulatory confirmation modal on the website with a unique **Official Booking Number** (`GP-[BRAND]-[RANDOM]`).
  - Summarizes customer details, consignee address, varieties count, total boxes, and grand total.
- 📄 **Digital Tax Invoice & PDF Generation**:
  - One-click **Download Invoice (PDF)** generating official A4 wholesale bills.
  - Zero-error native in-page printing (`window.print()`) that works seamlessly both offline via `file:///` and online via HTTP.
  - Includes Sivakasi factory letterhead, consignee information, itemized table, authorized verification stamp, and dispatch terms.
- 📲 **Two-Way WhatsApp Integration**:
  - **Customer Confirmation**: Formatted WhatsApp message sent directly to the customer's phone number containing their booking number, order breakdown, and digital invoice link.
  - **Store Desk WhatsApp**: Instant notification to the depot manager for parcel lorry receipt (LR) dispatch and logistics tracking.
- 🔐 **Centralized Admin Dashboard** (`/admin.html`):
  - View, filter, and track all multi-brand wholesale bookings in real-time.
  - Real-time cross-tab synchronization powered by `BroadcastChannel` and REST API.
- ⚡ **Dual Execution Modes**:
  - **Offline/Standalone**: Double-click `index.html` in any shop directory to run directly via `file:///`.
  - **Full-Stack Client-Server**: Run the Node.js Express backend with MongoDB and REST API endpoints.

---

## 📂 Project Structure

```
get-pattasu/
├── .env.example                # Example environment variables template
├── .gitignore                  # Git ignore rules for node_modules, .env, and OS files
├── README.md                   # Project documentation
├── app.js                      # Core frontend application logic (catalog, cart, checkout, invoice)
├── catalogData.js              # Centralized fireworks product database & brand configs
├── invoice.html                # Standalone digital tax invoice viewer
├── html2pdf.bundle.min.js      # Client-side PDF generation library
├── admin.html                  # Centralized multi-brand admin dashboard
├── admin.js                    # Admin panel controller & sync engine
├── admin.css                   # Admin dashboard styles
│
├── shopno001/                  # Shop 001 — Sivakasi Muthu Crackers
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   ├── catalogData.js
│   ├── invoice.html
│   └── html2pdf.bundle.min.js
│
├── shopno002/                  # Shop 002 — Sivakasi Daddy Crackers
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   ├── catalogData.js
│   ├── invoice.html
│   └── html2pdf.bundle.min.js
│
├── shopno003/                  # Shop 003 — Sivakasi Red Crackers
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   ├── catalogData.js
│   ├── invoice.html
│   └── html2pdf.bundle.min.js
│
├── shopno004/                  # Shop 004 — Get Pattas Wholesale Depot
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   ├── catalogData.js
│   ├── invoice.html
│   └── html2pdf.bundle.min.js
│
└── backend/                    # Express.js REST API Server
    ├── server.js               # Entry point forwarding to src/server.js
    ├── package.json
    ├── .env.example
    └── src/
        ├── server.js           # Express app setup, routing, and static file serving
        ├── config/
        │   └── db.js           # MongoDB connection configuration
        ├── controllers/
        │   ├── orderController.js
        │   ├── productController.js
        │   └── brandController.js
        ├── models/
        │   ├── Order.js
        │   ├── Product.js
        │   └── Brand.js
        └── routes/
            ├── orderRoutes.js
            ├── productRoutes.js
            └── brandRoutes.js
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 16.x or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster URI)
- Modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari)

---

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <your-repository-url>
   cd "get pattasu"
   ```

2. **Configure Environment Variables**:
   Copy the `.env.example` file to `.env` in the root and in the `backend/` directory:
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   ```
   Edit `.env` to set your MongoDB connection string and port:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/get_pattasu_multibrand
   JWT_SECRET=your_secret_key
   ```

3. **Install Backend Dependencies**:
   ```bash
   cd backend
   npm install
   ```

4. **Start the Backend Server**:
   ```bash
   node server.js
   ```
   The backend API will start on: **`http://localhost:5000`**

---

## 🌐 Accessing the Application

Once the server is running, you can access the storefronts and dashboard at:

| Portal / Storefront | URL Route | Description |
| :--- | :--- | :--- |
| **Shop 001** | `http://localhost:5000/shopno001` | Sivakasi Muthu Crackers |
| **Shop 002** | `http://localhost:5000/shopno002` | Sivakasi Daddy Crackers |
| **Shop 003** | `http://localhost:5000/shopno003` | Sivakasi Red Crackers |
| **Shop 004** | `http://localhost:5000/shopno004` (or `/`) | Get Pattas Wholesale Depot |
| **Digital Invoice** | `http://localhost:5000/invoice` | Online Invoice Viewer (`?bn=GP-...`) |
| **Admin Panel** | `http://localhost:5000/admin.html` | Multi-Brand Central Dashboard |
| **API Health Check** | `http://localhost:5000/api/health` | Backend status & DB connection check |

> **Note**: You can also open any shop folder's `index.html` directly in your browser (`file:///.../shopno001/index.html`) to browse and place wholesale bookings offline!

---

## 🛠️ Key Technologies

- **Frontend**:
  - Semantic HTML5, Vanilla CSS3 (Custom Design System, Glassmorphism, Responsive Grid)
  - Pure JavaScript (ES6+ modular architecture, LocalStorage isolation, BroadcastChannel)
  - [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) & CSS Print Media engine
  - Font Awesome 6.4 & Google Fonts (Inter)
- **Backend**:
  - [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
  - [MongoDB](https://www.mongodb.com/) & [Mongoose ODM](https://mongoosejs.com/)
  - CORS, Dotenv, Body-Parser
- **Integration**:
  - WhatsApp Click-to-Chat URI API (`wa.me`)
  - Cross-tab `BroadcastChannel` real-time synchronizer

---

## ⚖️ Legal & Regulatory Compliance Notice

> **IMPORTANT COMPLIANCE STATEMENT (Per Supreme Court of India Guidelines)**:  
> In accordance with the 2018 Supreme Court of India directives regarding the sale and distribution of firecrackers:
> - All products featured comply with authorized **Green Fireworks** specifications with verified CSIR-NEERI formulation standards.
> - Online bookings generated through this platform function as **wholesale consignments / estimates** for direct factory transport from Sivakasi, Tamil Nadu.
> - Commercial buyers and site operators must hold valid state permits, explosive licenses, and comply with all applicable local jurisdiction transport laws.

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use and adapt for commercial or personal wholesale distribution.
