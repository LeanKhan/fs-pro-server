## FS PRO Game Server!

FSPro server is a game engine thing for a football fantasy game.
The frontend is on its way.

─=≡Σ((( つ o3o)つ

---

### Project top-level directory structure

```
src
    ├── classes                    #  Single entity objects like Player and Club
    ├── controllers                #  Things that interact with different parts of the app
    ├── state                      # Game state files
    ├── helpers                    # helper functions
    ├── models                     # databases entity models
    ├── interfaces                 # things that describe the classes and other game entities
    ├── services                   # functions that interface with the database directly
    ├── routers                    # api endpoints are defined here
    ├── utils                      # functions and functions

    server.ts                      # App entry i.e where the magic happens

```

#### Setup Dotenv

## A .env file is used to store configuration files especialy about development and testing.

#### Guide to use dotenv in this project

- Install dotenv package as a project dependency using "npm install dotenv" or "yarn add dotenv"
- Create .env file in project root directory.
- Add environment variables to .env file as seen in the .env.example file in the root folder.

<!-- ##### Test Driven
Tests are written with mocha, chai-http and chai. -->

#### This is going to be _EPIC_ Our goal is for FSPro to be the best open source football fantasy game. We will do it, I have the best team :)

### Stack:

FSPro game server is written in TypeScript.

- Node + Express - Typescript
- MongoDB for database

There is an incomplete (like this) Client app tho https://github.com/LeanKhan/fs-pro-server

You can check it out too...

### HOW TO CONTRIBUTE

Goto the repo and read the CONTRIBUTING.md file to get started.
TBH just do anything you want if it makes sense :)

### Important...

So you might need images for your clubs and for the app. Download this .zip file and unpack it in the /assets folder (create it if not there already).
So that you have assets/img/... don't forget to move the img folder inside the zip to the assets folder gan

This folder has the game logo and club logos. Of course, you can use your own club logos.

The folder: https://drive.google.com/file/d/1ZohZLDTaT9owSKY_OWA7Y5UgBqvghR0q/view?usp=sharing

### License

ISC License

### Issues

- Attackers chance to shoot should be determined by a percentage
- Tackling is imporved
