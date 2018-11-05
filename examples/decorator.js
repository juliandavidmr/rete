"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var __1 = require("../");
var ControlText = /** @class */ (function () {
    function ControlText() {
    }
    ControlText.prototype.getNode = function () {
        throw new Error("Method not implemented.");
    };
    ControlText.prototype.getData = function (key) {
        throw new Error("Method not implemented.");
    };
    ControlText.prototype.putData = function (key, data) {
        throw new Error("Method not implemented.");
    };
    ControlText = __decorate([
        __1.ReteControl('Control')
    ], ControlText);
    return ControlText;
}());
var instance = new ControlText();
console.log('Key:', Object.keys(instance), instance.getData(''), instance.key);
