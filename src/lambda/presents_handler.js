const AWS = require("aws-sdk");
const express = require("express");
const serverless = require("serverless-http");
const uuid = require('uuid')
var cors = require('cors')
const { verify_password } = require("../utils/login");
const { application } = require("express");
var corsOptions = {
  //origin: 'http://localhost:8000',
  origin: ['https://beta.samuel-und-hannah.de', 'http://localhost:8000', 'https://samuel-und-hannah.de'],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
}

const app = express();

const PRESENTS_TABLE = process.env.PRESENTS_TABLE;

let options = {}
if (process.env.IS_OFFLINE){
  options = {
    region: 'localhost',
    endpoint: 'http://localhost:9998'
  }
}
const dynamoDbClient = new AWS.DynamoDB.DocumentClient(options);

app.use(express.json());
app.use(cors(corsOptions))


app.options('/presents', cors(corsOptions))


app.get("/presents", async function (req, res) {
  const { authorization: password } = req.headers;
  if (! await verify_password(password,process.env.GUEST_KEY)){
      return res.status(401).json({error: "Unauthorized"})
  }

  const params = {
    TableName: PRESENTS_TABLE,
  };
  let scanResults = [];
  let items;

  try {
    do {
      items = await dynamoDbClient.scan(params).promise();
      items.Items.forEach((item) => scanResults.push(item));
      params.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey != "undefined");
    res.json(items.Items)
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An Error occurred while scanning for all presents" });
  }
});

app.post("/presents", async function (req, res) {
  const { authorization: password } = req.headers;
  if (! await verify_password(password,process.env.DASHBOARD_KEY)){
      return res.status(401).json({error: "Unauthorized"})
  }

  const { present_title, img_url, product_url, bought } = req.body;
  if (typeof present_title !== "string") {
    return res.status(400).json({ error: '"present_title" must be a string' });
  } else if (typeof img_url !== "string") {
    return res.status(400).json({ error: '"img_url" must be a string' });
  } else if (typeof product_url !== "string") {
    return res.status(400).json({ error: '"product_url" must be a string' });
  } else if (typeof bought !== "boolean") {
    return res.status(400).json({ error: '"bought" must be a boolean' }); 
  }

  present_id = uuid.v4()
  const params = {
    TableName: PRESENTS_TABLE,
    Item: {
      presentId: present_id,
      presentTitle: present_title,
      imgUrl: img_url,
      productUrl: product_url,
      bought: bought
    },
  };

  try {
    await dynamoDbClient.put(params).promise();
    res.status(201).json({ present_id, present_title, img_url, product_url, bought });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not create present" });
  }
});


app.delete("/presents", async function (req, res){
  const { authorization: password } = req.headers;
  if (! await verify_password(password,process.env.DASHBOARD_KEY)){
      return res.status(401).json({error: "Unauthorized"})
  }

  const params = {
    TableName: PRESENTS_TABLE,
    Key: {
      presentId: req.query.presentId,
    },
    ReturnValues: 'ALL_OLD'
  };
  try {
    const deletedInfo = await dynamoDbClient.delete(params).promise();
    const result = deletedInfo.$response.data
    const error = deletedInfo.$response.error
    console.log(error)
    if (!deletedInfo.Attributes) {
      throw new Error('Cannot delete item that does not exist')
    }
    res.status(204).json({data: "Item deleted"})
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not delete Present" });
  }
});

app.put("/presents", async function (req, res){
  const { authorization: password } = req.headers;
  if (! await verify_password(password,process.env.GUEST_KEY)){
      return res.status(401).json({error: "Unauthorized"})
  }

  const { bought, presentId} = req.body
  if (typeof(bought) !== "boolean"){
    res.status(400).json({error: '"bought" must be of type "boolean"'})
  }
  const params = {
    TableName: PRESENTS_TABLE,
    Key: {
      presentId: presentId,
    },
    UpdateExpression: "set bought = :bought",
    ExpressionAttributeValues:{
      ":bought" : bought
    },
    ReturnValues: "ALL_NEW"
  }

  try{
    const {data} =  await dynamoDbClient.update(params).promise()
    res.status(204).json(data)
  }catch(error){
    console.log(error);
    res.status(500).json({error: "Could not update present with the id" + presentId})
  }
});


app.post("/presents/buy", async function(req, res){
  const { authorization: password } = req.headers;
  if( !await verify_password(password, process.env.GUEST_KEY)){
    return res.status(401).json({error: "Unauthorized."})
  }

  const { bought, presentId} = req.body
  if (typeof(bought) !== "boolean"){
    return res.status(400).json({error: '"bought" must be of type "boolean"'})
  }

  //Get Present by ID and check if it has already been bought.



  const params = {
    TableName: PRESENTS_TABLE,
    Key: {
      presentId: presentId,
    },
    UpdateExpression: "set bought = :bought",
    ExpressionAttributeValues:{
      ":bought" : bought
    },
    ReturnValues: "ALL_NEW"
  }

  try{
    const {data} =  await dynamoDbClient.update(params).promise()
    res.status(204).json(data)
  }catch(error){
    console.log(error);
    res.status(500).json({error: "Could not update present with the id" + presentId})
  }
})

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});



module.exports.handler = serverless(app);
