//presigned url for media upload cloudflare r2 controller

import { getPresignedUrl as getPresignedUrlService } from '../controllers/r2Controller.js';

export const getPresignedUrl = async (req, res) => {
    try {
        const { fileName, fileType } = req.query;

        if (!fileName || !fileType) {
            return res.status(400).json({ error: 'Missing fileName or fileType query parameters' });
        }

        const presignedUrl = await getPresignedUrlService(fileName, fileType);

        res.json({ presignedUrl });
    } catch (error) {
        console.error('Error generating presigned URL:', error);
        res.status(500).json({ error: 'Failed to generate presigned URL' });
    }
};