const adminPoiAuditService = require('../services/admin-poi-audit.service');

exports.list = async (req, res, next) => {
    try {
        const { page, limit } = req.query;
        const result = await adminPoiAuditService.listAudits(page, limit);
        res.status(200).json({
            success: true,
            data: result.items,
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
};
