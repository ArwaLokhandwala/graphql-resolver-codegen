"use strict";
exports.__esModule = true;
exports.Policies = {
    checkInEndTime: function (parent) { return parent.checkInEndTime; },
    checkInStartTime: function (parent) { return parent.checkInStartTime; },
    checkoutTime: function (parent) { return parent.checkoutTime; },
    createdAt: function (parent) { return parent.createdAt; },
    id: function (parent) { return parent.id; },
    updatedAt: function (parent) { return parent.updatedAt; }
};
