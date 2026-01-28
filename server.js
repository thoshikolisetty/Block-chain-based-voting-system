// --- Bcrypt alias fix ---
const originalRequire = require;
require = function(moduleName) {
    if (moduleName === 'bcrypt') moduleName = 'bcryptjs';
    return originalRequire(moduleName);
};

// -------------------------
// Standard imports
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Initialize DB connection
require('./config/database');

const candidateRoutes = require('./routes/candidate');
const companyRoutes = require('./routes/company');
const voterRoutes = require('./routes/voter');

const app = express();
const PORT = process.env.PORT || 5001;

// Enable CORS
app.use(cors());

// Parse JSON and urlencoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Mount API routes
app.use('/api/candidate', candidateRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/voter', voterRoutes);

// Health check
app.get('/api/test', (req, res) => res.json({ message: 'Backend is working!' }));
app.get('/', (req, res) => res.send('BlockChainVoting API is running'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
