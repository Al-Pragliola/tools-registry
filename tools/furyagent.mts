import { Strategy, GithubData } from '../strategies/interface.mjs';
import { fetchAll } from './../strategies/github.mjs';
import { ITool } from "./interface.mjs";

export class FuryAgent implements ITool<GithubData> {
    name: string;
    getReleases: Strategy<GithubData>;

    constructor() {
        this.name = 'furyagent';

        this.getReleases = fetchAll;
    }

}