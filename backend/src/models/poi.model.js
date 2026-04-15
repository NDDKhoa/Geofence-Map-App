const mongoose = require('mongoose');
const { POI_STATUS } = require('../constants/poi-status');

const poiSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true } // [longitude, latitude]
    },
    radius: { type: Number, required: true, default: 100 },
    priority: { type: Number, default: 0 },
    languageCode: { type: String, default: 'vi' },
    name: { type: String, required: true },
    summary: { type: String, default: '' },
    narrationShort: { type: String, default: '' },
    narrationLong: { type: String, default: '' },
    // Legacy fallback (old schema). Kept for backward compatibility while migrating data.
    content: { type: mongoose.Schema.Types.Mixed, default: null },
    isPremiumOnly: { type: Boolean, default: false },
    status: {
        type: String,
        enum: Object.values(POI_STATUS),
        default: POI_STATUS.PENDING
    },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    rejectionReason: { type: String, default: null, maxlength: 2000 }
}, {
    timestamps: true
});

poiSchema.index({ location: '2dsphere' });
poiSchema.index({ code: 1, status: 1 });

module.exports = mongoose.model('Poi', poiSchema);
