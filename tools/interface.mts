import { Strategy, StrategyData } from "../strategies/interface.mjs";

export interface ITool<T extends StrategyData> {
    name: string;
    getReleases: Strategy<T>;
}