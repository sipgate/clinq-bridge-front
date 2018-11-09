export interface IEnvVars {
    API_CONTACTS_LIMIT: number;
    API_CONTACTS_URL: string;
    CACHE_TTL_SECONDS: number;
    LOGLEVEL: string;
}

const defaults: IEnvVars = {
    API_CONTACTS_LIMIT  : 100,
    API_CONTACTS_URL    : "https://api2.frontapp.com/contacts",
    CACHE_TTL_SECONDS   : (10 * 60),
    LOGLEVEL            : "info",
};

const parseEnv = (): IEnvVars => {
    const {
        API_CONTACTS_LIMIT,
        API_CONTACTS_URL,
        CACHE_TTL_SECONDS,
        LOGLEVEL,
    } = process.env;

    const externalEnv = {
        API_CONTACTS_LIMIT : API_CONTACTS_LIMIT && parseInt(API_CONTACTS_LIMIT, 10),
        API_CONTACTS_URL,
        CACHE_TTL_SECONDS  : CACHE_TTL_SECONDS && parseInt(CACHE_TTL_SECONDS, 10),
        LOGLEVEL,
    };

    const mergedEnv: IEnvVars = Object.entries(externalEnv)
        .reduce((merged, [k, v]): IEnvVars => {
            if (v !== undefined) {
                merged[k] = v;
            }
            return merged;
        }, Object.assign({}, defaults));

    return mergedEnv;
};

export const env: IEnvVars = parseEnv();
