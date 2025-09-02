"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const vendorRoutes_1 = __importDefault(require("./routes/vendorRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const guestRoutes_1 = __importDefault(require("./routes/guestRoutes"));
const checkListRoutes_1 = __importDefault(require("./routes/checkListRoutes"));
const weddingRoutes_1 = __importDefault(require("./routes/weddingRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const listRoutes_1 = __importDefault(require("./routes/listRoutes"));
const comparisonRoutes_1 = __importDefault(require("./routes/comparisonRoutes"));
const budgetRoutes_1 = __importDefault(require("./routes/budgetRoutes"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = express_1.default();
// Add logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - Origin: ${req.get('origin')} - User-Agent: ${req.get('user-agent')}`);
    next();
});
// CORS configuration for production
app.use(cors_1.default({
    origin: process.env.NODE_ENV === 'production'
        ? [
            'https://wedi-app.vercel.app',
            'https://wedi-icevbne50-galits-projects-9399d19b.vercel.app',
            'http://localhost:5173',
            'https://wedding-planner-wj86.onrender.com' // for server ok
        ]
        : true,
    credentials: true
}));
app.use(express_1.default.json({ limit: "100mb" }));
app.use(express_1.default.urlencoded({ limit: "100mb", extended: true }));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, 'uploads')));
app.use("/api/vendors", vendorRoutes_1.default);
app.use("/api/users", userRoutes_1.default);
app.use("/api/guests", guestRoutes_1.default);
app.use("/api/checklists", checkListRoutes_1.default);
app.use("/api/weddings", weddingRoutes_1.default);
app.use("/api/upload", uploadRoutes_1.default);
app.use("/api/lists", listRoutes_1.default);
app.use("/api/comparisons", comparisonRoutes_1.default);
app.use("/api/budgets", budgetRoutes_1.default);
app.get("/", (req, res) => {
    res.send("Server is running");
});
// Handle preflight requests explicitly
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', req.get('origin') || '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,Origin,X-Requested-With,Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
});
// Add error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});
// Add 404 handler for unmatched routes
app.use((req, res) => {
    console.log(`404 - Route not found: ${req.method} ${req.path}`);
    res.status(404).json({ message: 'Route not found' });
});
const PORT = process.env.PORT || 5000;
db_1.default()
    .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
    .catch((err) => {
    console.error("Failed to start server:", err);
});
