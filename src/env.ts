export interface IEnvVars {
  API_CONTACTS_LIMIT: number;
  API_CONTACTS_URL: string;
  LOGLEVEL: string;
}

const defaults: IEnvVars = {
  API_CONTACTS_LIMIT: 100,
  API_CONTACTS_URL: "https://api2.frontapp.com/contacts",
  LOGLEVEL: "info",
};

const parseEnv = (): IEnvVars => {
  const {
    API_CONTACTS_LIMIT,
    API_CONTACTS_URL,
    LOGLEVEL,
  } = process.env;

  const externalEnv = {
    API_CONTACTS_LIMIT: API_CONTACTS_LIMIT && parseInt(API_CONTACTS_LIMIT, 10),
    API_CONTACTS_URL,
    LOGLEVEL,
  };

  const mergedEnv: IEnvVars = Object.entries(externalEnv).reduce(
    (merged, [k, v]): IEnvVars => {
      if (v !== undefined) {
        merged[k] = v;
      }
      return merged;
    },
    { ...defaults }
  );

  return mergedEnv;
};

export const env: IEnvVars = parseEnv();
