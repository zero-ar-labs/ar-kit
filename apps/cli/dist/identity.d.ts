export interface CliContext {
    command: string;
}
export interface CliUsageRow {
    command: string;
    syntax: string;
    summary: string;
}
export interface CliHelpSection {
    title: string;
    commands: readonly string[];
}
export declare const CLI_USAGE_ROWS: readonly CliUsageRow[];
export declare const CLI_COMMANDS: string[];
export declare const CLI_COMMAND_EXAMPLES: Readonly<Record<string, readonly string[]>>;
export declare const CLI_HELP_SECTIONS: readonly CliHelpSection[];
export declare const CLI_REMOTE_CAPABLE_COMMANDS: readonly ["run", "attach", "inspect", "verification-plan", "records", "context", "result", "steer", "redirect", "pause", "budget", "cancel", "answer", "attention", "resume", "fork", "replay", "rebuild", "export", "import", "publish", "doctor", "environment", "provider", "tool-source", "effect", "source", "capability", "publication", "registry", "artifact", "memory"];
export type CliRemoteCapableCommand = (typeof CLI_REMOTE_CAPABLE_COMMANDS)[number];
export declare function isRemoteCapableCommand(command: string): command is CliRemoteCapableCommand;
export declare function createCliContext(): CliContext;
export declare function cliIdentityReport(context: CliContext): {
    product: "Zero-AR";
    wordmark: "ZERO-AR";
    command: string;
    runtime_build: string;
    execution_substrate: string;
    contract_version: string;
};
