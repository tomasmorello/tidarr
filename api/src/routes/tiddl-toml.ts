import { Request, Response, Router } from "express";

import { ensureAccessIsGranted } from "../helpers/auth";
import {
  handleRouteError,
  handleValidationError,
} from "../helpers/error-handler";
import { validateRequestBody } from "../helpers/validation";
import { getTomlConfig, setTomlConfig } from "../services/tiddl-toml";
import { TiddlTomlResponse, TiddlTomlSaveResponse } from "../types";

const router = Router();

/**
 * @openapi
 * /api/tiddl/config:
 *   get:
 *     operationId: getTiddlConfig
 *     summary: Get Tiddl TOML configuration
 *     description: Returns the raw TOML content of the tiddl configuration file (config.toml).
 *     responses:
 *       200:
 *         description: Tiddl config
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TiddlTomlResponse'
 *   post:
 *     operationId: saveTiddlConfig
 *     summary: Save Tiddl TOML configuration
 *     description: Save the tiddl TOML configuration file content. This overwrites the entire config.toml file.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - toml
 *             properties:
 *               toml:
 *                 type: string
 *                 description: Raw TOML content to save
 *     responses:
 *       200:
 *         description: Config saved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SaveSuccessResponse'
 *       400:
 *         description: TOML content must be a string
 */
router.get(
  "/tiddl/config",
  ensureAccessIsGranted,
  (_req: Request, res: Response<TiddlTomlResponse>) => {
    try {
      const content = getTomlConfig();
      res.status(200).json(content);
    } catch (error) {
      handleRouteError(error, res, "read Tiddl config");
    }
  },
);

router.post(
  "/tiddl/config",
  ensureAccessIsGranted,
  validateRequestBody(["toml"]),
  (req: Request, res: Response<TiddlTomlSaveResponse>) => {
    try {
      const { toml } = req.body;

      if (typeof toml !== "string") {
        handleValidationError(res, "TOML content must be a string");
        return;
      }

      setTomlConfig(toml);
      res
        .status(200)
        .json({ success: true, message: "Tiddl config saved successfully" });
    } catch (error) {
      handleRouteError(error, res, "save Tiddl config");
    }
  },
);

export default router;
