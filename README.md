![](docs/img/logo.png)


This repository contains a small REST-Api built on serverless infrastructure (AWS) for wedding websites.
It includes a `/presents` and a `/confirmation` endpoint with CRUD options.

> 🚧 **Warning:**<br>
> The current version (0.1) is more like a "proof-of-concept". It works, also is currently being used for my own wedding,
> but it isn't well designed yet. The plans for the future will be discussed in the section **Further Development**

## Prerequisites

This API is built upon:
- [![](https://api.iconify.design/logos:serverless.svg) The Serverless Framwork]()
- [![](https://api.iconify.design/logos:aws-lambda.svg) AWS Lambda]()
- [![](https://api.iconify.design/logos:aws-dynamodb.svg) DynamoDB]()

The tests are written with:
- [![](https://api.iconify.design/simple-icons:pytest.svg) Pytest]()
- [Pytest BDD]()
- [Locust]()

If you are not familiar with these technologies, please take some time to watch some videos, take a look at their documentation, or just try it out.

## Your Wedding API

Clone this repository, add the environment variables described in `serverless.yaml:45-50`. Additionally you should change the org name in the first line.
```bash
git clone 
```
To launch an offline version of the serverless wedding api, you can use the command: 
```bash
sls offline
```
To publish your API you need to have a **serverless** as well as 
an **Amazon AWS** account. 
```bash
serverless deploy
```

> 💸 **If you think about your money...:** <br>
> This project is, and also will be designed in a way that it should be *completly free*. AWS Lambda as well as Dynamo DB offer a livelong free tier which should (under normal circumstances) be more than enough for such a small thing as a **wedding-api**.


## Endpoints:

### ![](https://api.iconify.design/material-symbols:lock-sharp.svg?color=%23e0edd4) Authorization:
Each endpoint is currently secured by a set password.
This password is set in the Authentication Header:
```
{"Authorization": "HASHED_PASSWORD"}
```
The password should be hashed by bcrypt.

### ![](https://api.iconify.design/game-icons:present.svg?color=%23e0edd4) Presents
```
GET|POST|DELETE|PUT     /{STAGE}/presents
```

To create a new present, the **POST** operation needs to be used with the following body (as example):
```json
{
    "present_title": "Some Present",
    "img_url": "https://i.imgur.com/7X6xELp.png",
    "product_url": "https://imgur.com/gallery/rbJXExL",
    "bought": false
}
```
To mark an present entry as **bought**, one can use the **PUT** request with the following body:
```json
{
    "bought": true,
    "presentId": "fc664821-d195-4b82-bdc4-a5705973422e"
}
```
Deleting a present requires the `presentId` as query parameter:
```
    DELETE /presents?presentId=82cc1332-bd76-4ba7-b855-a99a4a01d4ff
```

The **GET** request return **all** presents as a list which looks like this:
```json
[
    {
        "presentId": "fc664821-d195-4b82-bdc4-a5705973422e"
        "presentTitle": "Some Present",
        "imgUrl": "https://i.imgur.com/7X6xELp.png",
        "productUrl": "https://imgur.com/gallery/rbJXExL",
        "bought": true
    },
    {
        ...
    }
]
```

### ![](https://api.iconify.design/mdi:account-multiple-check.svg?color=%23e0edd4) Confirmations
```
GET|POST|PUT|DELETE     /{STAGE}/confirmations
```

To create a new confirmation the **POST** operation needs to be used with the following body:
```json
{
    "name": "Jack",
    "surname": "Dillen",
    "attending": true,
    "eating": "carnivore",
    "allergies": "",
    "textfield": ""
}
```
To update a confirmation, you can use the **PUT** operation and add the `confirmationId` to the body:
```json
{
    "confirmationId": "54ff474f-f501-4a38-ba75-cac1babdc07b",
    "name": "Jack",
    ...
}
```
Deleting it requires the `confirmationId` as a query parameter:
```
DELETE /{STAGE}/confirmations?confirmationId=54ff474f-f501-4a38-ba75-cac1babdc07b
```

The **GET** request return **all** confirmations as a list which looks like this:
```json
[
    {
        "confirmationId": "54ff474f-f501-4a38-ba75-cac1babdc07b"
        "name": "Jack",
        "surname": "Dillen",
        "attending": true,
        "eating": "carnivore",
        "allergies": "",
        "textfield": ""
    },
    {
        ...
    }
]
```


## Future Plans 

- [ ] Refactoring of the whole project
    - [ ] Models for API Gateway
    - [ ] Seperating API handling from Database handling
    - [ ] more undefined things
- [ ] Simple "account" system
- [ ] Sending E-Mail Notifications
- [ ] Image Recognition (probably outside of AWS)
- [ ] more features?

## Other things to tell

I think most / all of the important bits are said and done. If you're stumbled upon this repository, because you are also going to marry: <br> **Congrats!** Nice that you are taking this step! 

## Licence

So yeah, you can use it :) If you have way to much money, and wanna give something back, you can pay my next teapod ;) (So not the pod but the tea :D).