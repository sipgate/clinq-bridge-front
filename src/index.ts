import { Adapter, Config, Contact, PhoneNumber, start } from "@clinq/bridge";
import axios from "axios";
import { Request } from "express";
import { IFrontContact, IFrontContactHandle } from "./front-contact.model";
import { IFrontResult } from "./front-result.model";

const API_CONTACTS_URL   = "https://api2.frontapp.com/contacts";
const API_CONTACTS_LIMIT = 100;

const convertContactToClinq = (frontContact: IFrontContact): Contact => {
    const phoneNumbers = frontContact.handles
        .filter((handle: IFrontContactHandle) => handle.source === "phone" && handle.handle && handle.handle.length > 0)
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

const getContacts = async (accessToken: string) => {
    const getNextChunk = async (contacts: Contact[], url: string) => {
        // console.log(`fetching contacts via ${url}`);

        const result = (await axios.get<IFrontResult>(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            params: {
                limit: API_CONTACTS_LIMIT,
            },
        })).data;

        const allContacts = [
            ...contacts,
            ...convertContactsToClinq(result._results),
        ];

        const nextUrl = result._pagination ? result._pagination.next : false;
        if (nextUrl) {
            return getNextChunk(allContacts, nextUrl);
        } else {
            return allContacts;
        }

    };

    return getNextChunk([], API_CONTACTS_URL);
};

class FrontAdapter implements Adapter {
    public async getContacts(config: Config): Promise<Contact[]> {
        const { apiKey } = config;
        return await getContacts(apiKey);
    }
}

start(new FrontAdapter());
