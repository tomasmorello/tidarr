import { Request, Response, Router } from "express";

import { ensureAccessIsGranted } from "../helpers/auth";
import {
  handleRouteError,
  handleValidationError,
} from "../helpers/error-handler";
import { validateRequestBody } from "../helpers/validation";
import { CustomCSSResponse, CustomCSSSaveResponse } from "../types";

import { getCustomCSS, setCustomCSS } from "../services/custom-css";

const router = Router();

/**
 * @openapi
 * /api/custom-css:
 *   get:
 *     operationId: getCustomCss
 *     summary: Get custom CSS
 *     description: Returns the custom CSS content used to style the Tidarr web UI.
 *     responses:
 *       200:
 *         description: Custom CSS content
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomCSSResponse'
 *   post:
 *     operationId: saveCustomCss
 *     summary: Save custom CSS
 *     description: Save custom CSS content to style the Tidarr web UI.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - css
 *             properties:
 *               css:
 *                 type: string
 *                 description: CSS content
 *     responses:
 *       200:
 *         description: CSS saved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SaveSuccessResponse'
 *       400:
 *         description: CSS content must be a string
 */
router.get(
  "/custom-css",
  ensureAccessIsGranted,
  (_req: Request, res: Response<CustomCSSResponse>) => {
    try {
      const cssContent = getCustomCSS();
      res.status(200).json(cssContent);
    } catch (error) {
      handleRouteError(error, res, "read custom CSS");
    }
  },
);

router.post(
  "/custom-css",
  ensureAccessIsGranted,
  validateRequestBody(["css"]),
  (req: Request, res: Response<CustomCSSSaveResponse>) => {
    try {
      const { css } = req.body;

      if (typeof css !== "string") {
        handleValidationError(res, "CSS content must be a string");
        return;
      }

      setCustomCSS(css);
      res
        .status(200)
        .json({ success: true, message: "Custom CSS saved successfully" });
    } catch (error) {
      handleRouteError(error, res, "save custom CSS");
    }
  },
);

export default router;
