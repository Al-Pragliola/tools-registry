import { Strategy, GithubData } from '../strategies/interface.mjs';
import { fetchAll } from './../strategies/github.mjs';
import { ITool } from "./interface.mjs";

export class Terraform implements ITool<GithubData> {
    name: string;
    getReleases: Strategy<GithubData>;

    constructor() {
        this.name = 'terraform';

        this.getReleases = fetchAll;
    }
}
