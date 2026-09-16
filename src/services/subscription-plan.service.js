const { ObjectId } = require("mongodb");
const SubscriptionPlan = require("../model/subscription-plan-model");
const mongoose = require("mongoose");
const PurchaseSubscription = require("../model/subscription-purchase-model");

const subscriptionPlanService = {
    createSubscriptionPlan : (dataToInsert)=> {
        return SubscriptionPlan.create( dataToInsert)
    },
    getSubscriptionPlan: (nameOfPlan)=> {
        return SubscriptionPlan.findOne({ name: nameOfPlan })
    },
    getSubscriptionRecordByObjId: (id) => {
        return SubscriptionPlan.findOne({_id: id})
    },
    checkSubscriptionPlanWhileUpdate: (id, nameOfPlan) => {
        return SubscriptionPlan.findOne({ _id: { $ne: (id) }, name: nameOfPlan })
    },
    updateSubscriptionPlan: (id, dataToUpdate) => {
        return SubscriptionPlan.updateOne({_id: id}, {$set: dataToUpdate})
    },
    subscriptionPlanList: async (type) => {
        let filter = {}; 
        if(type !== "admin"){
            filter.isPlanActive = "true" 
        }
        return await SubscriptionPlan.find(filter, {})
    },
    createPurchaseSubscription: (dataToInsert)=> {
        return PurchaseSubscription.create(dataToInsert)
    },
    getPurchasedSubscriptionDetails: (id)=> {
        return PurchaseSubscription.findOne({userId : id}).populate({path: "planId"})
    },
    getAllSubscriptions: ()=> {
        return SubscriptionPlan.find({});
    },
    deleteSubscriptionPlan: (id) => {
        return SubscriptionPlan.deleteOne({_id: id})
    },
    updatePurchasedSubscription: (id, dataToUpdate)=> {
        return PurchaseSubscription.updateOne({_id: id}, {$set: dataToUpdate})
    },
    getPurchasedSubscriptionByObjId : (id)=> {
        return PurchaseSubscription.findOne({_id: id})
    }
};

module.exports = subscriptionPlanService;