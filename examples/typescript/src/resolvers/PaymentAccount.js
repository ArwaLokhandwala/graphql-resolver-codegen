"use strict";
exports.__esModule = true;
exports.PaymentAccount = {
    id: function (parent) { return parent.id; },
    createdAt: function (parent) { return parent.createdAt; },
    type: function (parent) { return parent.type; },
    user: function (parent) { return parent.user; },
    payments: function (parent) { return parent.payments; },
    paypal: function (parent) { return parent.paypal; },
    creditcard: function (parent) { return parent.creditcard; }
};
