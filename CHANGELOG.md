# Changelog

All notable changes will be documented in this file.

## Betaphase

## [0.1.0b] - 2022-12-16

🎉 This is the initial commit / first working version of the API.
It includes 3 Endpoints:
- `/presents` (GET, POST, PUT, DELETE)
- `/confirmations` (GET, POST, PUT, DELETE)
- `/login` (POST)

Testsuite includes 2 methods:
- Pytest BDD servicetest
- locust loadtest

The endpoints are secured by a Authorization header, please take a look at the README.md
for more information. 

🚧 Though this is a completely working version, I would like to add the disclaimer, that
it is more like a proof-of-concept, than a finished product. When the version tag **1.0.0** is reached,
it will reach a "stable" / "cleaned-up" version.
