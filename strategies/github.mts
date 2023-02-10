import fetch from "node-fetch";
import { GithubData } from "./interface.mjs";

interface GithubRelease {
    id: number;
    tag_name: string;
    name: string;
}

export async function fetchAll(data: GithubData): Promise<string[]> {
    let error = false;
    let page = 1;
    let max_items = 100;
    let releases: GithubRelease[] = [];

    while (true) {
        const controller = new AbortController();
        const timeout = setTimeout(() => {
	        controller.abort();
        }, 10000);

        let res = await fetch(`https://api.github.com/repos/${data.owner}/${data.repository}/releases?page=${page}&max_items=${max_items}`, {
            headers: {
                "User-Agent": "Al-Pragliola",
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
                "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
            },
            signal: controller.signal,
        }).catch(err => {
            console.error(`Error fetching releases from ${data.owner}/${data.repository} (error: ${err})`);
            error = true;
        });

        clearTimeout(timeout);

        if (!res) {
            break;
        } 
        
        if (res.status !== 200) {
            console.error(`Error fetching releases from ${data.owner}/${data.repository} (status: ${res.status})`);
            error = true;
            break;
        }
        
        let newReleases = await res.json() as GithubRelease[];

        if (newReleases.length === 0) {
            break;
        }

        releases = [...releases, ...newReleases];

        page++;
    }

    return new Promise((resolve, reject) => {
        if (error) {
            reject();
        }

        resolve(releases.map(r => r.tag_name));
    });
}
