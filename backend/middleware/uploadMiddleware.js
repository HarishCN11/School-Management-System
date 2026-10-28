const fs = require('fs');
const path = require('path');
const multer = require('multer');

const isVercel = process.env.VERCEL === '1';

function createUploadMiddleware(fieldName, subdirectory = '') {
    const uploadDirectory = path.join(__dirname, '..', 'uploads', subdirectory);
    const storage = isVercel
        ? multer.memoryStorage()
        : multer.diskStorage({
            destination: (req, file, callback) => {
                fs.mkdirSync(uploadDirectory, { recursive: true });
                callback(null, uploadDirectory);
            },
            filename: (req, file, callback) => {
                callback(null, `${Date.now()}${path.extname(file.originalname)}`);
            }
        });
    const parseUpload = multer({ storage }).single(fieldName);

    return (req, res, next) => {
        parseUpload(req, res, async error => {
            if (error || !req.file) {
                return next(error);
            }

            if (!isVercel) {
                const publicDirectory = subdirectory
                    ? `${subdirectory.replace(/\\/g, '/')}/`
                    : '';
                req.file.url = `/uploads/${publicDirectory}${req.file.filename}`;
                return next();
            }

            if (!process.env.BLOB_READ_WRITE_TOKEN) {
                return next(new Error('BLOB_READ_WRITE_TOKEN is required for file uploads on Vercel.'));
            }

            try {
                const { put } = await import('@vercel/blob');
                const safeName = path.basename(req.file.originalname).replace(/[^\w.-]/g, '_');
                const blob = await put(
                    `${subdirectory}${Date.now()}-${safeName}`,
                    req.file.buffer,
                    {
                        access: 'public',
                        contentType: req.file.mimetype,
                        token: process.env.BLOB_READ_WRITE_TOKEN
                    }
                );
                req.file.url = blob.url;
                next();
            } catch (uploadError) {
                next(uploadError);
            }
        });
    };
}

module.exports = createUploadMiddleware;
