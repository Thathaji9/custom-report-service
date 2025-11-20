"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schedulerService_1 = require("./services/schedulerService");
const schedulerService = new schedulerService_1.SchedulerService();
// Initialize schedules after DB connection is established
schedulerService.initializeSchedules();
