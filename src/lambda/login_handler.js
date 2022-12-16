const AWS = require("aws-sdk");
const express = require("express");
const serverless = require("serverless-http");
const uuid = require("uuid");
var cors = require('cors')
const { validate_login, saltPassword, verify_password } = require("../utils/login");

var corsOptions = {
    //origin: 'http://localhost:8000',
    origin: ['https://beta.samuel-und-hannah.de', 'http://localhost:8000', 'https://samuel-und-hannah.de'],
    credentials: true,
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


app.options('/login', cors(corsOptions))

// POST /confirmation
// Create a new confirmation in the database
// RETURN: confirmationId
app.post("/login", async function (req, res) {
    const { authorization: value } = req.headers;
    const { mode } = req.body;
    if (typeof mode !== "string") {
        return res.status(400).json({ error: '"name" must be a string' });
    }

    if (mode == "guest"){
        const password = process.env.GUEST_KEY
        if(await verify_password(value, password)){
            return res.status(200).json({guest_state_key: process.env.GUEST_STATE_KEY})
        }else{
            console.error("[RESPONSE 401] Unauthorized, wrong password.")
            return res.status(401).json({error: "Unauthorized, wrong password."})
        }
    }else if (mode == "dashboard"){
        const password = process.env.DASHBOARD_KEY
        if(await verify_password(value, password)){
            const hashedGuestKey = await saltPassword(process.env.GUEST_KEY)
            console.log(hashedGuestKey)
            let response = {guestKey: hashedGuestKey, guest_state_key: process.env.GUEST_STATE_KEY, dashboard_state_key: process.env.DASHBOARD_STATE_KEY}
            return res.status(200).json(response)
        }else{
            console.error("[RESPONSE 401] Unauthorized, wrong password.")
            return res.status(401).json({error: "Unauthorized, wrong password."})
        }
    }else{
        console.error("[RESPONSE 401] Login call with not existing mode")
        return res.status(401).json({error: "Unauthorized, mode not existing"})
    }
});

app.use((req, res, next) => {
    return res.status(404).json({
        error: "Not Found",
    });
});

module.exports.handler = serverless(app);
