import { Adapter, Config, Contact, PhoneNumber, start } from "@clinq/bridge";
import { Request } from "express";
import axios from "axios";

const API_URL_CONTACTS = 'https://api2.frontapp.com/contacts';

const convertContact = (frontContact): Contact => ({
    id: String(frontContact.id),
    name: frontContact.name,
    email: frontContact.handles
        .filter(handle => handle.source === 'email')
        .map(handle => handle.handle)[0]
        || null,
    company: null,
    contactUrl: frontContact._links.self,
    avatarUrl: frontContact.avatar_url,
    phoneNumbers: frontContact.handles
        .filter(handle => handle.source === 'phone')
        .map(handle => ({
            label: null,
            phoneNumber: handle.handle
        }))
});

const isValidContact = (contact: Contact): boolean =>
    Array.isArray(contact.phoneNumbers) && contact.phoneNumbers.length > 0;

const getContacts = async (accessToken: string) => {
    const response = await axios.get(API_URL_CONTACTS, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    if (!Array.isArray(response.data._results)) {
        return [];
    }

    return response.data._results
        .map(convertContact)
        .filter(contact => isValidContact(contact));
};

class FrontAdapter implements Adapter {
    public async getContacts(config: Config): Promise<Contact[]> {
        const { apiKey } = config;
        const results = await getContacts(apiKey);
        //console.log('xxxxxxxxxxxxxxxxxx', results);
        return results;
    }
}

start(new FrontAdapter());
