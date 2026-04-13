import { Request, Response, Router } from "express";

import { ensureAccessIsGranted } from "../helpers/auth";
import { handleRouteError } from "../helpers/error-handler";
import { getOrCreateApiKey, regenerateApiKey } from "../services/api-key";

const router = Router();

/**
 * @openapi
 * /api/api-key:
 *   get:
 *     operationId: getApiKey
 *     summary: Get current API key
 *     description: Returns the current API key used for *arr integrations. Requires JWT authentication.
 *     responses:
 *       200:
 *         description: API key
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiKeyResponse'
 */
router.get(
  "/api-key",
  ensureAccessIsGranted,
  (_req: Request, res: Response) => {
    try {
      const apiKey = getOrCreateApiKey();

      res.status(200).json({
        apiKey,
      });
    } catch (error) {
      handleRouteError(error, res, "get API key");
    }
  },
);

/**
 * @openapi
 * /api/api-key/regenerate:
 *   post:
 *     operationId: regenerateApiKey
 *     summary: Regenerate API key
 *     description: Generate a new random 64-character API key. Warning - this invalidates the current key.
 *     responses:
 *       200:
 *         description: New API key
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiKeyResponse'
 */
router.post(
  "/api-key/regenerate",
  ensureAccessIsGranted,
  (_req: Request, res: Response) => {
    try {
      const newApiKey = regenerateApiKey();
      res.status(200).json({
        apiKey: newApiKey,
      });
    } catch (error) {
      handleRouteError(error, res, "regenerate API key");
    }
  },
);

export default router;
