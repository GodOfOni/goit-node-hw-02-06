const { nanoid } = require("nanoid");
const path = require("path");
const fs = require("fs/promises");

const contactsPath = path.join(__dirname, "contacts.json");

const listContacts = async () => {
  try {
    const data = await fs.readFile(contactsPath, "utf8");
    const contacts = JSON.parse(data);
    return contacts;
  } catch (error) {
    throw error;
  }
};

const getContactById = async (contactId) => {
  try {
    const data = await fs.readFile(contactsPath, "utf8");
    const contacts = JSON.parse(data);
    const contact = contacts.find((item) => item.id === contactId);
    return contact;
  } catch (error) {
    throw error;
  }
};

const addContact = async ({ name, email, phone }) => {
  try {
    const data = await fs.readFile(contactsPath, "utf8");
    const contacts = JSON.parse(data);
    const id = nanoid();
    const newContact = { id, name, email, phone };
    contacts.push(newContact);
    await fs.writeFile(contactsPath, JSON.stringify(contacts), "utf8");
    return newContact;
  } catch (error) {
    throw error;
  }
};

async function removeContact(contactId) {
  try {
    const data = await fs.readFile(contactsPath, "utf8");
    const contacts = JSON.parse(data);
    const newContacts = contacts.filter((item) => item.id !== contactId);

    if (contacts.length === newContacts.length) {
      return false;
    }

    await fs.writeFile(contactsPath, JSON.stringify(newContacts), "utf8");
    return true;
  } catch (error) {
    console.log(error.message);
    return false;
  }
}

const updateContact = async (contactId, { name, email, phone }) => {
  try {
    const data = await fs.readFile(contactsPath, "utf8");
    const contacts = JSON.parse(data);
    const index = contacts.findIndex((item) => item.id === contactId);

    if (index !== -1) {
      contacts[index] = {
        id: contactId,
        name: name || contacts[index].name,
        email: email || contacts[index].email,
        phone: phone || contacts[index].phone,
      };

      await fs.writeFile(contactsPath, JSON.stringify(contacts), "utf8");
      return contacts[index];
    } else {
      return null;
    }
  } catch (error) {
    throw error;
  }
};

module.exports = {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
};
