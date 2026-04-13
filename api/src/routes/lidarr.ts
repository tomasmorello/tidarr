import express, { Request, Response, Router } from "express";

import { ensureAccessIsGranted } from "../helpers/auth";
import { handleRouteError } from "../helpers/error-handler";
import {
  handleAddUrlRequest,
  handleHistoryRequest,
  handleQueueRequest,
} from "../lidarr/downloader";
import {
  handleCapsRequest,
  handleDownloadFromLidarr,
  handleSearchRequest,
} from "../lidarr/indexer";
import {
  handleGetConfigRequest,
  handleVersionRequest,
} from "../lidarr/utils/nzb";

const router = Router();

/**
 * @openapi
 * /api/lidarr:
 *   get:
 *     operationId: lidarrIndexer
 *     summary: Newznab indexer API for Lidarr
 *     description: "Implements the Newznab protocol for Lidarr integration. Supports capabilities (t=caps), search (t=search), and music search (t=music)."
 *     parameters:
 *       - name: t
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           enum:
 *             - caps
 *             - search
 *             - music
 *         description: "Request type: caps (capabilities), search (general search), music (artist+album search)"
 *       - name: q
 *         in: query
 *         schema:
 *           type: string
 *         description: Search query (for t=search)
 *       - name: artist
 *         in: query
 *         schema:
 *           type: string
 *         description: Artist name (for t=music)
 *       - name: album
 *         in: query
 *         schema:
 *           type: string
 *         description: Album name (for t=music)
 *     responses:
 *       200:
 *         description: Newznab XML response with capabilities or search results
 *         content:
 *           application/xml:
 *             schema:
 *               type: string
 */
router.get(
  "/lidarr",
  ensureAccessIsGranted,
  async (req: Request, res: Response) => {
    try {
      const { t, q, artist, album } = req.query;

      // Handle capabilities request (t=caps)
      if (t === "caps") {
        return handleCapsRequest(req, res);
      }

      // Handle search requests (t=search or t=music)
      return await handleSearchRequest(req, res, {
        q: q as string,
        artist: artist as string,
        album: album as string,
      });
    } catch (error) {
      handleRouteError(error, res, "Lidarr indexer request");
    }
  },
);

/**
 * @openapi
 * /api/lidarr/download/{id}/{quality}:
 *   get:
 *     operationId: lidarrDownload
 *     summary: Download album via Lidarr
 *     description: Called by Lidarr when grabbing an album. Returns an NZB file that triggers the download. Quality values come from the indexer search results.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Tidal album ID
 *       - name: quality
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           enum:
 *             - hires_lossless
 *             - lossless
 *             - high
 *             - low
 *         description: Download quality as returned by the indexer
 *     responses:
 *       200:
 *         description: NZB file
 *         content:
 *           application/x-nzb:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get(
  "/lidarr/download/:id/:quality",
  ensureAccessIsGranted,
  async (req: Request, res: Response) => {
    try {
      const { id, quality } = req.params;
      handleDownloadFromLidarr(id, res, quality);
    } catch (error) {
      handleRouteError(error, res, "Lidarr download");
    }
  },
);

/**
 * SABnzbd API handler - shared by GET and POST
 */
const handleSabnzbdRequest = async (req: Request, res: Response) => {
  try {
    const { mode } = req.query;

    switch (mode) {
      case "version":
        return handleVersionRequest(req, res);

      case "get_config":
        return handleGetConfigRequest(req, res);

      case "addurl":
      case "addfile":
        return await handleAddUrlRequest(req, res);

      case "queue":
        return handleQueueRequest(req, res);

      case "history":
        return handleHistoryRequest(req, res);

      default:
        return res.status(400).json({
          error:
            "Invalid mode. Supported: version, get_config, addurl, addfile, queue, history",
        });
    }
  } catch (error) {
    handleRouteError(error, res, "SABnzbd API");
  }
};

/**
 * @openapi
 * /api/sabnzbd/api:
 *   get:
 *     operationId: sabnzbdApiGet
 *     summary: SABnzbd-compatible download client API (GET)
 *     description: "SABnzbd-compatible API for Lidarr integration. Supports modes: version, get_config, addurl, queue, history."
 *     parameters:
 *       - name: mode
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           enum:
 *             - version
 *             - get_config
 *             - addurl
 *             - addfile
 *             - queue
 *             - history
 *         description: SABnzbd API mode
 *       - name: name
 *         in: query
 *         schema:
 *           type: string
 *         description: "URL to add (for mode=addurl) or action name like 'delete' (for mode=queue/history)"
 *       - name: value
 *         in: query
 *         schema:
 *           type: string
 *         description: "nzo_id to delete (for mode=queue&name=delete or mode=history&name=delete)"
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *         description: Number of history items to return (for mode=history)
 *     responses:
 *       200:
 *         description: Response varies by mode
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/SabnzbdVersionResponse'
 *                 - $ref: '#/components/schemas/SabnzbdGetConfigResponse'
 *                 - $ref: '#/components/schemas/SabnzbdAddResponse'
 *                 - $ref: '#/components/schemas/SabnzbdQueueResponse'
 *                 - $ref: '#/components/schemas/SabnzbdHistoryResponse'
 *   post:
 *     operationId: sabnzbdApiPost
 *     summary: SABnzbd-compatible download client API (POST)
 *     description: Supports all SABnzbd modes via POST. Primarily used by Lidarr to upload NZB files (mode=addfile) with multipart/form-data.
 *     parameters:
 *       - name: mode
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           enum:
 *             - version
 *             - get_config
 *             - addurl
 *             - addfile
 *             - queue
 *             - history
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 format: binary
 *                 description: NZB file
 *     responses:
 *       200:
 *         description: File added
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SabnzbdAddResponse'
 */
router.get("/sabnzbd/api", ensureAccessIsGranted, handleSabnzbdRequest);

router.post(
  "/sabnzbd/api",
  express.raw({ type: "multipart/form-data", limit: "10mb" }),
  ensureAccessIsGranted,
  handleSabnzbdRequest,
);

export default router;
