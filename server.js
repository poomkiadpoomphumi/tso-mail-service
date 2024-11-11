const express = require('express');
const cors = require('cors');
const router = require("./router.js");
const server = express();
const path = require('path');

server.use(express.json());
server.use(cors({ origin: 'http://localhost:6002', methods: ["GET", "POST"], credentials: true }));
server.use(router);
server.use('/api/uploads', express.static(path.join(__dirname, '../tso-aov-sr-uploads')));
server.listen(6002, () => { console.log(`Server Mail Aov Service Request listening on port 6002`); });

