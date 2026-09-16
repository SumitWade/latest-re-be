const User = require("../model/user.model");
const OtpModel = require("../model/otp.model");
const countPages = require("../utils/helper/count-pages");
const UserAction = require("../model/user-action-model");
const mongoose = require("mongoose");

const limit = process.env.LIMIT || 20
const userServices = {
    createDefaultAdmin: () => {
        return User.findOneAndUpdate(
            { userType: "admin" },
            {
                $setOnInsert: {
                    name: "Admin",
                    email: "admin@example.com",
                    mobile: "9999999999",
                    userType: "admin",
                }
            },
            {
                upsert: true,
                new: true,
            }
        );
    },
    insertUser: (dataToInsert) => {
        return User.create(dataToInsert)
    },
    updateUser: (id, dataToUpdate) => {
        return User.updateOne({ _id: id }, { $set: dataToUpdate })
    },
    isUserExistWithMobile: (mob) => {
        return User.findOne({ mobile: mob });
    },
    isUserExistWithEmail: (emailAdd) => {
        return User.findOne({ email: emailAdd });
    },
    getAdminUsers: () => {
        return User.find({ userType: "admin" })
    },
    getUserByObjectId: (id) => {
        return User.findOne({ _id: id })
    },
    getUserActivityDetails: async (page = 1, searchString, date) => {

        if (page < 1) page = 1;
        let filter = { userType: { $nin: ["admin", "superadmin"] } };

        if (searchString) {
            const regex = new RegExp(searchString, "i");
            filter.$or = [
                { name: regex },
                { email: regex },
                { mobile: regex }
            ];
        }

        // Find all users with the filter
        const users = await User.find(filter).sort({ createdAt: -1 });

        // Collect all userIds
        const userIds = users.map(user => user._id);

        let actionFilter = { userId: { $in: userIds } };
        if (date) {
            actionFilter.dateString = date;
        }

        // Count total actions
        const totalActionsCount = await UserAction.countDocuments(actionFilter);

        // Skip and Limit for pagination
        const skip = (page - 1) * limit;

        // Get paginated actions with populate
        const actions = await UserAction.find(actionFilter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate([
                { path: "userId", select: "name mobile " },
                { path: "actions.propertyId", select: "name propertyTitle userType locality address" },
                { path: "actions.projectId", select: "name reraNumber locality" }
            ]);

        return {
            actions,
            totalRecords: totalActionsCount,
            totalPages: Math.ceil(totalActionsCount / limit)
        };
    },

    //OTP 
    saveOtp: (dataToInsert) => {
        return OtpModel.create(dataToInsert);
    },
    isOtpStillValid: (mob) => {
        return OtpModel.findOne({ mobile: mob })
    },
    verifyOtp: (mob, otp) => {
        return OtpModel.findOne({ mobile: mob, otp: otp })
    },
    deleteOtpOnLogin: (mobile) => {
        return OtpModel.deleteOne({ mobile })
    },
    userPaginatedList: async (page = 1, searchString, type) => {
        let filter = { userType: { $nin: ["admin", "superadmin"] } };
        //when type is provided
        if (type) {
            filter.userType = type.trim().toLowerCase();
        }
        // search
        if (searchString) {
            const regex = new RegExp(searchString, "i");
            filter.$or = [
                { name: regex },
                { email: regex },
                { mobile: regex }
            ];
        }
        //set pagination to default one
        if (page < 1) page = 1;

        //response 
        const totalRecords = await User.countDocuments(filter);
        const result = await User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
        return {
            result,
            totalPages: await countPages(totalRecords),
            totalRecords
        };
    },
    checkMobileWhileUpdate: (id, mob) => {
        return User.findOne({ _id: { $ne: id }, mobile: mob })
    },
    isUserEmailExistWhileUpdate: (id, emailAdd) => {
        return User.findOne({ _id: { $ne: id }, email: emailAdd })
    },
    exportUserActions: async (action, startDate, endDate, userId, month) => {
        try {
            let userFilter = { userType: { $nin: ["admin", "superadmin"] } };
            if (userId) {
                userFilter._id = new mongoose.Types.ObjectId(userId);
            }
            const users = await User.find(userFilter);
            const userIds = users.map(u => u._id);

            let filter = { userId: { $in: userIds } };

            if (startDate || endDate) {
                filter.dateString = {};
                if (startDate) filter.dateString.$gte = startDate;
                if (endDate) filter.dateString.$lte = endDate;
            }

            // Month filtering if provided (1-12)
            if (month) {
                // If we want to filter by month string on dateString (e.g. 'YYYY-MM-DD')
                const monthStr = month.toString().padStart(2, "0");
                filter.dateString = filter.dateString || {};
                filter.dateString.$regex = new RegExp(`^\\d{4}-${monthStr}-`);
            }

            if (action) {
                filter.$or = [
                    { "actions.actionType": action },
                    { "actions.action": action }
                ];
            }

            const results = await UserAction.find(filter)
                .populate("userId", "name email mobile")
                .populate("actions.propertyId", "name propertyTitle locality address")
                .populate("actions.projectId", "name reraNumber locality")
                .sort({ createdAt: -1 })
                .lean();

            // Further filter the nested array if an action is specified
            if (action) {
                results.forEach(doc => {
                    doc.actions = doc.actions.filter(a => a.actionType === action || a.action === action);
                });
            }

            return results.filter(doc => doc.actions && doc.actions.length > 0);
        } catch (error) {
            throw error;
        }
    },
    getTrustedDeveloperUsers: () => {
       try {
        return User.find({userType : {$nin : ["admin","visitor"]}})
       } catch (error) {
        throw error;
       }
    }

}

module.exports = userServices;