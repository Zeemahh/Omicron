# Contributing
1. Clone repository.
2. Create feature branch.
3. Install dependencies (`npm install -D`).
4. Create a file named `.env` (exact!).
    - In this file, you need to define some values with certain keys:
        * `BOT_TOKEN` [required] - Discord bot token.
        * `PREFIX` - Prefix, defaults to `p.`.
        * `AUTO_STATUS` - Determines whether to run the automatic status updater.
        * `BUILD` - Should be `dev` to receive debug prints.
5. Make changes.
6. Commit to branch and make PR.
