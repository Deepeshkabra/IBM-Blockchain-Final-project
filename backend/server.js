const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

// Import blockchain components
const Blockchain = require('../blockchain/blockchain');
const Certificate = require('../blockchain/certificate');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize blockchain
const eduChain = new Blockchain();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Import routes
const authRoutes = require('./routes/auth');

// Mount routes
app.use('/api/auth', authRoutes);

// API Routes

// Get blockchain statistics
app.get('/api/stats', (req, res) => {
    try {
        const stats = eduChain.getBlockchainStats();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching blockchain statistics',
            error: error.message
        });
    }
});

// Get full blockchain for visualization
app.get('/api/blockchain', (req, res) => {
    try {
        const chain = eduChain.getFullChain();
        res.json({
            success: true,
            data: chain
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching blockchain',
            error: error.message
        });
    }
});

// Issue a new certificate
app.post('/api/certificates/issue', (req, res) => {
    try {
        const { studentName, institutionName, courseName, grade, issueDate } = req.body;

        // Validate required fields
        if (!studentName || !institutionName || !courseName || !grade || !issueDate) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required: studentName, institutionName, courseName, grade, issueDate'
            });
        }

        // Create new certificate
        const certificate = new Certificate(studentName, institutionName, courseName, grade, issueDate);
        
        // Add to blockchain
        const block = eduChain.addCertificate(certificate);

        res.json({
            success: true,
            message: 'Certificate issued successfully',
            data: {
                certificate: certificate.getFormattedCertificate(),
                block: block.getBlockInfo()
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error issuing certificate',
            error: error.message
        });
    }
});

// Verify a certificate by ID
app.get('/api/certificates/verify/:certificateId', (req, res) => {
    try {
        const { certificateId } = req.params;
        const verification = eduChain.verifyCertificate(certificateId);

        res.json({
            success: true,
            data: verification
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error verifying certificate',
            error: error.message
        });
    }
});

// Get certificate by ID
app.get('/api/certificates/:certificateId', (req, res) => {
    try {
        const { certificateId } = req.params;
        const result = eduChain.getCertificateById(certificateId);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not found'
            });
        }

        res.json({
            success: true,
            data: {
                certificate: result.certificate.getFormattedCertificate(),
                block: result.block,
                blockIndex: result.blockIndex
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching certificate',
            error: error.message
        });
    }
});

// Search certificates by student name
app.get('/api/certificates/student/:studentName', (req, res) => {
    try {
        const { studentName } = req.params;
        const certificates = eduChain.getCertificatesByStudent(studentName);

        res.json({
            success: true,
            data: certificates.map(cert => ({
                certificate: cert.certificate.getFormattedCertificate(),
                block: cert.block,
                blockIndex: cert.blockIndex
            }))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error searching certificates by student',
            error: error.message
        });
    }
});

// Search certificates by institution
app.get('/api/certificates/institution/:institutionName', (req, res) => {
    try {
        const { institutionName } = req.params;
        const certificates = eduChain.getCertificatesByInstitution(institutionName);

        res.json({
            success: true,
            data: certificates.map(cert => ({
                certificate: cert.certificate.getFormattedCertificate(),
                block: cert.block,
                blockIndex: cert.blockIndex
            }))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error searching certificates by institution',
            error: error.message
        });
    }
});

// Get all certificates
app.get('/api/certificates', (req, res) => {
    try {
        const certificates = eduChain.getAllCertificates();

        res.json({
            success: true,
            data: certificates.map(cert => ({
                certificate: cert.certificate.getFormattedCertificate(),
                block: cert.block,
                blockIndex: cert.blockIndex
            }))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching all certificates',
            error: error.message
        });
    }
});

// Validate blockchain integrity
app.get('/api/validate', (req, res) => {
    try {
        const isValid = eduChain.isChainValid();
        res.json({
            success: true,
            data: {
                isValid,
                message: isValid ? 'Blockchain is valid and secure' : 'Blockchain integrity compromised'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error validating blockchain',
            error: error.message
        });
    }
});

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 EduChain server running on http://localhost:${PORT}`);
    console.log(`📊 Blockchain initialized with ${eduChain.chain.length} blocks`);
    console.log(`🔗 API endpoints available at http://localhost:${PORT}/api/`);
});

module.exports = app;
