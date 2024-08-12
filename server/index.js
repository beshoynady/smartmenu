const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const helmet = require('helmet'); // Security middleware
const cookieParser = require('cookie-parser');
const http = require('http');
const socketIo = require('socket.io');

// Import database connection and route files
const connectdb = require('./database/connectdb.js');
const routerestaurant = require('./router/Restaurant.router.js');
const routepermission = require('./router/Permission.router.js');
const routeattendance = require('./router/AttendanceRecord.router.js');
const routeshift = require('./router/Shift.router.js');
const routedeliveryarea = require('./router/DeliveryArea.router.js');
const routereservation = require('./router/Reservation.router.js');
const routemessage = require('./router/Message.router.js');
const routeauth = require('./router/Auth.router.js');
const routemenucategory = require('./router/MenuCategory.router.js');
const routeproduct = require('./router/Product.router.js');
const routerecipe = require('./router/Recipe.router.js');
const routeuser = require('./router/User.router.js');
const routecustomer = require('./router/Customer.router.js');
const routeemployee = require('./router/Employee.router.js');
const routepayroll = require('./router/PayRoll.router.js');
const routeEmployeeTransactions = require('./router/EmployeeTransactions.router.js');
const routetable = require('./router/Table.router.js');
const routeorder = require('./router/Order.router.js');
const routecategoryStock = require('./router/CategoryStock.router.js');
const routestockitems = require('./router/StockItem.router.js');
const routesupplier = require('./router/Supplier.router.js');
const routesupplierTransaction = require('./router/SupplierTransaction.router.js');
const routepurchase = require('./router/Purchase.router.js');
const routepurchasereturn = require('./router/PurchaseReturnInvoice.router.js');
const routestockmanag = require('./router/StockMang.router.js');
const routekitchenconsumption = require('./router/kitchenConsumption.router.js');
const routeexpense = require('./router/Expense.router.js');
const routedailyexpense = require('./router/DailyExpense.router.js');
const routecashRegister = require('./router/CashRegister.router.js');
const routecashMovement = require('./router/CashMovement.router.js');

// Load environment variables from .env file
dotenv.config();

// Connect to the database
connectdb();

const app = express();
const frontEnd = process.env.FRONT_END_URL;

// Security middleware
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// Middleware setup
app.use(express.json({ limit: "100kb" })); // Limit request body size
app.use(cookieParser()); // Parse cookies

// CORS setup
app.use(cors({
  origin: 'https://www.elbaronpark.sm-menu.tech',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Serve static files
app.use('/', express.static("public"));
app.use('/images', express.static("images"));

// Simple test endpoint to check if the server is running
app.get('/', (req, res) => {
  res.send('Welcome to the server!');
});

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: 100, // Limit each IP to 100 requests per window (1 minute)
  standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  trustProxy: false // Disable trusting proxy headers
});
app.use("/api", limiter); // Apply rate limiting to all API routes

// Route requests to appropriate routers
app.use('/api/restaurant', routerestaurant);
app.use('/api/permission', routepermission);
app.use('/api/attendance', routeattendance);
app.use('/api/shift', routeshift);
app.use('/api/deliveryarea', routedeliveryarea);
app.use('/api/product', routeproduct);
app.use('/api/recipe', routerecipe);
app.use('/api/menucategory', routemenucategory);
app.use('/api/customer', routecustomer);
app.use('/api/user', routeuser);
app.use('/api/employee', routeemployee);
app.use('/api/message', routemessage);
app.use('/api/payroll', routepayroll);
app.use('/api/employeetransactions', routeEmployeeTransactions);
app.use('/api/table', routetable);
app.use('/api/order', routeorder);
app.use('/api/auth', routeauth);
app.use('/api/categoryStock', routecategoryStock);
app.use('/api/stockitem', routestockitems);
app.use('/api/supplier', routesupplier);
app.use('/api/suppliertransaction', routesupplierTransaction);
app.use('/api/purchaseinvoice', routepurchase);
app.use('/api/purchasereturn', routepurchasereturn);
app.use('/api/stockmanag', routestockmanag);
app.use('/api/kitchenconsumption', routekitchenconsumption);
app.use('/api/expenses', routeexpense);
app.use('/api/dailyexpense', routedailyexpense);
app.use('/api/cashregister', routecashRegister);
app.use('/api/cashMovement', routecashMovement);
app.use('/api/reservation', routereservation);

const server = http.createServer(app);

// Setup Socket.io
const io = socketIo(server, {
  cors: {
    origin: 'https://www.elbaronpark.sm-menu.tech',
    methods: ["GET", "POST"],
    allowedHeaders: ["content-type"]
  },
});

// Handle socket.io connections
io.on('connect', (socket) => {
  console.log('New client connected');

  // Listen for new order notifications
  socket.on('sendorder', (notification) => {
    console.log("Notification received:", notification); // Confirm receipt
    // Emit the notification back to the client for testing purposes
    socket.broadcast.emit('reciveorder', notification);
  });

  // Handle disconnect event
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const port = process.env.PORT || 8000;

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
