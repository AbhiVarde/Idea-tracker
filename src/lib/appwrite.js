import { Client, Databases, Account, Storage } from "appwrite";

const client = new Client();
client
  .setEndpoint(`${process.env.REACT_APP_APPWRITE_ENDPOINT}`)
  .setProject(`${process.env.REACT_APP_APPWRITE_PROJECT_ID}`);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
