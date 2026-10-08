const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){

 if (!req.session) {
        return res.status(500).json({ message: "Session not initialized" });
    }

    // 2. User must have logged in (session contains authorization)
    if (!req.session.authorization) {
        return res.status(403).json({ message: "User not logged in" });
    }

    // 3. Optionally: check token expiry
    const { username, expiresAt } = req.session.authorization;
    if (expiresAt && Date.now() > expiresAt) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "Session expired" });
    }

    // 4. Attach user info to req for downstream handlers
    req.user = { username };

    next();
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
