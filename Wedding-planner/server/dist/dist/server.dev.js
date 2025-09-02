"use strict";

var __importDefault = void 0 && (void 0).__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var express_1 = __importDefault(require("express"));

var cors_1 = __importDefault(require("cors"));

var dotenv_1 = __importDefault(require("dotenv"));

var db_1 = __importDefault(require("./config/db"));

var vendorRoutes_1 = __importDefault(require("./routes/vendorRoutes"));

var userRoutes_1 = __importDefault(require("./routes/userRoutes"));

var guestRoutes_1 = __importDefault(require("./routes/guestRoutes"));

var checkListRoutes_1 = __importDefault(require("./routes/checkListRoutes"));

var weddingRoutes_1 = __importDefault(require("./routes/weddingRoutes"));

var uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));

var listRoutes_1 = __importDefault(require("./routes/listRoutes"));

var comparisonRoutes_1 = __importDefault(require("./routes/comparisonRoutes"));

var budgetRoutes_1 = __importDefault(require("./routes/budgetRoutes"));

var path_1 = __importDefault(require("path"));

dotenv_1["default"].config();
var app = (0, express_1["default"])(); // Add logging middleware

app.use(function (req, res, next) {
  next();
}); // CORS configuration for production

app.use((0, cors_1["default"])({
  origin: process.env.NODE_ENV === 'production' ? ['https://wedi-app.vercel.app', // Your Vercel frontend URL
  'https://wedi-icevbne50-galits-projects-9399d19b.vercel.app', // Vercel preview URL
  'http://localhost:5173', // For local development
  'https://wedding-planner-wj86.onrender.com' // for server ok
  ] : true,
  // Allow all origins in development
  credentials: true
}));
app.use(express_1["default"].json({
  limit: "100mb"
}));
app.use(express_1["default"].urlencoded({
  limit: "100mb",
  extended: true
}));
app.use('/uploads', express_1["default"]["static"](path_1["default"].join(__dirname, 'uploads')));
app.use("/api/vendors", vendorRoutes_1["default"]);
app.use("/api/users", userRoutes_1["default"]);
app.use("/api/guests", guestRoutes_1["default"]);
app.use("/api/checklists", checkListRoutes_1["default"]);
app.use("/api/weddings", weddingRoutes_1["default"]);
app.use("/api/upload", uploadRoutes_1["default"]);
app.use("/api/lists", listRoutes_1["default"]);
app.use("/api/comparisons", comparisonRoutes_1["default"]);
app.use("/api/budgets", budgetRoutes_1["default"]);
app.get("/", function (req, res) {
  res.send("Server is running");
});
var PORT = process.env.PORT || 5000;
(0, db_1["default"])().then(function () {
  app.listen(PORT, function () {
    return console.log("Server running on port ".concat(PORT));
  });
})["catch"](function (err) {
  console.error("Failed to start server:", err);
});