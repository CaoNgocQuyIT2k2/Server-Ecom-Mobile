const mongoose = require("mongoose");

const CancelRequestSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    userId: { type: String, required: true },
    reason: { type: String, required: true },
    status: { 
        type: String, 
        enum: ["Pending", "Approved", "Rejected"], 
        default: "Pending" 
    },
    requestedAt: { type: Date, default: Date.now },
    processedAt: { type: Date }
});

module.exports = mongoose.model("CancelRequest", CancelRequestSchema);
