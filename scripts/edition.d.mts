export const version: string;
export const releaseSteps: string[];
export const proofFiles: string[];
export const benchmarkFiles: string[];
export function fingerprint(files: readonly string[]): Promise<string>;
export function visualFingerprint(): Promise<string>;
