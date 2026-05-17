const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const documentRoutes = require('./routes/documentRoutes');
const matchRoutes = require('./routes/matchRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Swagger Configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Three-Way Match Engine API',
      version: '1.0.0',
      description: 'API for matching Purchase Orders, GRNs, and Invoices',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/documents', documentRoutes);
app.use('/api/match', matchRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Three-Way Match Engine API is running' });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
