const express = require("express");
const morgan = require("morgan");
const app = express();

let contactData = [
  {
    firstName: "Mike",
    lastName: "Jones",
    phoneNumber: "281-330-8004",
  },
  {
    firstName: "Jenny",
    lastName: "Keys",
    phoneNumber: "768-867-5309",
  },
  {
    firstName: "Max",
    lastName: "Entiger",
    phoneNumber: "214-748-3647",
  },
  {
    firstName: "Alicia",
    lastName: "Keys",
    phoneNumber: "515-489-4608",
  },
];

const sortContacts = contacts => {
  return contacts.slice().sort((contactA, contactB) => {
    if (contactA.lastName < contactB.lastName) {
      return -1;
    } else if (contactA.lastName > contactB.lastName) {
      return 1;
    } else if (contactA.firstName < contactB.firstName) {
      return -1;
    } else if (contactA.firstName > contactB.firstName) {
      return 1;
    } else {
      return 0;
    }
  });
};

app.set("views", "./views");
app.set("view engine", "pug");

app.use(express.static("public"));
app.use(express.urlencoded({extended: false}));
app.use(morgan("common"));

app.get("/", (req, res) => {
  res.redirect("/contacts");
});

app.get("/contacts", (req, res) => {
  res.render("contacts", {
    contacts: sortContacts(contactData)
  });
});

app.get("/contacts/new", (req, res) => {
  res.render("new-contact");
});

const isAlphabetic = (text) => /^[a-z]+$/i.test(text);
const phoneNumberIsFormatted = (phoneNum) => {
  return /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/.test(phoneNum);
}

app.post("/contacts/new",
  // create errorMessage obj
  (req, res, next) => {
    res.locals.errorMessages = [];
    next();
  },
  // trim whitespace of all entries
  (req, res, next) => {
    Object.keys(req.body).forEach(key => {
      res.locals[key] = req.body[key].trim();
    });

    next();
  },
  // validate firstName
  (req, res, next) => {
    let firstName = res.locals.firstName;
    // length must be greater than 0
    if (firstName.length === 0) {
      res.locals.errorMessages.push("First name is required.");
    // chars must all be alphabetic
    } else if (!isAlphabetic(firstName)) {
      res.locals.errorMessages.push("Only enter alphabetic characters for First Name");
    // length must be shorter than 25 chars
    } else if (firstName.length > 25) {
      res.locals.errorMessages.push("Enter a First Name of 25 characters or less");
    } 

    next();
  },
  // validate lastName
  (req, res, next) => {
    let lastName = res.locals.lastName;
    if (lastName.length === 0) {
      res.locals.errorMessages.push("Last name is required.");
    } else if (!isAlphabetic(lastName)) {
      res.locals.errorMessages.push("Only enter alphabetic characters for Last Name");
    // length must be shorter than 25 chars
    } else if (lastName.length > 25) {
      res.locals.errorMessages.push("Enter a Last Name of 25 characters or less");
    } 

    next();
  },
  // validate phoneNumber
  (req, res, next) => {
    let phoneNumber = res.locals.phoneNumber;
    if (phoneNumber.length === 0) {
      res.locals.errorMessages.push("Phone number is required.");
      // match correct us phone pattern
    } else if (!phoneNumberIsFormatted(phoneNumber)) {
      res.locals.errorMessages.push("Format your phone number as follows: ###-###-####");
    }

    next();
  },
  // handle duplicates
  (req, res, next) => { // check for duplicates
    let fullName = `${res.locals.firstName} ${res.locals.lastName}`;
    let foundContact = contactData.find(contact => {
      return `${contact.firstName} ${contact.lastName}` === fullName;
    });

    if (foundContact) {
      res.locals.errorMessages.push(`${fullName} is already on your contact list. Duplicates are not allowed.`);
    }

    next();
  },
  // handle errors
  (req, res, next) => {
    if (res.locals.errorMessages.length > 0) {
      res.render("new-contact", {...res.locals});
    } else {
      next();
    }
  },
  (req, res) => {
    contactData.push({...req.body});
    res.redirect("/contacts");
  });

app.listen(3000, "localHost", () => {
  console.log("Listening to port 3000");
});