# EduChain - Blockchain-based Certificate Verification System

EduChain is a secure and decentralized certificate verification system built on blockchain technology. The system enables educational institutions to issue digital certificates and allows stakeholders to verify their authenticity using blockchain.

## Features

### Blockchain Core
- Custom blockchain implementation with proof-of-work consensus
- Secure certificate storage and validation
- Immutable record of all issued certificates
- Real-time chain integrity verification

### Backend System
- RESTful API endpoints for all certificate operations
- JWT-based authentication and authorization
- MongoDB integration for user data storage
- Winston logger for system monitoring
- PDF certificate generation using PDFKit
- Comprehensive error handling and validation

### Frontend Interface
- Modern, responsive UI built with React and Material-UI
- Certificate issuance form with validation
- Certificate verification portal
- Blockchain explorer
- Search functionality by student/institution
- Real-time blockchain statistics

### Security Features
- JWT authentication
- API rate limiting
- Helmet security headers
- Input validation and sanitization
- Secure data storage and transmission
- Protection against common web vulnerabilities

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/educhain.git
cd educhain
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
cd ..
```

4. Create a `.env` file in the root directory with the following variables:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/educhain
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## Running the Application

1. Start the MongoDB server:
```bash
mongod
```

2. Start the backend server:
```bash
npm run dev
```

3. Start the frontend development server:
```bash
npm run client
```

4. For running both frontend and backend concurrently:
```bash
npm run dev:full
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user

### Certificates
- POST `/api/certificates/issue` - Issue a new certificate
- GET `/api/certificates/verify/:certificateId` - Verify a certificate
- GET `/api/certificates/:certificateId` - Get certificate by ID
- GET `/api/certificates/student/:studentName` - Search certificates by student
- GET `/api/certificates/institution/:institutionName` - Search by institution
- GET `/api/certificates` - Get all certificates

### Blockchain
- GET `/api/stats` - Get blockchain statistics
- GET `/api/blockchain` - Get full blockchain
- GET `/api/validate` - Validate blockchain integrity

## Project Structure

```
educhain/
├── backend/
│   ├── config/         # Database configuration
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── utils/          # Utility functions
│   └── server.js       # Server entry point
├── blockchain/
│   ├── block.js        # Block implementation
│   ├── blockchain.js   # Blockchain logic
│   └── certificate.js  # Certificate model
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── styles/
│   │   └── App.js
│   └── package.json
└── package.json
```

## Testing

Run the test suite:
```bash
npm test
```

## Security Considerations

1. Always use HTTPS in production
2. Keep your JWT secret secure
3. Implement proper access control
4. Regular security audits
5. Monitor system logs
6. Keep dependencies updated

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with Node.js and React
- Uses MongoDB for data storage
- Implements blockchain technology for certificate verification
- Material-UI for frontend components
- PDFKit for certificate generation
