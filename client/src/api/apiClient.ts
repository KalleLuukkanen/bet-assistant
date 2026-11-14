const API_URL = import.meta.env.VITE_API_URL;

// error thrown when the server responds with an error status, message comes from the server's { error }
export class ApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

// fetch from the server and parse JSON, throws ApiError on 4xx/5xx
const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        credentials: "include",   // send the Better Auth session cookie
        headers: { "Content-Type": "application/json", ...options.headers },
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
        throw new ApiError(response.status, data?.error ?? `Request failed with status ${response.status}`);
    }
    return data as T;
};

// GET request, used when only ids are needed (they are in the path)
const get = <T>(path: string) => request<T>(path);

// POST request, used when the server reads info from req.body
const post = <T>(path: string, body: object = {}) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) });

export {
    request,
    get,
    post,
};
