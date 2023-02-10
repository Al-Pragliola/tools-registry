export type Strategy<T> = (data: T) => Promise<string[]>

export interface GithubData {
    repository: string;
    owner: string;
}

export type StrategyData = null | GithubData;
