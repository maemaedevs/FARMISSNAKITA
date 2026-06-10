import { env } from '../lib/env';

/**
 * OpenAPI 3.0 specification for the Farmis backend API.
 *
 * Every route mounted under `/api` in `src/app.ts` is documented here.
 * Served as interactive docs at `/api/docs` and as raw JSON at `/api/docs.json`.
 */
export const openapiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Farmis Backend API',
    version: '1.0.0',
    description:
      'REST API for the Farmis platform. Provides admin authentication, ' +
      'mobile OTP authentication, and admin management endpoints for ' +
      'farmers, system users, and assistance programs.',
  },
  servers: [
    {
      url: `http://localhost:${env.PORT}/api`,
      description: 'Local development server',
    },
    {
      url: '/api',
      description: 'Current host',
    },
  ],
  tags: [
    { name: 'Health', description: 'Service health checks' },
    { name: 'Auth', description: 'Admin and mobile authentication' },
    { name: 'Admin', description: 'Admin-only management endpoints (JWT required)' },
    { name: 'Mobile', description: 'Authenticated farmer (mobile app) endpoints' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'JWT issued by an auth endpoint. Send as `Authorization: Bearer <token>`.',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Invalid email or password' },
          details: {
            description: 'Optional error details (e.g. validation issues).',
            nullable: true,
          },
        },
        required: ['message'],
      },
      Health: {
        type: 'object',
        properties: {
          ok: { type: 'boolean', example: true },
        },
        required: ['ok'],
      },
      AdminLoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'admin@farmis.local',
          },
          password: {
            type: 'string',
            minLength: 6,
            example: 'admin123',
          },
        },
      },
      AdminUser: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'usr_admin_001' },
          name: { type: 'string', example: 'Farmis Admin' },
          email: { type: 'string', format: 'email', example: 'admin@farmis.local' },
          role: { type: 'string', enum: ['admin'], example: 'admin' },
          createdAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'name', 'email', 'role', 'createdAt'],
      },
      AdminLoginResponse: {
        type: 'object',
        properties: {
          token: { type: 'string', description: 'JWT bearer token.' },
          user: { $ref: '#/components/schemas/AdminUser' },
        },
        required: ['token', 'user'],
      },
      RegisterAdminRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'Jane Dela Cruz' },
          email: {
            type: 'string',
            format: 'email',
            example: 'jane@farmis.local',
          },
          password: {
            type: 'string',
            minLength: 6,
            example: 'securePass123',
          },
        },
      },
      RegisterAdminResponse: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['admin'], example: 'admin' },
          status: { type: 'string', enum: ['active', 'inactive'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'name', 'email', 'role', 'status', 'createdAt'],
      },
      RequestOtpRequest: {
        type: 'object',
        required: ['phoneNumber'],
        properties: {
          phoneNumber: {
            type: 'string',
            minLength: 7,
            example: '+639171234567',
          },
        },
      },
      RequestOtpResponse: {
        type: 'object',
        properties: {
          ok: { type: 'boolean', example: true },
        },
        required: ['ok'],
      },
      VerifyOtpRequest: {
        type: 'object',
        required: ['phoneNumber', 'otp'],
        properties: {
          phoneNumber: {
            type: 'string',
            minLength: 7,
            example: '+639171234567',
          },
          otp: {
            type: 'string',
            minLength: 4,
            example: '1234',
          },
        },
      },
      MobileUser: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'mobile_639171234567' },
          phoneNumber: { type: 'string', example: '639171234567' },
        },
        required: ['id', 'phoneNumber'],
      },
      MobileLoginRequest: {
        type: 'object',
        required: ['farmerId', 'password'],
        properties: {
          farmerId: {
            type: 'string',
            description:
              'The Farmer ID issued when the farmer is registered in the admin app ' +
              '(farmerCode such as FARM-0001, or the registryId).',
            example: 'FARM-0001',
          },
          password: {
            type: 'string',
            minLength: 6,
            description: 'Mobile login password generated by an admin for this farmer.',
            example: 'farmer123',
          },
        },
      },
      MobileFarmerUser: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          farmerCode: { type: 'string', example: 'FARM-0001' },
          name: { type: 'string', example: 'Juan Dela Cruz' },
          barangay: { type: 'string', example: 'San Isidro' },
          contactNumber: { type: 'string', example: '0917 123 4567' },
          status: { type: 'string', enum: ['active', 'inactive'] },
        },
        required: ['id', 'farmerCode', 'name', 'barangay', 'contactNumber', 'status'],
      },
      MobileLoginResponse: {
        type: 'object',
        properties: {
          token: { type: 'string', description: 'JWT bearer token (client role).' },
          user: { $ref: '#/components/schemas/MobileFarmerUser' },
        },
        required: ['token', 'user'],
      },
      MobileProfile: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          farmerCode: { type: 'string', example: 'FARM-0001' },
          registryId: { type: 'string', example: 'REG-2025-0001' },
          name: { type: 'string' },
          barangay: { type: 'string' },
          status: { type: 'string', enum: ['active', 'inactive'] },
          email: { type: 'string', format: 'email' },
          age: { type: 'integer' },
          gender: { type: 'string' },
          birthday: { type: 'string' },
          placeOfBirth: { type: 'string' },
          nationality: { type: 'string' },
          occupation: { type: 'string' },
          education: { type: 'string' },
          contactNumber: { type: 'string' },
          alternativeContact: { type: 'string' },
          address: { type: 'string' },
          primaryIncome: { type: 'string' },
          mainCrop: { type: 'string' },
          primaryCrops: { type: 'array', items: { type: 'string' } },
          farmingExperienceYears: { type: 'integer' },
          farmingType: { type: 'string' },
          farmAreaHa: { type: 'number' },
          householdSize: { type: 'integer' },
          registeredBeneficiary: { type: 'boolean' },
          organization: { type: 'string' },
        },
      },
      UpdateMobileProfileRequest: {
        type: 'object',
        description: 'Fields the authenticated farmer may update on their own profile.',
        properties: {
          name: { type: 'string' },
          contactNumber: { type: 'string' },
          email: { type: 'string', format: 'email' },
          alternativeContact: { type: 'string' },
          address: { type: 'string' },
          age: { type: 'integer', minimum: 0 },
          gender: { type: 'string' },
          birthday: { type: 'string' },
          placeOfBirth: { type: 'string' },
          nationality: { type: 'string' },
          occupation: { type: 'string' },
          education: { type: 'string' },
          householdSize: { type: 'integer', minimum: 0 },
          primaryIncome: { type: 'string' },
          organization: { type: 'string' },
          mainCrop: { type: 'string' },
          farmingExperienceYears: { type: 'integer', minimum: 0 },
          farmingType: { type: 'string' },
          farmAreaHa: { type: 'number', minimum: 0 },
        },
      },
      ChangeMobilePasswordRequest: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: { type: 'string', minLength: 6 },
          newPassword: { type: 'string', minLength: 6 },
        },
      },
      GenerateFarmerPasswordResponse: {
        type: 'object',
        properties: {
          farmerCode: { type: 'string', example: 'FARM-0001' },
          registryId: { type: 'string', example: 'REG-2025-0001' },
          name: { type: 'string' },
          password: {
            type: 'string',
            description: 'Plain-text password shown once. Share it securely with the farmer.',
          },
          hasPassword: { type: 'boolean', example: true },
        },
        required: ['farmerCode', 'registryId', 'name', 'password', 'hasPassword'],
      },
      VerifyOtpResponse: {
        type: 'object',
        properties: {
          token: { type: 'string', description: 'JWT bearer token.' },
          user: { $ref: '#/components/schemas/MobileUser' },
        },
        required: ['token', 'user'],
      },
      FarmerListItem: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          farmerCode: { type: 'string' },
          name: { type: 'string' },
          contactNumber: { type: 'string' },
          barangay: { type: 'string' },
          farmAreaHa: { type: 'number' },
          primaryCrops: { type: 'array', items: { type: 'string' } },
          status: { type: 'string', enum: ['active', 'inactive'] },
          registeredAt: { type: 'string', format: 'date-time' },
        },
      },
      FarmerDetail: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          farmerCode: { type: 'string' },
          registryId: { type: 'string' },
          name: { type: 'string' },
          contactNumber: { type: 'string' },
          email: { type: 'string' },
          barangay: { type: 'string' },
          farmAreaHa: { type: 'number' },
          primaryCrops: { type: 'array', items: { type: 'string' } },
          status: { type: 'string', enum: ['active', 'inactive'] },
          registeredAt: { type: 'string', format: 'date-time' },
          address: { type: 'string' },
          age: { type: 'integer' },
          gender: { type: 'string' },
          civilStatus: { type: 'string' },
          birthday: { type: 'string' },
          placeOfBirth: { type: 'string' },
          nationality: { type: 'string' },
          occupation: { type: 'string' },
          education: { type: 'string' },
          householdSize: { type: 'integer' },
          primaryIncome: { type: 'string' },
          farmingExperienceYears: { type: 'integer' },
          mainCrop: { type: 'string' },
          otherCrops: { type: 'string' },
          livestock: { type: 'string' },
          farmingType: { type: 'string' },
          farmSizeHa: { type: 'number' },
          landLocation: { type: 'string' },
          coordinates: { type: 'string' },
          landType: { type: 'string' },
          titleNo: { type: 'string' },
          verifiedBy: { type: 'string' },
          verifiedAt: { type: 'string', format: 'date-time' },
          notes: { type: 'string' },
          hasPassword: {
            type: 'boolean',
            description: 'Whether a mobile login password has been generated for this farmer.',
          },
          landDocuments: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                status: { type: 'string' },
                uploadedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
      SystemUser: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userCode: { type: 'string' },
          name: { type: 'string' },
          username: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: {
            type: 'string',
            enum: [
              'municipal-agriculturist',
              'barangay-official',
              'encoder',
              'viewer',
              'data-verifier',
              'agriculture-officer',
            ],
          },
          status: { type: 'string', enum: ['active', 'inactive'] },
          lastLoginAt: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      AssistanceProgram: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          programCode: { type: 'string' },
          name: { type: 'string' },
          tagline: { type: 'string' },
          programType: {
            type: 'string',
            enum: [
              'Input Support',
              'Production Support',
              'Livestock',
              'Infrastructure',
            ],
          },
          description: { type: 'string' },
          targetBeneficiaries: { type: 'integer' },
          fundingSource: { type: 'string' },
          status: { type: 'string', enum: ['active', 'inactive'] },
          addedAt: { type: 'string', format: 'date-time' },
          icon: { type: 'string' },
        },
      },
      PaginatedFarmers: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/FarmerListItem' },
          },
          page: { type: 'integer', example: 1 },
          pageSize: { type: 'integer', example: 10 },
          total: { type: 'integer', example: 42 },
        },
        required: ['data', 'page', 'pageSize', 'total'],
      },
      CreateFarmerRequest: {
        type: 'object',
        required: ['name', 'contactNumber', 'barangay', 'farmAreaHa'],
        description:
          'Core fields are required; farmerCode and registryId are auto-generated. ' +
          'Extended profile fields are optional and default to empty values.',
        properties: {
          name: { type: 'string', example: 'Juan Dela Cruz' },
          contactNumber: { type: 'string', example: '0917 123 4567' },
          barangay: { type: 'string', example: 'San Isidro' },
          farmAreaHa: { type: 'number', minimum: 0, example: 1.5 },
          primaryCrops: {
            type: 'array',
            items: { type: 'string' },
            example: ['Rice', 'Corn'],
          },
          status: {
            type: 'string',
            enum: ['active', 'inactive'],
            default: 'active',
          },
          email: { type: 'string', format: 'email', example: 'juan@farmis.local' },
          address: { type: 'string' },
          age: { type: 'integer', minimum: 0 },
          gender: { type: 'string' },
          civilStatus: { type: 'string' },
          birthday: { type: 'string', example: '1981-05-12' },
          placeOfBirth: { type: 'string' },
          nationality: { type: 'string' },
          occupation: { type: 'string' },
          education: { type: 'string' },
          householdSize: { type: 'integer', minimum: 0 },
          primaryIncome: { type: 'string' },
          farmingExperienceYears: { type: 'integer', minimum: 0 },
          mainCrop: { type: 'string' },
          otherCrops: { type: 'string' },
          livestock: { type: 'string' },
          farmingType: { type: 'string' },
          farmSizeHa: { type: 'number', minimum: 0 },
          landLocation: { type: 'string' },
          coordinates: { type: 'string' },
          landType: { type: 'string' },
          titleNo: { type: 'string' },
          notes: { type: 'string' },
        },
      },
      PaginatedSystemUsers: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/SystemUser' },
          },
          page: { type: 'integer', example: 1 },
          pageSize: { type: 'integer', example: 10 },
          total: { type: 'integer', example: 12 },
        },
        required: ['data', 'page', 'pageSize', 'total'],
      },
      PaginatedPrograms: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/AssistanceProgram' },
          },
          page: { type: 'integer', example: 1 },
          pageSize: { type: 'integer', example: 10 },
          total: { type: 'integer', example: 8 },
        },
        required: ['data', 'page', 'pageSize', 'total'],
      },
    },
    parameters: {
      PageParam: {
        name: 'page',
        in: 'query',
        required: false,
        schema: { type: 'integer', minimum: 1, default: 1 },
        description: 'Page number (1-indexed).',
      },
      PageSizeParam: {
        name: 'pageSize',
        in: 'query',
        required: false,
        schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
        description: 'Items per page (max 100).',
      },
      QueryParam: {
        name: 'query',
        in: 'query',
        required: false,
        schema: { type: 'string' },
        description: 'Free-text search filter.',
      },
    },
    responses: {
      Unauthorized: {
        description: 'Missing, invalid, or expired authentication token.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      Forbidden: {
        description: 'Authenticated but not permitted to access this resource.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      BadRequest: {
        description: 'Invalid request payload or query parameters.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      NotFound: {
        description: 'Resource not found.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        description: 'Returns a simple liveness payload.',
        security: [],
        responses: {
          200: {
            description: 'Service is up.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Health' },
              },
            },
          },
        },
      },
    },
    '/auth/admin/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new admin user',
        description:
          'Creates a new admin account. Public endpoint (no authentication required).',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterAdminRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Admin user created.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegisterAdminResponse' },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          409: {
            description: 'An admin with this email already exists.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/auth/admin/login': {
      post: {
        tags: ['Auth'],
        summary: 'Admin login',
        description:
          'Authenticate an admin user with email and password. Returns a JWT bearer token.',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AdminLoginRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AdminLoginResponse' },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/auth/mobile/login': {
      post: {
        tags: ['Auth'],
        summary: 'Mobile login with Farmer ID and password',
        description:
          'Authenticates a farmer using the Farmer ID and password generated by an admin. ' +
          'Returns a JWT bearer token (client role) and the farmer profile.',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MobileLoginRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MobileLoginResponse' },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: {
            description: 'Invalid Farmer ID.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/auth/mobile/request-otp': {
      post: {
        tags: ['Auth'],
        summary: 'Request mobile OTP',
        description:
          'Sends a one-time passcode to the given phone number (delivered via SMS, or logged to console in dev). Rate-limited per phone/IP.',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RequestOtpRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'OTP request accepted.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RequestOtpResponse' },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          429: {
            description: 'Too many OTP requests. Try again later.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/auth/mobile/verify-otp': {
      post: {
        tags: ['Auth'],
        summary: 'Verify mobile OTP',
        description:
          'Verifies the OTP for a phone number and returns a JWT bearer token plus the mobile user.',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/VerifyOtpRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'OTP verified, session issued.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/VerifyOtpResponse' },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          429: {
            description: 'OTP attempt limit reached.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/mobile/profile': {
      get: {
        tags: ['Mobile'],
        summary: 'Get my farmer profile',
        description:
          'Returns the profile of the currently authenticated farmer (mobile client token).',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Farmer profile.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MobileProfile' },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['Mobile'],
        summary: 'Update my farmer profile',
        description:
          'Allows the authenticated farmer to update their own profile information.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateMobileProfileRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Updated farmer profile.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MobileProfile' },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/mobile/password': {
      patch: {
        tags: ['Mobile'],
        summary: 'Change my mobile login password',
        description:
          'Allows the authenticated farmer to change their mobile login password.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ChangeMobilePasswordRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Password updated.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { ok: { type: 'boolean', example: true } },
                  required: ['ok'],
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/admin/farmers': {
      get: {
        tags: ['Admin'],
        summary: 'List farmers',
        description: 'Returns a paginated list of farmers with optional filters.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/PageParam' },
          { $ref: '#/components/parameters/PageSizeParam' },
          { $ref: '#/components/parameters/QueryParam' },
          {
            name: 'status',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['active', 'inactive'] },
            description: 'Filter by farmer status.',
          },
          {
            name: 'barangay',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Filter by barangay. Use "all" to disable the filter.',
          },
        ],
        responses: {
          200: {
            description: 'Paginated farmers.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaginatedFarmers' },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
      post: {
        tags: ['Admin'],
        summary: 'Register a new farmer',
        description:
          'Creates a new farmer. farmerCode and registryId are auto-generated by the server.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateFarmerRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Farmer created.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/FarmerListItem' },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/admin/farmers/{id}': {
      get: {
        tags: ['Admin'],
        summary: 'Get farmer detail',
        description: 'Returns the full profile for a single farmer, including land documents.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Farmer ID.',
          },
        ],
        responses: {
          200: {
            description: 'Farmer detail.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/FarmerDetail' },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/admin/farmers/{id}/generate-password': {
      post: {
        tags: ['Admin'],
        summary: 'Generate mobile login password',
        description:
          'Generates a new random password for the farmer mobile app. ' +
          'The plain-text password is returned once and replaces any previous password.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Farmer ID.',
          },
        ],
        responses: {
          200: {
            description: 'Generated password.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/GenerateFarmerPasswordResponse' },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/admin/users': {
      get: {
        tags: ['Admin'],
        summary: 'List system users',
        description: 'Returns a paginated list of system (admin-side) users with optional filters.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/PageParam' },
          { $ref: '#/components/parameters/PageSizeParam' },
          { $ref: '#/components/parameters/QueryParam' },
          {
            name: 'role',
            in: 'query',
            required: false,
            schema: {
              type: 'string',
              enum: [
                'municipal-agriculturist',
                'barangay-official',
                'encoder',
                'viewer',
                'data-verifier',
                'agriculture-officer',
              ],
            },
            description: 'Filter by role.',
          },
          {
            name: 'status',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['active', 'inactive'] },
            description: 'Filter by status.',
          },
        ],
        responses: {
          200: {
            description: 'Paginated system users.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaginatedSystemUsers' },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/admin/programs': {
      get: {
        tags: ['Admin'],
        summary: 'List assistance programs',
        description: 'Returns a paginated list of assistance programs with optional filters.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/PageParam' },
          { $ref: '#/components/parameters/PageSizeParam' },
          { $ref: '#/components/parameters/QueryParam' },
          {
            name: 'programType',
            in: 'query',
            required: false,
            schema: {
              type: 'string',
              enum: [
                'Input Support',
                'Production Support',
                'Livestock',
                'Infrastructure',
              ],
            },
            description: 'Filter by program type.',
          },
          {
            name: 'status',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['active', 'inactive'] },
            description: 'Filter by status.',
          },
        ],
        responses: {
          200: {
            description: 'Paginated programs.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaginatedPrograms' },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
  },
} as const;
