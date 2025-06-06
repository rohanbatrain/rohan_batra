'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"blog/th/categories/index.xml": "0d0943d5f018458acef50b40b051657c",
"blog/th/sitemap.xml": "b66dc69521625dc965465525495c3df4",
"blog/th/index.xml": "38abad8605345f7e4a6bdb97d6502f70",
"blog/th/index.html": "d41d8cd98f00b204e9800998ecf8427e",
"blog/th/tags/index.xml": "a70854a5622bf0a0e481bb3954013f2c",
"blog/de/categories/index.xml": "8badbc5e54b10adabf5cd6e2f4004530",
"blog/de/sitemap.xml": "8931b4f9eb0a09a3075bd85cc52d7433",
"blog/de/index.xml": "e492ed507d00ebdbacce8533b6149d55",
"blog/de/index.html": "d41d8cd98f00b204e9800998ecf8427e",
"blog/de/tags/index.xml": "35b602bd2b1e692bf1bf9873c84ab0cc",
"blog/sitemap.xml": "c84ff1c11d1ed22790cea00b2f22ebc0",
"blog/pt/categories/index.xml": "58dd5c95e2f9f105879919e7e60cb334",
"blog/pt/sitemap.xml": "e3050e2ded198fef843865f38774f848",
"blog/pt/index.xml": "e69a98ccd074d1588b297b09755bcc09",
"blog/pt/index.html": "d41d8cd98f00b204e9800998ecf8427e",
"blog/pt/tags/index.xml": "ecf1c05bd5c5a7fa4017ca9f2325fe1f",
"blog/fr/categories/index.xml": "f1530713f6efdbd88c7a553138ff28e4",
"blog/fr/sitemap.xml": "35e4aea90acb4aaf899e6877be2549e7",
"blog/fr/index.xml": "dc3e6cf6d2f9853eff806138d4221b90",
"blog/fr/index.html": "d41d8cd98f00b204e9800998ecf8427e",
"blog/fr/tags/index.xml": "d0ccc979dbab486fb5e53a735925cf81",
"blog/es/categories/index.xml": "41bfc0d653b13726cffed37d3d9da0fa",
"blog/es/sitemap.xml": "b186bde779b3a4898f039a076e57684f",
"blog/es/index.xml": "8fa9a8c6692472c363ef40821c7b1a45",
"blog/es/index.html": "d41d8cd98f00b204e9800998ecf8427e",
"blog/es/tags/index.xml": "566651c72dba762f7f1fbb31c7ce1006",
"blog/en/categories/index.xml": "747f4afad291590e04d9ccbef35061eb",
"blog/en/fiction/characters/raunak/index.xml": "21981692862bb3e8cd206bdc738cb9c8",
"blog/en/fiction/characters/raunak/journal/index.xml": "7e80a7e553bcac09225b280503b1d335",
"blog/en/fiction/characters/prisha/index.xml": "906e842cf06780280b7c6e42c479e0e3",
"blog/en/fiction/characters/prisha/journal/index.xml": "8df7cbbc9756804cda14961593eeb7e2",
"blog/en/fiction/characters/index.xml": "6bc593dea3891232114681f8d3ee3061",
"blog/en/fiction/books/index.xml": "86fb04b680bed96d4c39e809d5693be5",
"blog/en/fiction/index.xml": "22ab2f31d294b913b7b9d465829ce23d",
"blog/en/sitemap.xml": "6d025016f496cca93f3947666893fef9",
"blog/en/index.xml": "4e3512def678e4530a98aa861d279209",
"blog/en/index.html": "d41d8cd98f00b204e9800998ecf8427e",
"blog/en/tags/index.xml": "abb0884c7a76730f6c5438b836966d2a",
"blog/hi/categories/index.xml": "da989befcb7250df9504e3ed3f55c5f8",
"blog/hi/sitemap.xml": "d1914858c8ccdb01f97fdc7caf553471",
"blog/hi/index.xml": "226f5f5923bcb533492baffb29775533",
"blog/hi/index.html": "d41d8cd98f00b204e9800998ecf8427e",
"blog/hi/tags/index.xml": "40a8b4e6307cfe90682be0ee958b5feb",
"blog/robots.txt": "6978a616c585d03cb5b542a891995efb",
"blog/index.html": "8b74b1e796d08993a27ee7c1c1e3b33b",
"blog/it/categories/index.xml": "cf90810e7975c63a62fa0b413188ae04",
"blog/it/sitemap.xml": "9412ea83bf00301ed26e9428b894796c",
"blog/it/index.xml": "a10f742fbba611ca43aa17a0f35ff336",
"blog/it/index.html": "d41d8cd98f00b204e9800998ecf8427e",
"blog/it/tags/index.xml": "d195e66203026bfe33ae972e1a7f9b93",
"icons/Icon-maskable-192.png": "1cc1c1ba587d820bb62573659810b4da",
"icons/Icon-192.png": "1cc1c1ba587d820bb62573659810b4da",
"icons/Icon-maskable-512.png": "4d76e81c29d15133067aac7aac3feecc",
"icons/Icon-512.png": "4d76e81c29d15133067aac7aac3feecc",
"assets/fonts/MaterialIcons-Regular.otf": "b9d283e56b8054a0a911fdafd378b79c",
"assets/AssetManifest.bin.json": "16f4589724985f13cc9726ecdca6edd2",
"assets/AssetManifest.bin": "1057291191292c07752f9a8172230d2b",
"assets/AssetManifest.json": "ca60bcacce091f0d65fc9277efdb8a85",
"assets/assets/icons/icon_back-arrow-dark-bg.png": "701a2acc1504e140f334626d53cae97b",
"assets/assets/icons/icon_back-arrow-light-bg.png": "17e7df4d1ecef05e18d9a27da0c5f286",
"assets/assets/icons/icon_navbar-light-bg.png": "91c513e7206735546a62aed3407b6b87",
"assets/assets/icons/icon_navbar-dark-bg.png": "f4af44f6d17e3a39fa87f7233578661e",
"assets/assets/animations/research.json": "54ee98d4ac30f113165f722d99b78f83",
"assets/assets/animations/contactus.json": "faa0c7bfe1a5dd12c2ad32908dc76a69",
"assets/assets/animations/5b6C8UQeUj.json": "380d77dc0d78685b402110b89de45853",
"assets/assets/animations/professional.json": "8904e8adcb0c36c4f5cddc7a524425fe",
"assets/assets/animations/GGN8CoO0KB.json": "45fe44c0b7210d1569d89e1e037b7b1e",
"assets/assets/animations/education.json": "b2427969de30bb0d33e065d1e6945487",
"assets/assets/animations/loading.json": "93cc8a057a539413f28b64337958aff1",
"assets/assets/animations/IceAcvKhR4.json": "3fb1536e79790744dfd0cabacec02419",
"assets/assets/animations/source-code.json": "d226dde48407e6b3122b575cf27a8189",
"assets/assets/animations/portfolio.json": "3480f34311a13c389e6cb33edee4ad8a",
"assets/assets/animations/about_me.json": "71d742c83a7f6806860b74e367031558",
"assets/assets/animations/pUBqZ5WbTy.json": "92ddcdad0eab0837683fe37fd92fba96",
"assets/assets/animations/developer.json": "609a9849dc518787dac1c0bd52628e94",
"assets/assets/animations/experience.json": "b9e0da5ef6d5fa0e4295681d9dac6595",
"assets/assets/animations/non-profit.json": "8383f853e9b6b16b0dc15944236309f5",
"assets/assets/animations/gBuOxKdbdC.json": "d0466971f5cbb18b8995ee865e4f8c79",
"assets/assets/animations/panda.json": "bc9d90526ecc21531764b2acde28de89",
"assets/assets/animations/writer.json": "0751790cceb5b96ec9f5d642f1817b05",
"assets/assets/animations/download.json": "f6d1f40e2f7b258bdae7d0816a0b9ff3",
"assets/assets/animations/iNi4lrRvEq.json": "446cf6c7fd8775928280cbcb0b942456",
"assets/assets/images/banners/branding-kit.jpg": "956a05988d54b80f262dee7e636cf3b4",
"assets/assets/images/banners/BGMI/2.png": "66ce018b26c3c3e130e565e98dbe4a5d",
"assets/assets/images/banners/BGMI/1.png": "caca100634c02c10d723f182f3bff62c",
"assets/assets/images/banners/karmstrot-builds/2.png": "de5285079a12e3e6eb3b307ef3c73066",
"assets/assets/images/banners/karmstrot-builds/1.png": "a723ee9927594095d8017e6978981efd",
"assets/assets/images/banners/Dwm/Light-Mode/1.png": "376ad4df0d573c452b40c47543d605bc",
"assets/assets/images/banners/Dwm/Dark-Mode/2.png": "8d759a976c191994dab5d31642b79f1d",
"assets/assets/images/banners/TWRP/2.png": "c980e2cbf6f8b153aef846fc6f8b6ec8",
"assets/assets/images/banners/TWRP/1.png": "ece8f00c17be32c67d4a29b7baadb363",
"assets/assets/images/banners/UnrealEngine/2.png": "c4363f0b608677b0aba6a61465e56bd5",
"assets/assets/images/banners/UnrealEngine/1.png": "0c1c9b3dcad6cbab9564f198bde100e8",
"assets/assets/images/banners/Alto-Adventure/2.png": "c0d4085c019bb22515619fb2f6f1c4c7",
"assets/assets/images/banners/Alto-Adventure/1.png": "131622e01b5165376f9e58007d6569b7",
"assets/assets/images/banners/blog/2.png": "c71cc7c3d561f0082a8774021f05611f",
"assets/assets/images/banners/blog/1.png": "504453433b0a70e00ac3f115676984ab",
"assets/assets/images/banners/SBDFS/Light-Mode/1.png": "931210c37443d62ac34638fc5e0b209e",
"assets/assets/images/banners/SBDFS/Dark-Mode/2.png": "68a87e6317e57c602c939b5eaf1ca9f4",
"assets/assets/images/banners/Second-Brain-Tools-2022/Light-Mode/1.png": "8aebf7a10a6fb0cd393ed46dbc05d085",
"assets/assets/images/banners/Second-Brain-Tools-2022/Dark-Mode/2.png": "244439c9eb0a6056081d61bf9e3a585e",
"assets/assets/images/banners/Renpy/2.png": "49f9c0c45d3407d0018bdce78b25d148",
"assets/assets/images/banners/Renpy/1.png": "ec708ccaa956c5296adf91acf547bd81",
"assets/assets/images/banners/Portfolio/Light-Mode/1.png": "97b40e0ce67339207cb5b6b17477ceb0",
"assets/assets/images/banners/Portfolio/Dark-Mode/2.png": "40afa8c34e0f1bf4da138d4747baa30e",
"assets/assets/images/banners/Clickup/2.png": "0013d744c5a9eda9c6f968f5779155db",
"assets/assets/images/banners/Clickup/1.png": "94b8e441ec660f90b66238efb2e2447a",
"assets/assets/images/banners/SP-FLASH-TOOL/2.png": "523255dbe757183c4989dab8b85bad39",
"assets/assets/images/banners/SP-FLASH-TOOL/1.png": "0d737b2cbb82ad34508dbd724016d0fa",
"assets/assets/images/banners/obsidian/2.png": "ea91f507be94a5690920be1f3e0c4ddd",
"assets/assets/images/banners/obsidian/1.png": "133dd7f0f62527d81fd83055e57a0bb0",
"assets/assets/images/banners/MTKCLIENT/2.png": "2845975543495c717aa4481c784e362f",
"assets/assets/images/banners/MTKCLIENT/1.png": "41202de941403c1e2efb864641404a7c",
"assets/assets/images/banners/Godot/2.png": "ab38a7804de8777742967f829e536fb3",
"assets/assets/images/banners/Godot/1.png": "a7d34205ac316e3ab32233a7117e6208",
"assets/assets/images/banners/Scripts/Light-Mode/1.png": "45701de100c9113ca86994d51f166a1c",
"assets/assets/images/banners/Scripts/Dark-Mode/2.png": "cb2f98294331fdb20a7164690fa60e9c",
"assets/assets/images/banners/Knowledge-Base/Light-Mode/1.png": "e0c13e889ff0bcdca268394d1aa12ca0",
"assets/assets/images/banners/Knowledge-Base/Dark-Mode/2.png": "a0a4a8267e43fd4402b1b12cc7d546f8",
"assets/assets/images/banners/Samsung-Odin/2.png": "e8d16f58bd6d30367d160464a86469fb",
"assets/assets/images/banners/Samsung-Odin/1.png": "4aaa91dc46825bd9f43a13f9253cd2a8",
"assets/assets/images/banners/OrangeFox/2.png": "2bf01918b10c4bd4470c332913ee339c",
"assets/assets/images/banners/OrangeFox/1.png": "ccc18a016d49d5382e56c19b9df00e9b",
"assets/assets/images/banners/Trello/2.png": "1fb39f18ba0b3ed48a62f7d720aedb2f",
"assets/assets/images/banners/Trello/1.png": "0ab0f9c6332cf63c26000c7d0361b2e7",
"assets/assets/images/banners/N8N/2.png": "33806e69801fcf7237d7e35e46a8f8fd",
"assets/assets/images/banners/N8N/1.png": "e4cb7bf9c324fdcaab722c72823f0d19",
"assets/assets/images/banners/Zapier/2.png": "b9e0105cf809d64a5cce81100d580aa7",
"assets/assets/images/banners/Zapier/1.png": "3fc04949c0ffea5440516201de861fe0",
"assets/assets/images/banners/marklang/2.png": "6830eb5e75ffeb70d152d7f43e2ae9ea",
"assets/assets/images/banners/marklang/1.png": "ff4d12eb3ea43e6ec6ad53a200d21a12",
"assets/assets/images/banners/THM/2.png": "f1fbef0fec98fa2dd9bcaf6f1f2bfa53",
"assets/assets/images/banners/THM/1.png": "cc1385491ed7cca12928b8addd887226",
"assets/assets/images/banners/Anno-1800/2.png": "fc01ecf5d48926f8dcca8ea98566c3dc",
"assets/assets/images/banners/Anno-1800/1.png": "bc8c37167515d07221f5b33e33585e50",
"assets/assets/images/banners/Ansible/2.png": "ae069513673843ddae7c0ebfe8a05b10",
"assets/assets/images/banners/Ansible/1.png": "85ba5ebecd085a779c860a002dc070ee",
"assets/assets/images/banners/Call-of-duty/2.png": "fd3c5752b905b6f04d34c806f691f508",
"assets/assets/images/banners/Call-of-duty/1.png": "0c3753e1f65bf6649d6fa3844835e3db",
"assets/assets/images/banners/supersu/2.png": "698287f7b03bd2268f4c3ebb8b323142",
"assets/assets/images/banners/supersu/1.png": "27255cd3bbfc22f0c1e0b601c83d7177",
"assets/assets/images/banners/Configs/2.png": "a7390f8daea9d6565efe963570deb995",
"assets/assets/images/banners/Configs/1.png": "4aaf6501089341c908b893689a6d6772",
"assets/assets/images/banners/Landing-Pages/Light-Mode/banner.png": "9bd7be76e4c30305bbb0849c4600f545",
"assets/assets/images/banners/Landing-Pages/Dark-Mode/banner.png": "5e523454ed4866f0ef4a61d69c4fe4d9",
"assets/assets/images/banners/Second-Brain-Database/Light-Mode/banner.png": "143d513d7840148c9062f4c7bd4e88ba",
"assets/assets/images/banners/Second-Brain-Database/Dark-Mode/banner.png": "d2c97ba90fea07debe83d99d93a717a5",
"assets/assets/images/banners/Second-Brain-Database-Telegram-Bot/Light-Mode/1.png": "8d03a0381a97a9dd2b04d3af51215873",
"assets/assets/images/banners/Second-Brain-Database-Telegram-Bot/Dark-Mode/2.png": "2d7ddaed6b25dd8783ff52c3f71c45ac",
"assets/assets/images/banners/Cachy-OS/2.png": "1809c17ca729aab564c8eb617fe06555",
"assets/assets/images/banners/Cachy-OS/1.png": "47dad1bddf3df75d4e1770b1a515c9fe",
"assets/assets/images/banners/Suckless-St/Light-Mode/2.png": "cd4e3483659b015edc4d9675e49eaff9",
"assets/assets/images/banners/Suckless-St/Dark-Mode/1.png": "b0834ff5ca6f1b8c5f8f5de2f8115cbb",
"assets/assets/images/banners/minecraft/2.png": "5884d797dc37858fd295eb9f830e16c0",
"assets/assets/images/banners/minecraft/1.png": "23a993890d4911767900f20792d57ab1",
"assets/assets/images/banners/clockify/2.png": "e617aaa8199e6da3a3a296e77df62423",
"assets/assets/images/banners/clockify/1.png": "f08c7b7156abbd683c49fa7bef8006cb",
"assets/assets/images/banners/Asana/2.png": "3b2f0ec951eb85f2d01f0eaff27afd7d",
"assets/assets/images/banners/Asana/1.png": "661b059215931522361f0116776368aa",
"assets/assets/images/banners/Unity/2.png": "eba09239d934194f17d722bdbcd00926",
"assets/assets/images/banners/Unity/1.png": "e232487184a03f8d6f3685aac4c90d68",
"assets/assets/images/banners/make/2.png": "1ac9efe6997d24035fb5aceb0fcd4dd9",
"assets/assets/images/banners/make/1.png": "0e56809d4fb4954fb31432610e0b6ddc",
"assets/assets/images/banners/SBD-Flutter-Template/Light-Mode/1.png": "cb4bffcccfbd718874d098fe709df604",
"assets/assets/images/banners/SBD-Flutter-Template/Dark-Mode/2.png": "d984dfaff395e8f5d61f04fe1371d91a",
"assets/assets/images/banners/Second-Brain-Database-Flutter-Frontend/Light-Mode/1.png": "05ad796f57a23543c6bc2b61cdbe72c1",
"assets/assets/images/banners/Second-Brain-Database-Flutter-Frontend/Dark-Mode/2.png": "99b62a99c3882d729264eedb983f6e20",
"assets/assets/images/banners/Second-Brain-2022/2.png": "13a1ee97a5372632234eeda49b0d0053",
"assets/assets/images/banners/Second-Brain-2022/1.png": "0f5c967ea2177e428e406dfd19694eaa",
"assets/assets/images/banners/FASTBOOT/2.png": "54b4f93e1628ff9556afc79d229c5f62",
"assets/assets/images/banners/FASTBOOT/1.png": "b85f388a5606bbf41a7c0b24dec7139d",
"assets/assets/images/banners/Garuda-Linux/2.png": "1343f05ae84e38784d4d14fc8cfac6f9",
"assets/assets/images/banners/Garuda-Linux/1.png": "39f4ded53bbdd9d921978ec7ccae4c89",
"assets/assets/images/banners/Magisk/2.png": "f617aeaf5ec9157bef8664628f6bba07",
"assets/assets/images/banners/Magisk/1.png": "f36e3fd5ddb1194da113df19e5fbf659",
"assets/assets/images/banners/Debian-Linux/2.png": "9e579d3d60caf61ebe15b2bc3e636dcf",
"assets/assets/images/banners/Debian-Linux/1.png": "2dbd407f7d49562f5d85421cb26e2814",
"assets/assets/images/banners/Monday/2.png": "334da6df9fea6aa06f861ac7184622ee",
"assets/assets/images/banners/Monday/1.png": "d85bb2974befe525aa6d282b2f5ffa1b",
"assets/assets/images/banners/Kali-Linux/2.png": "3e05cfa1bef0ad4fe63f709ae28f4b21",
"assets/assets/images/banners/Kali-Linux/1.png": "f65b856e0480fee31c223044a15c0584",
"assets/assets/images/banners/Dmenu/Light-Mode/1.png": "0caa8567de2dbfd5c14dbf9bc00ee8c1",
"assets/assets/images/banners/Dmenu/Dark-Mode/2.png": "2d211eafbd59eb3a1a30454bc2b9240c",
"assets/assets/images/banners/ifttt/2.png": "51369d69c9fae56974cf534d9c8455d4",
"assets/assets/images/banners/ifttt/1.png": "64c135b614d0514a1e17c6c503f64689",
"assets/assets/images/banners/Github-Actions/2.png": "d52209187bf541322be291106176d5fa",
"assets/assets/images/banners/Github-Actions/1.png": "e594ff7efd15275965d7c43f708c4a1a",
"assets/assets/images/banners/Emotion-Tracker/Light-Mode/banner.png": "26db3bc01840c6eda3aaad04785ae8cb",
"assets/assets/images/banners/Emotion-Tracker/Dark-Mode/banner.png": "79067df63c4358192dab770d2fe7d454",
"assets/assets/images/banners/ANDROID/2.png": "3826fca74aafb11cc79d56d41027110c",
"assets/assets/images/banners/ANDROID/1.png": "832a60d3f9a3e6226e27ec6b55225c02",
"assets/assets/images/banners/MSM/2.png": "3cd6876a4efe1d8113f12bf35ba3c30e",
"assets/assets/images/banners/MSM/1.png": "d943291e50712e7ecaecbd42d017611e",
"assets/assets/images/banners/proxmox-auto-install-assistant-docker/2.png": "11ac2b07b05be99ab9af9b76cd93d86b",
"assets/assets/images/banners/proxmox-auto-install-assistant-docker/1.png": "7bcd0122c4f044e2f8025f9cdcd807ae",
"assets/assets/images/banners/Proxmox/2.png": "8edd7cfe5365437a0861eaff7064f214",
"assets/assets/images/banners/Proxmox/darkmode-banner.png": "d4a2589defbe79258403f524d7b26cc4",
"assets/assets/images/banners/Proxmox/1.png": "5119761af4597bc5e51c6bdbc9b296a2",
"assets/assets/images/banners/Proxmox/lightmode-banner.png": "b0f08ad2bb721b909e0a079043d29106",
"assets/assets/images/banners/Selenium/2.png": "64dea18cf81a92aca649030d24bb6db3",
"assets/assets/images/banners/Selenium/1.png": "1692559dfe7dfe31bef616a0308749c9",
"assets/assets/images/banners/Arch-Linux/2.png": "955e230ab019c7a8c009a9c83557e323",
"assets/assets/images/banners/Arch-Linux/1.png": "7c8e6248540448c0d87a42bdc8907696",
"assets/assets/images/banners/Arch-Linux-and-Manjaro/2.png": "4c1166735c2c75b5a2bcef39fddff74d",
"assets/assets/images/banners/Arch-Linux-and-Manjaro/1.png": "81b2af963d3f4da772bb6ac8981032a3",
"assets/assets/images/certificates/UPES/certificate1.jpg": "67cab6754d1ade7c8334b0229b955964",
"assets/assets/images/certificates/certificate5.jpg": "8d21e701d8a819ebe81ad9a8440f1d52",
"assets/assets/images/certificates/certificate7.jpg": "77ec8f85b5e0fc3cb67000064dc7a489",
"assets/assets/images/certificates/UBSA/1.jpg": "4157c3ff334b34e7ead7e2dfd1a884a5",
"assets/assets/images/certificates/certificate1.jpg": "d4d4efa374a76c85d66f286cf9be16eb",
"assets/assets/images/certificates/E-CELL/Eureka-2021-22.png": "5f8f6c2b51d35d0df6db2747e30828b2",
"assets/assets/images/certificates/E-CELL/workshop.jpg": "3845fdd3d5cac2808e2272791aae4c68",
"assets/assets/images/certificates/E-CELL/Eureka-2022-23.png": "2b9451fd4c9fbe25e75837fb1fc5f43f",
"assets/assets/images/certificates/UNSW/certificate1.jpg": "04174fa99ad780f8baa4e3ef102c3130",
"assets/assets/images/certificates/UNSW/certificate2.jpg": "7b5fcda5de4ca226d832c88260c0b7a2",
"assets/assets/images/certificates/TERI/certificate1.jpg": "545d0616ba856c532d8261bcf37bf432",
"assets/assets/images/certificates/SOF/certificate-nso-5.jpg": "4b64f5361181e73825931d88f025a6fe",
"assets/assets/images/certificates/SOF/certificate-imo-5.jpg": "45bd7842ecf1ba2da5dce281e48afebd",
"assets/assets/images/certificates/SOF/certificate-nso-7.jpg": "aacabdae2fc0f0439e5405cdfbe97909",
"assets/assets/images/certificates/SOF/certificate-imo-6.jpg": "6ed81b6c0b5ed71c3785fdb64684623b",
"assets/assets/images/certificates/SOF/certificate-imo-4.jpg": "20afde6f134d9e8ce56e027394788e95",
"assets/assets/images/certificates/SOF/certificate-nco-4.jpg": "9fcc7d4d329652c417efe6ef42886968",
"assets/assets/images/certificates/SOF/certificate-nco-3.jpg": "74fa5da2e0e154797167b3310851008f",
"assets/assets/images/certificates/SOF/certificate-nco-5.jpg": "9cc70fb8df296a82e716424dad677f2b",
"assets/assets/images/certificates/SOF/certificate-imo-7.jpg": "9f01fd089e5f82a3b6ea06d3469a5c4b",
"assets/assets/images/certificates/SOF/certificate-nso-6.jpg": "e9df862e47dca8c4af811ef25576f9bd",
"assets/assets/images/certificates/IAF/2.jpg": "ead31892f9e2c9e45180a2110a9c5cd5",
"assets/assets/images/certificates/IAF/1.jpg": "1a9382d69f69e7f245d76ecc4ccc0454",
"assets/assets/images/certificates/IAF/3.jpg": "30eb227ee9badab6a1a636265331ccc3",
"assets/assets/images/certificates/certificate6.jpg": "9b770c6dae3670e36394162e03dc4cd7",
"assets/assets/images/certificates/certificate2.jpg": "5012be8e5940a107130f566c3ce04240",
"assets/assets/images/certificates/certificate3.jpg": "087b69f61b724c5a16b1d32a7a58e784",
"assets/assets/images/certificates/NAO/certificate1.jpg": "5eb81c84b01fbf13f442b57417374e2d",
"assets/assets/images/certificates/certificate4.jpg": "4346925ef9bb79c70c22ec934b253f23",
"assets/assets/images/certificates/Caring-Souls/1.jpg": "bc335a525037a10dfef19b2fdaba0d99",
"assets/assets/images/certificates/Pentasoft/certificate1.jpg": "8f286631ff2af798da8595472429353a",
"assets/assets/images/certificates/Pentasoft/certificate2.jpg": "d49cfee5f04c26cdcb3feae7c8b4902b",
"assets/assets/logos/Ravage-Gamer/Mascots/Mascot.png": "ebede3931b4e70cd37c43e0f6342c912",
"assets/assets/logos/UPES/UPES2.png": "0d7c5c017056fdea6841b0af7e0a98b0",
"assets/assets/logos/UPES/UPES1.png": "9d20c306a1d87359e3c2488854fb6cf0",
"assets/assets/logos/Indian-Armed-Forces/logo.png": "d3f37cd69d9aaa7634fa8ff960b3c542",
"assets/assets/logos/Rohan-Batra-FOSS/Light-Mode/logo2.png": "524bc0611aaad43f1c23ece097ed224d",
"assets/assets/logos/Rohan-Batra-FOSS/Light-Mode/logo3.png": "f2bcbfa7a140e4cddd6925d113d1d78a",
"assets/assets/logos/Rohan-Batra-FOSS/Light-Mode/logo.png": "aa9a072a84d6142231883a04b6d8fd61",
"assets/assets/logos/Rohan-Batra-FOSS/Dark-Mode/logo2.png": "95fdf2ccc38e7fc9e7096f78235ea417",
"assets/assets/logos/Rohan-Batra-FOSS/Dark-Mode/logo3.png": "153284e4fd35d2ff8a2073063c1424f6",
"assets/assets/logos/Rohan-Batra-FOSS/Dark-Mode/logo.png": "e8038eb6fc30f97cdcd1e1433985a18d",
"assets/assets/logos/Kruxers/Light-Mode/logo.png": "6c6b3a7f7ff04ab8a01b20a0920b1657",
"assets/assets/logos/Kruxers/Dark-Mode/logo.png": "b20197a0fccbddfc78e42f598b9e76bc",
"assets/assets/logos/Rohan-Batra/legacy-logo.png": "0ed844e2345c484ed287d62369a6e195",
"assets/assets/logos/Rohan-Batra/bg-logo.png": "84711448158d43c9300ea88c9a5e40b6",
"assets/assets/logos/Rohan-Batra/logo.png": "60a8360c23b2397a48587f64e19e104c",
"assets/assets/logos/UNSW/unsw-logo.png": "74b501101c57ce63b202be77a14fbe79",
"assets/assets/logos/THM/Tryhackme-light.png": "d129a413fab85cd804f72022e49871ba",
"assets/assets/logos/THM/THMlogo-gray_scale.png": "4be9ae8d9c141d0095139a7cb2e80c20",
"assets/assets/logos/TERI/teriin_logo.jpg": "c5dba63d87ce547c2b0546c5e34e6dfc",
"assets/assets/logos/IITB/ECELL/ecell_iitb_logo.jpg": "472d1996e7d9feba85bc5208b1779a66",
"assets/assets/logos/Second-Brain-Database/Light-Mode/logo.png": "1f758801b26d7ea1d2a941247ef154e3",
"assets/assets/logos/Second-Brain-Database/Dark-Mode/logo.png": "14be8d479b3e1514474292e8ce8fc216",
"assets/assets/logos/Linuxwale/Light-Mode/logo.png": "91fa6b762a92f92b5342accd8469c6a6",
"assets/assets/logos/Linuxwale/Dark-Mode/logo.png": "1db0c4adad320ae47d0899af62fe7594",
"assets/assets/logos/Rohan-Batra-Gaming/Light-Mode/logo.png": "a124a11c1617692df035cb81c4599608",
"assets/assets/logos/Rohan-Batra-Gaming/Dark-Mode/logo.png": "4fd1ec084f27f81fa1a1370af27f5074",
"assets/assets/logos/SMCS/building.jpg": "26a8ded9255e3bd4bffb7820d87d7b9a",
"assets/assets/logos/Orange-Education/orangeeducation_logo.jpg": "bffde0790d21df4293e50ac4208d280d",
"assets/assets/logos/Science-Olympiad-Foundation/logo.jpg": "2142f9e3578ff6657e38adad7bb62bf3",
"assets/assets/logos/Proxmox/whitemode-logo.png": "5226d2f8c7f020ae0395ef02be05eeae",
"assets/assets/logos/Proxmox/darkmode-logo.png": "75d144da241519a581bafccdbf6a2181",
"assets/assets/logos/Pentasoft/pentelogo.png": "0e18ced2f944625a1144131a7bf02d1a",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "33b7d9392238c04c131b6ce224e13711",
"assets/packages/font_awesome_flutter/lib/fonts/fa-regular-400.ttf": "9a66e30798d1ae0d875155a06fd13a5e",
"assets/packages/font_awesome_flutter/lib/fonts/fa-brands-400.ttf": "59c283e0a2f9a7c4b2283e1d660115a0",
"assets/packages/font_awesome_flutter/lib/fonts/fa-solid-900.ttf": "de77d449a99802faa1f23fe1c673580b",
"assets/shaders/ink_sparkle.frag": "ecc85a2e95f5e9f53123dcaf8cb9b6ce",
"assets/FontManifest.json": "5a32d4310a6f5d9a6b651e75ba0d7372",
"assets/NOTICES": "b7b9481754c3bb33c231b985ab9aed81",
"main.dart.js": "2c71c7f833718261ec2c66364fc5942c",
"manifest.json": "9b5247aacec0e27a9718a9b72f25cfdb",
"version.json": "7e804b5d0ba1771c4181d97662a33ab4",
"canvaskit/skwasm.js.symbols": "e72c79950c8a8483d826a7f0560573a1",
"canvaskit/canvaskit.js": "728b2d477d9b8c14593d4f9b82b484f3",
"canvaskit/skwasm.wasm": "39dd80367a4e71582d234948adc521c0",
"canvaskit/canvaskit.wasm": "7a3f4ae7d65fc1de6a6e7ddd3224bc93",
"canvaskit/canvaskit.js.symbols": "bdcd3835edf8586b6d6edfce8749fb77",
"canvaskit/skwasm.js": "ea559890a088fe28b4ddf70e17e60052",
"canvaskit/chromium/canvaskit.js": "8191e843020c832c9cf8852a4b909d4c",
"canvaskit/chromium/canvaskit.wasm": "f504de372e31c8031018a9ec0a9ef5f0",
"canvaskit/chromium/canvaskit.js.symbols": "b61b5f4673c9698029fa0a746a9ad581",
"flutter_bootstrap.js": "92f3a6a9b751296cd1b6a3353e27b807",
"favicon.png": "12c9fe1a93ab8de51994a13a1c921373",
"index.html": "efb2cbca3ad64ece2c0535d30b7ac00f",
"/": "efb2cbca3ad64ece2c0535d30b7ac00f",
"flutter.js": "83d881c1dbb6d6bcd6b42e274605b69c"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"flutter_bootstrap.js",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
