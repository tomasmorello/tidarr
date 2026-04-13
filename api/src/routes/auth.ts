import { Request, Response, Router } from "express";

import { validateRequestBody } from "../helpers/validation";
import { get_auth_type, is_auth_active, proceed_auth } from "../services/auth";
import { AuthResponse, IsAuthActiveResponse } from "../types";

const router = Router();

/**
 * @openapi
 * /api/auth:
 *   post:
 *     operationId: authenticate
 *     summary: Authenticate with password
 *     description: Authenticate with the admin password and receive a JWT token valid for 12 hours.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 description: The ADMIN_PASSWORD configured in Docker
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthSuccessResponse'
 *       401:
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthErrorResponse'
 */
router.post(
  "/auth",
  validateRequestBody(["password"]),
  async (req: Request, res: Response<AuthResponse>) => {
    await proceed_auth(req.body.password, res);
  },
);

/**
 * @openapi
 * /api/is-auth-active:
 *   get:
 *     operationId: getAuthStatus
 *     summary: Check if authentication is enabled
 *     description: Returns whether authentication is active and which method is configured. This endpoint does NOT require authentication.
 *     security: []
 *     responses:
 *       200:
 *         description: Auth status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IsAuthActiveResponse'
 */
router.get(
  "/is-auth-active",
  (_req: Request, res: Response<IsAuthActiveResponse>) => {
    res.status(200).json({
      isAuthActive: is_auth_active(),
      authType: get_auth_type(),
    });
  },
);

export default router;
