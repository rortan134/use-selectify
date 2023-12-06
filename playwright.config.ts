import { devices, PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
    testDir: "./test",
    timeout: 30 * 1000,
    expect: {
        timeout: 5000,
    },
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: process.env.CI
        ? [["github"], ["json", { outputFile: "playwright-report.json" }]]
        : "list",
    use: {
        trace: "on-first-retry",
        baseURL: "http://localhost:3000",
    },
    webServer: {
        command: "npm run dev",
        url: "http://localhost:3000",
        cwd: "./test",
        reuseExistingServer: !process.env.CI,
    },
    projects: [
        {
            name: "webkit",
            use: { ...devices["Desktop Safari"], headless: true },
        },
    ],
};

export default config;
