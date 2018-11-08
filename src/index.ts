import { Adapter, Config, Contact, PhoneNumber, start } from "@clinq/bridge";
import { Request } from "express";
import axios from "axios";
import { FrontResult } from "./front-result.model";
import { FrontContact, FrontContactHandle } from "./front-contact.model";

const API_CONTACTS_URL   = 'https://api2.frontapp.com/contacts';
const API_CONTACTS_LIMIT = 100;

const convertContactToClinq = (frontContact: FrontContact): Contact => {
    const phoneNumbers = frontContact.handles
        .filter((handle: FrontContactHandle) => handle.source === 'phone' && handle.handle && handle.handle.length > 0)
        .map((handle: FrontContactHandle) => ({
            label: null,
            phoneNumber: handle.handle
        }));

    return phoneNumbers.length > 0
        ? {
            id: frontContact.id,
            name: frontContact.name,
            email: frontContact.handles
                .filter((handle: FrontContactHandle) => handle.source === 'email')
                .map((handle: FrontContactHandle) => handle.handle)[0]
                || null,
            company: null,
            contactUrl: frontContact._links.self,
            avatarUrl: frontContact.avatar_url,
            phoneNumbers: phoneNumbers
        }
        : null;
};

const convertContactsToClinq = (frontContacts: FrontContact[]): Contact[] => {
    if (!Array.isArray(frontContacts)) {
        return [];
    }

    return frontContacts
        .map(convertContactToClinq)
        .filter((contact: Contact) => contact);
};

const getContacts = async (accessToken: string) => {
    const getNextChunk = async (contacts: Contact[], url: string) =>{
        //console.log(`fetching contacts via ${url}`);

        const result = (await axios.get<FrontResult>(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            params: {
                limit: API_CONTACTS_LIMIT
            }
        })).data;

        const allContacts = [
            ...contacts,
            ...convertContactsToClinq(result._results)
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
