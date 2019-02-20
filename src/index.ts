import { Adapter, Config, Contact, start } from "@clinq/bridge";
import axios from "axios";
import { env } from "./env";
import { log } from "./logging";
import { IFrontContact, IFrontContactHandle, IFrontResult } from "./models";

const convertContact = (frontContact: IFrontContact): Contact => {
  const phoneNumbers = frontContact.handles
  .filter((handle: IFrontContactHandle) => {
    return (
        handle.source === "phone" &&
        handle.handle &&
        handle.handle.length > 0
    );
  })
  .map((handle: IFrontContactHandle) => ({
    label: null,
    phoneNumber: handle.handle
  }));

  return phoneNumbers.length > 0
      ? {
        // TODO: Make avatarUrl publicly available temporarily
        avatarUrl: null, // frontContact.avatar_url,
        // TODO: Deep link to app.frontapp.com (e.g. https://app.frontapp.com/contacts/tea:597938)
        contactUrl: null, // frontContact._links.self,
        email:
            frontContact.handles
            .filter(
                (handle: IFrontContactHandle) => handle.source === "email"
            )
            .map((handle: IFrontContactHandle) => handle.handle)[0] || null,
        firstName: null,
        id: frontContact.id,
        lastName: null,
        name: frontContact.name,
        organization: null,
        phoneNumbers
      }
      : null;
};

const convertContactsToClinq = (
    frontContacts: IFrontContact[]
): Contact[] =>
    Array.isArray(frontContacts) ? frontContacts
    .map(convertContact)
    .filter((contact: Contact) => contact) : [];

const fetchContacts = async (
    accessToken: string,
    accumulator: Contact[] = [],
    url: string = env.API_CONTACTS_URL
): Promise<Contact[]> => {
  log.trace("fetching contacts chunk", { url });

  const result = (await axios.get<IFrontResult>(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    params: {
      limit: env.API_CONTACTS_LIMIT
    }
  })).data;

  const contacts = [
    ...accumulator,
    ...convertContactsToClinq(result._results)
  ];

  const nextUrl = result._pagination ? result._pagination.next : false;

  if (nextUrl) {
    return fetchContacts(accessToken, contacts, nextUrl);
  } else {
    return contacts;
  }
};

class FrontAdapter implements Adapter {
  public async getContacts({ apiKey }: Config): Promise<Contact[]> {
    return fetchContacts(apiKey);
  }
}

start(new FrontAdapter());
