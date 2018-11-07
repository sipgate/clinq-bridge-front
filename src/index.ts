import { Adapter, Config, Contact, PhoneNumber, start } from "@clinq/bridge";
import { Request } from "express";
import axios from "axios";

const API_CONTACTS_URL   = 'https://api2.frontapp.com/contacts';
const API_CONTACTS_LIMIT = 100;

const convertContactToClinq = (frontContact): Contact => {
    const phoneNumbers = frontContact.handles
        .filter(handle => handle.source === 'phone' && handle.handle && handle.handle.length > 0)
        .map(handle => ({
            label: null,
            phoneNumber: handle.handle
        }));

    return phoneNumbers.length > 0
        ? {
            id: String(frontContact.id),
            name: frontContact.name,
            email: frontContact.handles
                .filter(handle => handle.source === 'email')
                .map(handle => handle.handle)[0]
                || null,
            company: null,
            contactUrl: frontContact._links.self,
            avatarUrl: frontContact.avatar_url,
            phoneNumbers: phoneNumbers
        }
        : null;
};

const convertContactsToClinq = (frontContacts): Contact[] => {
    if (!Array.isArray(frontContacts)) {
        return [];
    }

    return frontContacts
        .map(convertContactToClinq)
        .filter(contact => contact);
};

const getContacts = async (accessToken: string) => {
    const getNextChunk = async (contacts: Contact[], url: string) =>{
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            params: {
                limit: API_CONTACTS_LIMIT
            }
        });

        const allContacts = [
            ...contacts,
            ...convertContactsToClinq(response.data._results)
        ];

        const nextUrl = response.data._pagination ? response.data._pagination.next : false;
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
