"use strict";
exports.__esModule = true;
exports.Home = {
    id: function (parent) { return parent.id; },
    name: function (parent) { return parent.name; },
    description: function (parent) { return parent.description; },
    numRatings: function (parent) { return parent.numRatings; },
    avgRating: function (parent) { return parent.avgRating; },
    pictures: function (parent, args) { return parent.pictures; },
    perNight: function (parent) { return parent.perNight; }
};
