const mongoose = require('mongoose');

const poiRequestSchema = new mongoose.Schema({
    poiData: {
        code: { type: String, required: true },
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
        isPremiumOnly: { type: Boolean, default: false }
    },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    timestamps: true
});

poiRequestSchema.index({ 'poiData.location': '2dsphere' });

module.exports = mongoose.model('PoiRequest', poiRequestSchema);
