import fetch from "node-fetch";

interface KubeReleases {
    [key: string]: string;
}

export async function fetchAll(): Promise<string[]> {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
        controller.abort();
    }, 10000);

    let error: Error;

    let releases: string[] = [];

    let res = await fetch(`https://storage.googleapis.com/kubernetes-release/release/release-notes-index.json`, {signal: controller.signal}).catch(err => {
        error = new Error(`Error fetching releases from kubernetes (error: ${err})`);
    });

    clearTimeout(timeout);

    if (!res) {
        return new Promise((resolve, reject) => {
            reject(error);
        });
    }

    if (res.status !== 200) {
        error = new Error(`Error fetching releases from kubernetes (status: ${res.status})`);
    }

    let newReleases = await res.json() as KubeReleases;

    releases = [...releases, ...Object.keys(newReleases)];

    return new Promise((resolve, reject) => {
        if (error) {
            reject(error);
        }

        resolve(releases.reverse());
    });
}
