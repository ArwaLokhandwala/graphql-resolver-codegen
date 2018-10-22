"use strict";
exports.__esModule = true;
exports.Booking = {
    id: function (parent) { return parent.id; },
    createdAt: function (parent) { return parent.createdAt; },
    bookee: function (parent) { return parent.bookee; },
    place: function (parent) { return parent.place; },
    startDate: function (parent) { return parent.startDate; },
    endDate: function (parent) { return parent.endDate; },
    payment: function (parent) { return parent.payment; }
};
