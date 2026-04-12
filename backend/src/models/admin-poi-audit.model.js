const mongoose = require('mongoose');

const ADMIN_POI_AUDIT_ACTION = Object.freeze({
    APPROVE: 'APPROVE',
    REJECT: 'REJECT'
});

const adminPoiAuditSchema = new mongoose.Schema({
    poiId: { type: mongoose.Schema.Types.ObjectId, ref: 'Poi', required: true, index: true },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: {
        type: String,
        enum: Object.values(ADMIN_POI_AUDIT_ACTION),
        required: true
    },
    previousStatus: { type: String },
    newStatus: { type: String },
    reason: { type: String }
}, {
    timestamps: true
});

adminPoiAuditSchema.index({ createdAt: -1 });

const AdminPoiAudit = mongoose.model('AdminPoiAudit', adminPoiAuditSchema);
AdminPoiAudit.ACTION = ADMIN_POI_AUDIT_ACTION;

module.exports = AdminPoiAudit;
