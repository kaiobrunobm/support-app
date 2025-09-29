"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startArchiveJob = startArchiveJob;
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_1 = __importDefault(require("../prisma"));
function startArchiveJob() {
    node_cron_1.default.schedule('0 2 * * *', async () => {
        console.log('Running scheduled job: Archiving old unassigned systems...');
        const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30));
        try {
            const result = await prisma_1.default.systemInfo.updateMany({
                where: {
                    status: 'ACTIVE',
                    user: null,
                    userDetachedAt: {
                        lt: thirtyDaysAgo,
                    },
                },
                data: {
                    status: 'ARCHIVED',
                },
            });
            if (result.count > 0) {
                console.log(`Successfully archived ${result.count} systems.`);
            }
            else {
                console.log('No systems met the criteria for archiving.');
            }
        }
        catch (error) {
            console.error('Error during system archiving job:', error);
        }
    });
    console.log('System archiving job scheduled to run daily at 2 AM.');
}
