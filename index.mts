import fs from "fs";
import os from "os";
import path from "path";
import crypto from "crypto";
import { StrategyData } from "./strategies/interface.mjs";
import { FuryAgent } from "./tools/furyagent.mjs";
import { ITool } from "./tools/interface.mjs";
import { Kubectl } from "./tools/kubectl.mjs";
import { Kustomize } from "./tools/kustomize.mjs";
import { Terraform } from "./tools/terraform.mjs";

interface Tool {
    n: new () => ITool<StrategyData>;
    data: StrategyData;
}

interface Registry {
    [key: string]: string[];
}

interface Diff {
    newRegistryPath: string;
    diff: boolean;
}

const supportedTools: Tool[] = [
    {n: FuryAgent, data: { owner: 'sighupio', repository: 'furyagent' }},
    {n: Kustomize, data: { owner: 'kubernetes-sigs', repository: 'kustomize' }},
    {n: Terraform, data: { owner: 'hashicorp', repository: 'terraform' }},
    {n: Kubectl, data: null},
];

const getReleases = async (): Promise<Registry> => {
    const getters = supportedTools.map(async tool => {
        const t = new tool.n();

        const releases = await t.getReleases(tool.data);

        return { [t.name]: releases };
    });

    return (await Promise.all(getters)).reduce((acc, curr) => ({...acc, ...curr}), {});
}

const writeRegistry = async (releases: Promise<Registry>): Promise<string> => {
    const registry: Registry = await releases.catch(err => {
        console.error(err);

        return new Promise((resolve, reject) => {
            reject(err);
        });
    });
    const registryDir = fs.mkdtempSync(path.join(os.tmpdir(), "registry-"), "utf-8");
    const registryPath = `${registryDir}/registry.json`;

    fs.writeFileSync(registryPath, `${JSON.stringify(registry)}${os.EOL}`, "utf-8");

    console.log(`Registry written to ${registryPath}`);

    return new Promise((resolve, reject) => {
        resolve(registryPath);
    });
}

const checkDiff = async (p: Promise<string>): Promise<Diff> => {
    const registryPath: string = await p.catch(err => {
        console.error(err);

        return new Promise((resolve, reject) => {
            reject(err);
        });
    });
    const oldRegistryHash = crypto.createHash("sha256").update(fs.readFileSync(path.join("./", "dist", "registry.json"), "utf-8")).digest("hex");
    const newRegistryHash = crypto.createHash("sha256").update(fs.readFileSync(registryPath, "utf-8")).digest("hex");

    return new Promise((resolve, reject) => {
        resolve({
            newRegistryPath: registryPath,
            diff: oldRegistryHash !== newRegistryHash
        });
    });
}

checkDiff(writeRegistry(getReleases())).then(d => {
    if (d.diff) {
        console.log("Registry has changed");
        console.log("Updating registry...")
        fs.copyFileSync(d.newRegistryPath, path.join("./", "dist", "registry.json"));
        console.log("Registry updated")
    } else {
        console.log("Registry has not changed");
    }
});
