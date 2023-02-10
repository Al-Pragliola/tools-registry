import { Strategy } from '../strategies/interface.mjs';
import { fetchAll } from '../strategies/kubectl.mjs';
import { ITool } from "./interface.mjs";

export class Kubectl implements ITool<null> {
    name: string;
    getReleases: Strategy<null>;

    constructor() {
        this.name = 'kubectl';

        this.getReleases = fetchAll;
    }

}