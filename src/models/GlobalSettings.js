import mongoose from "mongoose";

const { model, Schema } = mongoose;

const globalSettingsSchema = new Schema({
  mentorFeedbackEnabled: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const GlobalSettings = model("GlobalSettings", globalSettingsSchema);

export default GlobalSettings;
