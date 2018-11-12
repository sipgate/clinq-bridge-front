import { Adapter, Config, Contact, PhoneNumber, start } from "@clinq/bridge";
import axios from "axios";
import * as crypto from "crypto";
import { Request } from "express";
import { Cache } from "./cache";
import { env } from "./env";
import { log } from "./logging";
import { MapKeyValueStore } from "./map-key-value-store";
import { IFrontContact, IFrontContactHandle, IFrontResult } from "./models";

class FrontAdapter implements Adapter {
    private cache: Cache;

    constructor() {
        this.cache = new Cache(
            new MapKeyValueStore(),
            env.CACHE_TTL_SECONDS,
        );
    }

    public async getContacts(config: Config): Promise<Contact[]> {
        const { apiKey } = config;

        const cacheKey = crypto
            .createHash("sha256")
            .update(apiKey)
            .digest("hex");

        const cachedContacts: Contact[] = await this.cache.get(cacheKey);

        if (cachedContacts) {
            log.debug("contacts cache hit", { cacheKey, contactsCount: cachedContacts.length });

            return cachedContacts;
        } else {
            log.debug("contacts cache miss", { cacheKey });

            const fetchedContacts = await this.fetchContactsFromFront(apiKey);

            log.debug("fetching contacts complete", { cacheKey, contactsCount: fetchedContacts.length });

            await this.cache.put(cacheKey, fetchedContacts);
            return fetchedContacts;
        }
    }

    protected async fetchContactsFromFront(accessToken: string): Promise<Contact[]> {
        const convertContactToClinq = (frontContact: IFrontContact): Contact => {
            const phoneNumbers = frontContact.handles
                .filter((handle: IFrontContactHandle) => {
                    return handle.source === "phone"
                        && handle.handle
                        && handle.handle.length > 0;
                })
                .map((handle: IFrontContactHandle) => ({
                    label: null,
                    phoneNumber: handle.handle,
                }));

            return phoneNumbers.length > 0
                ? {
                    avatarUrl: frontContact.avatar_url,
                    company: null,
                    contactUrl: frontContact._links.self,
                    email: frontContact.handles
                        .filter((handle: IFrontContactHandle) => handle.source === "email")
                        .map((handle: IFrontContactHandle) => handle.handle)[0]
                        || null,
                    id: frontContact.id,
                    name: frontContact.name,
                    phoneNumbers,
                }
                : null;
        };

        const convertContactsToClinq = (frontContacts: IFrontContact[]): Contact[] => {
            if (!Array.isArray(frontContacts)) {
                return [];
            }

            return frontContacts
                .map(convertContactToClinq)
                .filter((contact: Contact) => contact);
        };

        const fetchNextChunk = async (contacts: Contact[], url: string): Promise<Contact[]> => {
            log.trace("fetching contacts chunk", { url });

            const result = (await axios.get<IFrontResult>(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                params: {
                    limit: env.API_CONTACTS_LIMIT,
                },
            })).data;

            const allContacts = [
                ...contacts,
                ...convertContactsToClinq(result._results),
            ];

            const nextUrl = result._pagination ? result._pagination.next : false;
            if (nextUrl) {
                return fetchNextChunk(allContacts, nextUrl);
            } else {
                return allContacts;
            }

        };

        return fetchNextChunk([], env.API_CONTACTS_URL);
    }
}

start(new FrontAdapter());
