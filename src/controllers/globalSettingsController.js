import GlobalSettings from "../models/GlobalSettings.js";
import catchAsync from "../utils/catchAsync.js";

// Get global settings (create default if not exists)
export const getGlobalSettings = catchAsync(async (req, res, next) => {
    let settings = await GlobalSettings.findOne();
    if (!settings) {
        settings = await GlobalSettings.create({ mentorFeedbackEnabled: false });
    }

    res.status(200).json({
        status: "success",
        data: {
            settings,
        },
    });
});

// Update global settings
export const updateGlobalSettings = catchAsync(async (req, res, next) => {
    const settings = await GlobalSettings.findOneAndUpdate(
        {},
        req.body,
        {
            new: true,
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true
        }
    );

    res.status(200).json({
        status: "success",
        data: {
            settings,
        },
    });
});
