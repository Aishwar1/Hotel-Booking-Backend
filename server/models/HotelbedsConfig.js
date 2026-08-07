import mongoose from "mongoose";

const hotelbedsConfigSchema = new mongoose.Schema(
  {
    apikey: { type: String, required: true },
    secret: { type: String, required: true },
    accountName: { type: String, required: true },
    environment: { type: String, required: true },
    rateLimits: { type: String, default: 'Empty' },
    allowRequests: { type: Number, default: 8 },
    perSeconds: { type: Number, default: 4 },
    throttling: { type: String, default: 'Empty' },
    throttleInterval: { type: Number, default: -1 },
    throttleRetryLimit: { type: Number, default: -1 },
    usageQuotas: { type: String, default: 'Empty' },
    maxQuotas: { type: Number, default: 50 },
    quotaResetsEvery: { type: Number, default: 86400 },
    alias: { type: String, default: '' },
  },
  { timestamps: true }
);

const HotelbedsConfig = mongoose.models.HotelbedsConfig || mongoose.model("HotelbedsConfig", hotelbedsConfigSchema);

export default HotelbedsConfig;
