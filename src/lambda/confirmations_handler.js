const AWS = require("aws-sdk");
const express = require("express");
const serverless = require("serverless-http");
var cors = require('cors')
const uuid = require("uuid");
const { verify_password } = require("../utils/login");

var corsOptions = {
    origin: ['https://beta.samuel-und-hannah.de', 'http://localhost:8000', 'https://samuel-und-hannah.de'],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  }
const app = express();
const CONFIRMATION_TABLE = process.env.CONFIRMATION_TABLE;

let options = {};
if (process.env.IS_OFFLINE) {
    options = {
        region: "localhost",
        endpoint: "http://localhost:9998",
    };
}
const dynamoDbClient = new AWS.DynamoDB.DocumentClient(options);

app.use(express.json());
app.use(cors(corsOptions))
app.use(function(req, res, next) {
    res.setHeader('charset', 'utf-8')
    next();
  });

  app.options('/confirmations', cors(corsOptions))


// GET /confirmations
// This will return a list of all confirmations in the database
app.get("/confirmations", async function (req, res) {
    const { authorization: password } = req.headers;
    if (! await verify_password(password,process.env.DASHBOARD_KEY)){
        return res.status(401).json({error: "Unauthorized"})
    }

    const params = {
        TableName: CONFIRMATION_TABLE,
    };
    let scanResults = [];
    let items;

    try {
        do {
            items = await dynamoDbClient.scan(params).promise();
            items.Items.forEach((item) => scanResults.push(item));
            params.ExclusiveStartKey = items.LastEvaluatedKey;
        } while (typeof items.LastEvaluatedKey != "undefined");
        res.json(items.Items);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "An Error occurred while scanning for all presents" });
    }
});

// POST /confirmation
// Create a new confirmation in the database
// RETURN: confirmationId
app.post("/confirmations", async function (req, res) {
    const { authorization: password } = req.headers;
    if (! await verify_password(password,process.env.GUEST_KEY)){
        return res.status(401).json({error: "Unauthorized"})
    }

    const { name, surname, attending, eating, allergies, textfield } = req.body;
    if (typeof name !== "string") {
        return res.status(400).json({ error: '"name" must be a string' });
    } else if (typeof surname !== "string") {
        return res.status(400).json({ error: '"surname" must be a string' });
    } else if (typeof attending !== "boolean") {
        return res.status(400).json({ error: '"attending" must be a string' });
    } else if (typeof eating !== "string") {
        return res.status(400).json({ error: '"eating" must be a string' });
    } else if (typeof allergies !== "string") {
        return res.status(400).json({ error: '"text_field" must be a string' });
    } else if (typeof textfield !== "string") {
        return res.status(400).json({ error: '"text_field" must be a string' });
    }

    const confirmationId = uuid.v4();
    const params = {
        TableName: CONFIRMATION_TABLE,
        Item: {
            confirmationId: confirmationId,
            name: name,
            surname: surname,
            attending: attending,
            eating: eating,
            allergies: allergies,
            textfield: textfield,
        },
    };

    try {
        await dynamoDbClient.put(params).promise();
        res.status(201).json({ confirmationId });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Could not create present" });
    }
});

// DELETE /confirmation
// Delete a confirmation based on the confirmationId. The key needs to be set as query param.
app.delete("/confirmations", async function (req, res) {
    const { authorization: password } = req.headers;
    if (! await verify_password(password,process.env.DASHBOARD_KEY)){
        return res.status(401).json({error: "Unauthorized"})
    }

    const params = {
        TableName: CONFIRMATION_TABLE,
        Key: {
            confirmationId: req.query.confirmationId,
        },
        ReturnValues: 'ALL_OLD'
    };
    try {
        const deletedInfo = await dynamoDbClient.delete(params).promise();
        const error = deletedInfo.$response.error
        if (!deletedInfo.Attributes){
            throw new Error("Item could not be deleted.", error)
        }
        return res.status(204).json({data: "Item deleted"});
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Could not delete Present" });
    }
});

// PUT /confirmations
// Update the confirmation with new informations
app.put("/confirmations", async function (req, res) {
    const { authorization: password } = req.headers;
    if (! await verify_password(password,process.env.DASHBOARD_KEY)){
        return res.status(401).json({error: "Unauthorized"})
    }

    const { confirmationId, name, surname, attending, eating, allergies, textfield } = req.body;
    if (typeof confirmationId !== "string"){
        return res.status(400).json({ error: '"confirmationId" must be a string' });
    }else if (typeof name !== "string") {
        return res.status(400).json({ error: '"name" must be a string' });
    } else if (typeof surname !== "string") {
        return res.status(400).json({ error: '"surname" must be a string' });
    } else if (typeof attending !== "boolean") {
        return res.status(400).json({ error: '"attending" must be a string' });
    } else if (typeof eating !== "string") {
        return res.status(400).json({ error: '"eating" must be a string' });
    } else if (typeof allergies !== "string") {
        return res.status(400).json({ error: '"allergies" must be a string' });
    } else if (typeof textfield !== "string") {
        return res.status(400).json({ error: '"text_field" must be a string' });
    }

    const params = {
        TableName: CONFIRMATION_TABLE,
        Key: {
            confirmationId: confirmationId,
        },
        UpdateExpression: "set #name = :name, surname = :surname, attending = :attending, eating = :eating, allergies = :allergies, texfield = :textfield",
        ExpressionAttributeNames: {
            "#name": "name"
          },
        ExpressionAttributeValues: {
            ":name": name,
            ":surname": surname,
            ":attending": attending,
            ":eating": eating,
            ":allergies": allergies,
            ":textfield": textfield
        },
        ReturnValues: "ALL_NEW",
    };

    try {
        const { data } = await dynamoDbClient.update(params).promise();
        res.status(204).json(data);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Could not update present with the id" + req.query.presentId });
    }
});

app.use((req, res, next) => {
    return res.status(404).json({
        error: "Not Found",
    });
});

module.exports.handler = serverless(app);
