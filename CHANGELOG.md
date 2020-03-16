# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## 2.0.0 (2020-03-16)


### ⚠ BREAKING CHANGES

* add restriction on delrep command

### Features

* add djs docs command + deps ([906d24e](https://gitlab.com/highspeed-gaming/hsg-bot/commit/906d24e25cfd2e4df2181d81a8e0df03c1d1e3f0))
* add doesRoleExistOnGuild function ([0b3fa95](https://gitlab.com/highspeed-gaming/hsg-bot/commit/0b3fa9590bdbd0a75dfdee5c16d2faed121b6918))
* add log for guildCreate ([12dcc77](https://gitlab.com/highspeed-gaming/hsg-bot/commit/12dcc77a8ba0f575cbffba45ede4f9b539532412))
* add optional reason argument to report ([9bb71a3](https://gitlab.com/highspeed-gaming/hsg-bot/commit/9bb71a3443cb36f5f642636be2559acfccc16d8c))
* botinfo commmand ([5181db4](https://gitlab.com/highspeed-gaming/hsg-bot/commit/5181db461a60eaa0dd504342a0d625a75f938d31))
* delete report command ([5b58b3c](https://gitlab.com/highspeed-gaming/hsg-bot/commit/5b58b3cfc0deb17475e2b2ac5d4a7a44bba365e4))
* heroku :o ([e9d5c67](https://gitlab.com/highspeed-gaming/hsg-bot/commit/e9d5c6771c78d903c62d206a9d5a5d20663e2bfa))
* init for report command ([4a5ee43](https://gitlab.com/highspeed-gaming/hsg-bot/commit/4a5ee43e9637ced2ec8c02e5c0f70bee38c20611))
* message handler for suggestion reactions ([5bd66a7](https://gitlab.com/highspeed-gaming/hsg-bot/commit/5bd66a74f8596c2a6b77129581cc95587b36f988))
* purge command ([e8cd3ba](https://gitlab.com/highspeed-gaming/hsg-bot/commit/e8cd3bafc6dcd95bb66ac4849c89df120f0f90b2))
* support for custom rpz setting ([2d2f004](https://gitlab.com/highspeed-gaming/hsg-bot/commit/2d2f004dc29602f48cbb59a96f5d1b545f943bb4))
* **report:** logging & more improvements ([9cc5b57](https://gitlab.com/highspeed-gaming/hsg-bot/commit/9cc5b572605e757015b705ec9d497e24d1e3b3d7))
* staff directory command ([c86fcef](https://gitlab.com/highspeed-gaming/hsg-bot/commit/c86fcef6f3b422169f6555b1ab3513c9e80f7303))
* support for roleIds (string|string[]) ([810b45a](https://gitlab.com/highspeed-gaming/hsg-bot/commit/810b45adf0b9cc61f8d45831b78ff94a554d8cd0))
* when showing members in staff dir, mention them ([a1e13fd](https://gitlab.com/highspeed-gaming/hsg-bot/commit/a1e13fd757f3c6ccc16c3d623e711d7481795266))


### Bug Fixes

* add restriction on delrep command ([664bd7d](https://gitlab.com/highspeed-gaming/hsg-bot/commit/664bd7d08d4bdda43be4a0f0e4a28f647152ccaa))
* add restrictions accordingly on certain commands ([6340edb](https://gitlab.com/highspeed-gaming/hsg-bot/commit/6340edbc6bc26b66d3f6d49113faa67536eeb8a7))
* add timestamp to embed ([c14db07](https://gitlab.com/highspeed-gaming/hsg-bot/commit/c14db0735fb71924da4e2b3cc1af6553720d006c))
* assigning type issue with report ([53e43cc](https://gitlab.com/highspeed-gaming/hsg-bot/commit/53e43ccf63dd2ba6c57a6da2f81e35fa1d053a8c))
* calling of method on undefined object ([cade61f](https://gitlab.com/highspeed-gaming/hsg-bot/commit/cade61f7b8876899414e0bf0abdbe3bcd5364eb9))
* change patter to project ([a831d44](https://gitlab.com/highspeed-gaming/hsg-bot/commit/a831d44049d068e3c79873f77bf1df28f49fc31a))
* changes to abide tslint changes ([559fad0](https://gitlab.com/highspeed-gaming/hsg-bot/commit/559fad06b09850d564c9ce69757510ae4f9e19a9))
* channel permissions for newly created report channel ([757f268](https://gitlab.com/highspeed-gaming/hsg-bot/commit/757f26821207e28163dae93ea152468cf163fe44))
* channel permissions so initiator can see read ([85500d9](https://gitlab.com/highspeed-gaming/hsg-bot/commit/85500d90d65a35704a1770a2f8833b4ac09ef45f))
* double-logging of report deletion ([1eb5775](https://gitlab.com/highspeed-gaming/hsg-bot/commit/1eb5775d4c4119070f9806068a4cf1b286390991))
* i am idiot ([ab022e3](https://gitlab.com/highspeed-gaming/hsg-bot/commit/ab022e32926f72a01b9d412a519c104d621ea163))
* inline auth & rpz for status updater ([cb7f1d1](https://gitlab.com/highspeed-gaming/hsg-bot/commit/cb7f1d10a51e4f94fb6df0dd803657416226e394))
* it's 2020 idiot ([a9d8971](https://gitlab.com/highspeed-gaming/hsg-bot/commit/a9d89710b4563379a23c31d31aba20aeea70d93a))
* lock permissions to channel ([9dcf5c9](https://gitlab.com/highspeed-gaming/hsg-bot/commit/9dcf5c93f3ddad99a327282a44e377e78771a40e))
* return empty array for fetchMembersForRole func ([b8e75ac](https://gitlab.com/highspeed-gaming/hsg-bot/commit/b8e75ac189b08909226ed4860e576fa633e82cc6))
* rpz setting? ([769d583](https://gitlab.com/highspeed-gaming/hsg-bot/commit/769d583b527d5df9c3e7518a63d18487743e6b25))
* status updater running when logStatus is false ([ff8d685](https://gitlab.com/highspeed-gaming/hsg-bot/commit/ff8d6853f3234a4601d16103f3c9d360767e62cf))
* support for role id in debug cmd ([ba45b25](https://gitlab.com/highspeed-gaming/hsg-bot/commit/ba45b253baa9b14e8e18ac9f1578a7d687451a31))
* update path for tslint config ([e3fa4f6](https://gitlab.com/highspeed-gaming/hsg-bot/commit/e3fa4f6087884f25a7e359a450546610b16275b5))
* use toLowerCase() with getting role by name ([a0dfe8f](https://gitlab.com/highspeed-gaming/hsg-bot/commit/a0dfe8f00aa9ebc218c30b84b145aafcb75477d4))
* when comparing current index from find, use toLowerCase() ([edf7c2d](https://gitlab.com/highspeed-gaming/hsg-bot/commit/edf7c2d05f827889c8fdc3cf2cfc1b04da040d33))
* workflow for tslint ([0fba79c](https://gitlab.com/highspeed-gaming/hsg-bot/commit/0fba79ca499adb1ac3672af9e8e03652bc1c5e1c))
* workflow preparation ([030d025](https://gitlab.com/highspeed-gaming/hsg-bot/commit/030d0256f57082d82bd3d70ab9275014250311f6))
* **doc:** update example for IServerDataStruct interface ([8a07e19](https://gitlab.com/highspeed-gaming/hsg-bot/commit/8a07e193697ee2379be93fab1d6ba2458de86d7c))
* **staff:** append 'DV' to development ([436b0dd](https://gitlab.com/highspeed-gaming/hsg-bot/commit/436b0dd5c27c7d05663ec7008288866f89726fe5))
* update roleIds for development ([3591691](https://gitlab.com/highspeed-gaming/hsg-bot/commit/35916918bb1a8c4d18fc9812d3538e54a68a59ff))
