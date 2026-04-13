import { Request, Response, Router } from "express";

import { ensureAccessIsGranted } from "../helpers/auth";
import { handleRouteError } from "../helpers/error-handler";
import { get_tiddl_config } from "../helpers/get_tiddl_config";
import { deleteTiddlConfig, tidalToken } from "../services/tiddl";
import { SettingsResponse } from "../types";

const router = Router();

/**
 * @openapi
 * /api/settings:
 *   get:
 *     operationId: getSettings
 *     summary: Get Tidarr configuration
 *     description: Returns the full Tidarr configuration including Tidal token status, download quality, integration settings, and tiddl config.
 *     responses:
 *       200:
 *         description: Settings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SettingsResponse'
 */
router.get(
  "/settings",
  ensureAccessIsGranted,
  (_req: Request, res: Response<SettingsResponse>) => {
    try {
      // Force reload config from disk to detect config.toml changes
      // This ensures we always have the latest download path and quality settings
      const { config: tiddl_config, errors: configErrors } = get_tiddl_config();

      // Update app.locals with fresh config
      res.app.locals.tiddlConfig = tiddl_config;

      res.status(200).json({
        ...res.app.locals.config,
        noToken:
          !tiddl_config?.auth?.token || tiddl_config?.auth?.token?.length === 0,
        tiddl_config: tiddl_config,
        configErrors: configErrors.length > 0 ? configErrors : undefined,
      });
    } catch (error) {
      handleRouteError(error, res, "get settings");
    }
  },
);

/**
 * @openapi
 * /api/run-token:
 *   get:
 *     operationId: runTidalToken
 *     summary: Run Tidal authentication flow
 *     description: Server-Sent Events endpoint that runs the Tidal OAuth flow. Streams progress updates.
 *     responses:
 *       200:
 *         description: SSE stream with Tidal authentication progress
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 */
router.get(
  "/run-token",
  ensureAccessIsGranted,
  async (req: Request, res: Response) => {
    try {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();
      await tidalToken(req, res);
    } catch (error) {
      handleRouteError(error, res, "run token authentication");
    }
  },
);

/**
 * @openapi
 * /api/token:
 *   delete:
 *     operationId: deleteTidalToken
 *     summary: Delete Tidal authentication token
 *     description: Removes the Tidal authentication token from the tiddl configuration.
 *     responses:
 *       204:
 *         description: Token deleted
 */
router.delete(
  "/token",
  ensureAccessIsGranted,
  (_req: Request, res: Response) => {
    try {
      deleteTiddlConfig();
      // Reload config after deleting token (will have no auth now)
      const { config: freshConfig } = get_tiddl_config();
      res.app.locals.tiddlConfig = freshConfig;
      res.sendStatus(204);
    } catch (error) {
      handleRouteError(error, res, "delete token");
    }
  },
);

export default router;
