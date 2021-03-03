module.exports = handlePullRequest;

const core = require("@actions/core");
const { Octokit } = require("@octokit/action");

/**
 * Handle "pull_request" event
 */
async function handlePullRequest() {
    const octokit = new Octokit();
    
    const eventPayload = require(process.env.GITHUB_EVENT_PATH);
    
    core.info(
              `Handling pull request ${eventPayload.action} for ${eventPayload.pull_request.html_url}`
              );
    
    if (eventPayload.pull_request.state !== "open") {
        core.info(`Pull request already closed, ignoring`);
        return;
    }
    
    if (eventPayload.pull_request.head.repo.fork) {
        core.setFailed(`Setting a scheduled merge is not allowed from forks`);
        process.exit(1);
    }
    
    const labels = eventPayload.pull_request.labels.map(label => label.name);
    
    if (labels.includes("doNotMerge")) {
        core.setFailed("Skipping PR merge, blocking label present: doNotMerge");
        process.exit(1);
    }
    
    if (!labels.includes("readyToMerge")) {
        core.setFailed("Skipping PR merge, missing required label: readyToMerge");
        process.exit(1);
    }
    
    const { data } = await octokit.checks.create({
        owner: eventPayload.repository.owner.login,
        repo: eventPayload.repository.name,
        name: "Auto Merge Scheduled",
        head_sha: eventPayload.pull_request.head.sha,
        status: "in_progress",
        output: {
            title: `Scheduled to be merged`,
            summary: ""
        },
    });
    
    core.info(`Check run created: ${data.html_url}`);
}
