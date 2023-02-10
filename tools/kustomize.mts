import { Strategy, GithubData } from '../strategies/interface.mjs';
import { fetchAll } from '../strategies/github.mjs';
import { ITool } from "./interface.mjs";

export class Kustomize implements ITool<GithubData> {
    name: string;
    getReleases: Strategy<GithubData>;

    constructor() {
        this.name = 'kustomize';

        this.getReleases = (data: GithubData) => this.filterReleases(fetchAll(data));
    }

    async filterReleases(releases: Promise<string[]>): Promise<string[]> {
        let error: Error;
        let rel: string[] = await releases.catch(e => error = e);

        return new Promise((resolve, reject) => {
            if (error) {
                reject(error);
            }

            resolve(rel.filter((r: string) => r.startsWith('kustomize/v')).map((r: string) => r.replace('kustomize/', '')));
        });
    }
}