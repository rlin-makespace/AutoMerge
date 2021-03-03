const core = require("@actions/core");

const handlePullRequest = require("./handle_pull_request");
const handleMerge = require("./handle_merge");

main();

async function main() {
    if (process.env.GITHUB_EVENT_NAME === "pull_request") {
        return handlePullRequest();
    }
    handleMerge();
}

process.on("unhandledRejection", (reason, promise) => {
    core.warning("Unhandled Rejection at:");
    core.warning(promise);
    core.setFailed(reason);
});
