import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Document Management System API',
      version: '1.0.0',
      description: 'Complete API documentation for DMS - Authentication, Documents, Versions, Permissions, Tags, Users',
      contact: {
        name: 'DMS API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://api.production.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from login endpoint',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Error message',
            },
            code: {
              type: 'string',
              example: 'ERROR_CODE',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            firstName: {
              type: 'string',
              example: 'John',
            },
            lastName: {
              type: 'string',
              example: 'Doe',
            },
            role: {
              type: 'string',
              enum: ['admin', 'editor', 'viewer'],
              example: 'editor',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Document: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            title: {
              type: 'string',
              example: 'Q4 Report 2024',
            },
            description: {
              type: 'string',
              example: 'Financial report for Q4',
            },
            originalFilename: {
              type: 'string',
              example: 'report.pdf',
            },
            storageKey: {
              type: 'string',
              example: 'abc-123-def.pdf',
            },
            mimeType: {
              type: 'string',
              example: 'application/pdf',
            },
            size: {
              type: 'number',
              example: 1024000,
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: ['finance', 'important'],
            },
            ownerId: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            acl: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  userId: {
                    type: 'string',
                  },
                  access: {
                    type: 'string',
                    enum: ['viewer', 'editor'],
                  },
                },
              },
            },
            currentVersion: {
              type: 'number',
              example: 1,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Version: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
            },
            documentId: {
              type: 'string',
            },
            versionNumber: {
              type: 'number',
              example: 2,
            },
            storageKey: {
              type: 'string',
            },
            uploadedBy: {
              type: 'string',
            },
            changeLog: {
              type: 'string',
              example: 'Updated financial figures',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'DMS API Documentation',
  }));
  
  // JSON endpoint for spec
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};
