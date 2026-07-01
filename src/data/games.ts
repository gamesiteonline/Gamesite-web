export interface Game {
  GameID: string;
  FileName: string;
  Extension: string;
  Platform: string;
  Genre: string;
  Rating: string;
  DescriptionEn: string;
  DescriptionSw: string;
  CompatibilityEn: string;
  CompatibilitySw: string;
  Size: string;
  DownloadLink: string;
  CoverArtLink: string;
}

export const GAMES_DATABASE: Game[] = [
  {
    GameID: "PSP-4F1F08B0",
    FileName: "NBA 06",
    Extension: "CHD",
    Platform: "Sony PlayStation Portable / PS2",
    Genre: "Sports",
    Rating: "7.9/10",
    DescriptionEn: "NBA 06 brings the ultimate basketball simulation to handheld devices, featuring life-like players, customizable rosters, and realistic gameplay mechanics. Perfect for quick games on the go.",
    DescriptionSw: "NBA 06 inaleta simulation ya mwisho ya mpira wa kikapu kwenye vifaa vya mkononi, ikiwa na wachezaji halisi, orodha zinazoweza kubadilishwa, na mbinu za mchezo halisi. Ni mzuri kwa michezo ya haraka safarini.",
    CompatibilityEn: "Runs perfectly at 60 FPS on PPSSPP emulator with default settings. Recommend 2x rendering resolution for crisp graphics.",
    CompatibilitySw: "Inacheza vizuri kwa FPS 60 kwenye PPSSPP emulator na mipangilio ya kawaida. Inapendekezwa kioo kiwe na azimio la mara 2 kwa picha safi kabisa.",
    Size: "204.86 MB",
    DownloadLink: "https://archive.org/download/nba-06-usa/NBA%2006%20%28USA%29.zip",
    CoverArtLink: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1v5y.png"
  },
  {
    GameID: "PSP-GTA-LCS",
    FileName: "Grand Theft Auto: Liberty City Stories",
    Extension: "ISO",
    Platform: "Sony PlayStation Portable",
    Genre: "Action-Adventure",
    Rating: "9.0/10",
    DescriptionEn: "Return to Liberty City in this classic open-world adventure. Play as Toni Cipriani and climb the ranks of the Leone crime family with explosive missions and high-speed chases.",
    DescriptionSw: "Rejea Liberty City kwenye mchezo huu wa kitambo wenye ulimwengu wazi. Cheza kama Toni Cipriani na upande vyeo vya familia ya uhalifu ya Leone ukiwa na misheni za kusisimua na kimbizano kali.",
    CompatibilityEn: "Runs smoothly at 30 FPS. Enable 'Skip Buffer Effects' to boost speed on low-end devices. Use frame skipping if needed.",
    CompatibilitySw: "Inacheza vizuri kwa FPS 30. Washa 'Ruka Athari za Buffer' ili kuongeza kasi kwenye simu za kiwango cha chini.",
    Size: "850.50 MB",
    DownloadLink: "https://archive.org/download/gta-liberty-city-stories-psp/GTA_Liberty_City_Stories.zip",
    CoverArtLink: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2047.png"
  },
  {
    GameID: "PSP-GOW-COO",
    FileName: "God of War: Chains of Olympus",
    Extension: "ISO",
    Platform: "Sony PlayStation Portable",
    Genre: "Action-Adventure",
    Rating: "9.5/10",
    DescriptionEn: "Experience Kratos' dark past before his quest for vengeance. Command the legendary Blades of Chaos in a thrilling journey through mythology with stunning visuals and brutal combat.",
    DescriptionSw: "Shuhudia maisha ya zamani ya giza ya Kratos kabla ya safari yake ya kulipiza kisasi. Dhibiti mapanga ya hadithi 'Blades of Chaos' kwenye safari ya kusisimua ya mythology.",
    CompatibilityEn: "High-end game. Requires Vulkan backend enabled in PPSSPP. Keep rendering resolution at 1x or 2x depending on your mobile GPU.",
    CompatibilitySw: "Mchezo mkubwa. Unahitaji Vulkan backend kuwashwa kwenye PPSSPP. Weka azimio la kutoa picha kwenye 1x au 2x kulingana na uwezo wa simu yako.",
    Size: "1.20 GB",
    DownloadLink: "https://archive.org/download/god-of-war-chains-of-olympus-usa/God%20of%20War%20-%20Chains%20of%20Olymppus%20%28USA%29.zip",
    CoverArtLink: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2767.png"
  },
  {
    GameID: "PSP-DBZ-SB2",
    FileName: "Dragon Ball Z: Shin Budokai - Another Road",
    Extension: "ISO",
    Platform: "Sony PlayStation Portable",
    Genre: "Fighting",
    Rating: "8.8/10",
    DescriptionEn: "Unleash super-powered battles with Goku, Vegeta, and other legendary DBZ warriors. Battle through a parallel universe featuring Future Trunks' struggle to save his timeline.",
    DescriptionSw: "Anzisha mapambano ya nguvu kubwa ukiwa na Goku, Vegeta, na wapiganaji wengine wa hadithi wa DBZ. Pigana katika ulimwengu mbadala unaoonyesha jitihada za Future Trunks za kuokoa wakati wake.",
    CompatibilityEn: "Flawless performance at 60 FPS on almost all devices. No special configuration required.",
    CompatibilitySw: "Inacheza kwa kasi ya FPS 60 bila matatizo kwenye simu karibu zote. Hakuna haja ya mipangilio maalum.",
    Size: "420.10 MB",
    DownloadLink: "https://archive.org/download/dbz-shin-budokai-another-road/DBZ_Shin_Budokai_Another_Road.zip",
    CoverArtLink: "https://images.igdb.com/igdb/image/upload/t_cover_big/co3u5f.png"
  },
  {
    GameID: "PSP-NAR-UNI",
    FileName: "Naruto Shippuden: Ultimate Ninja Impact",
    Extension: "ISO",
    Platform: "Sony PlayStation Portable",
    Genre: "Fighting",
    Rating: "8.7/10",
    DescriptionEn: "Relive epic Naruto Shippuden storylines with monumental boss fights and massive battlefields where you fight hundreds of rival ninjas at once using devastating Jutsu.",
    DescriptionSw: "Ishi upya hadithi kuu za Naruto Shippuden ukiwa na mapambano makubwa ya wakubwa na viwanja vya vita vikubwa ambapo unapambana na mamia ya ninjas wapinzani kwa wakati mmoja kwa kutumia Jutsu kali.",
    CompatibilityEn: "Runs perfectly. If experiencing audio stuttering, set 'Audio Latency' to Medium or High and enable frame skipping.",
    CompatibilitySw: "Inacheza vizuri sana. Kama sauti inakatika, weka 'Audio Latency' kuwa ya Kati au ya Juu na uwashe ruka fremu (frame skipping).",
    Size: "905.00 MB",
    DownloadLink: "https://archive.org/download/naruto-shippuden-ultimate-ninja-impact-usa/Naruto%20Shippuden%20-%20Ultimate%20Ninja%20Impact%20%28USA%29.zip",
    CoverArtLink: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2fsk.png"
  },
  {
    GameID: "PSP-TEK-6",
    FileName: "Tekken 6",
    Extension: "ISO",
    Platform: "Sony PlayStation Portable",
    Genre: "Fighting",
    Rating: "9.2/10",
    DescriptionEn: "The undisputed king of iron fist tournament arrives on PSP with gorgeous graphics, a massive roster of fighters, and fluid combat animations. Compete for ultimate dominance.",
    DescriptionSw: "Mfalme asiyepingika wa mashindano ya ngumi ya chuma anafika kwenye PSP akiwa na picha za kuvutia, orodha kubwa ya wapiganaji, na miondoko mizuri ya mapigano.",
    CompatibilityEn: "Excellent 60 FPS performance. Highly optimized. Disable 'Lazy Texture Caching' for best visuals.",
    CompatibilitySw: "Inacheza vizuri kwa kasi ya FPS 60. Imeboreshwa vizuri sana. Zima 'Lazy Texture Caching' kwa picha bora zaidi.",
    Size: "730.20 MB",
    DownloadLink: "https://archive.org/download/tekken-6-psp-usa/Tekken6_PSP.zip",
    CoverArtLink: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1v6a.png"
  },
  {
    GameID: "PSP-BEN-POE",
    FileName: "Ben 10: Protector of Earth",
    Extension: "ISO",
    Platform: "Sony PlayStation Portable / PS2",
    Genre: "Action-Adventure",
    Rating: "8.2/10",
    DescriptionEn: "Transform into Four Arms, Heatblast, XLR8, Cannonbolt, and Wildvine to defeat Vilgax and recover the Omnitrix crystals in this action-packed platformer adventure.",
    DescriptionSw: "Badilika kuwa Four Arms, Heatblast, XLR8, Cannonbolt, na Wildvine ili kumshinda Vilgax na kupata tena fuwele za Omnitrix kwenye mchezo huu wa kusisimua.",
    CompatibilityEn: "Runs excellently with no issues. Standard configuration. Compatible with all PPSSPP versions.",
    CompatibilitySw: "Inacheza vizuri sana bila shida yoyote. Mipangilio ya kawaida. Inafanya kazi kwenye matoleo yote ya PPSSPP.",
    Size: "470.60 MB",
    DownloadLink: "https://archive.org/download/ben10-protector-of-earth-psp/Ben10_Protector_of_Earth.zip",
    CoverArtLink: "https://images.igdb.com/igdb/image/upload/t_cover_big/co6q01.png"
  },
  {
    GameID: "PSP-NFS-MW",
    FileName: "Need for Speed: Most Wanted - 5-1-0",
    Extension: "ISO",
    Platform: "Sony PlayStation Portable / PS2",
    Genre: "Racing",
    Rating: "8.5/10",
    DescriptionEn: "Outrun cops, challenge rivals, and customize exotic rides. Climb up the Blacklist to become the most notorious street racer in Liberty City's underground circuits.",
    DescriptionSw: "Kimbia polisi, pambana na wapinzani, na urembe magari yako. Panda kwenye orodha ya 'Blacklist' ili kuwa dereva mashuhuri zaidi wa mbio za barabarani.",
    CompatibilityEn: "Runs at full speed. Recommend using standard OpenGL backend for older mobile chipsets.",
    CompatibilitySw: "Inacheza kwa kasi kamili. Inapendekezwa kutumia OpenGL backend ya kawaida kwa simu za kizamani.",
    Size: "168.00 MB",
    DownloadLink: "https://archive.org/download/nfs-most-wanted-psp/NFS_Most_Wanted.zip",
    CoverArtLink: "https://images.igdb.com/igdb/image/upload/t_cover_big/co26a5.png"
  },
  {
    GameID: "PS2-GTA-SA",
    FileName: "Grand Theft Auto: San Andreas",
    Extension: "ISO",
    Platform: "Sony PlayStation 2",
    Genre: "Action-Adventure",
    Rating: "9.8/10",
    DescriptionEn: "Five years ago Carl Johnson escaped from the pressures of life in Los Santos, San Andreas... a city tearing itself apart with gang trouble, drugs and corruption. Now, it's the early 90s. CJ's got to go home.",
    DescriptionSw: "Miaka mitano iliyopita Carl Johnson alitoroka Los Santos, San Andreas... mji uliojaa vurugu za magenge, madawa ya kulevya na rushwa. Sasa, ni mwanzoni mwa miaka ya 90. Inabidi arudi nyumbani.",
    CompatibilityEn: "Highly demanding. Use AetherSX2 or NetherSX2 emulator. Set EE Cycle Rate to -1 or -2 to improve speed on mid-range Android devices.",
    CompatibilitySw: "Inahitaji simu yenye uwezo mkubwa. Tumia emulator ya AetherSX2 au NetherSX2. Weka EE Cycle Rate kwenye -1 au -2 ili kuongeza kasi kwenye simu za kiwango cha kati.",
    Size: "2.40 GB",
    DownloadLink: "https://archive.org/download/gta-san-andreas-ps2-usa/GTA_San_Andreas.zip",
    CoverArtLink: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1v4a.png"
  },
  {
    GameID: "PS2-RE-4",
    FileName: "Resident Evil 4",
    Extension: "ISO",
    Platform: "Sony PlayStation 2",
    Genre: "Survival Horror",
    Rating: "9.6/10",
    DescriptionEn: "Special Agent Leon S. Kennedy is sent on a mission to rescue the U.S. President's kidnapped daughter from a mysterious cult in rural Europe, facing terrifying parasite-infected villagers.",
    DescriptionSw: "Mpelelezi maalum Leon S. Kennedy anatunukiwa jukumu la kumuokoa mtoto wa Rais wa Marekani aliyetekwa na kikundi cha siri Ulaya vijijini, akikabiliana na wanakijiji waliambukizwa vimelea vya kutisha.",
    CompatibilityEn: "Excellent compatibility on PS2 emulators. Runs at solid 50/60 FPS on Snapdragon 660 or higher with 1x resolution.",
    CompatibilitySw: "Mchezo huu unafanya kazi vizuri kwenye emulators za PS2. Inacheza kwa kasi thabiti ya FPS 50/60 kwenye Snapdragon 660 au ya juu kwa azimio la 1x.",
    Size: "1.80 GB",
    DownloadLink: "https://archive.org/download/resident-evil-4-ps2-usa/Resident_Evil_4.zip",
    CoverArtLink: "https://images.igdb.com/igdb/image/upload/t_cover_big/co29a3.png"
  },
  {
    GameID: "GBA-POK-EME",
    FileName: "Pokemon Emerald Version",
    Extension: "GBA",
    Platform: "Nintendo Game Boy Advance",
    Genre: "RPG",
    Rating: "9.5/10",
    DescriptionEn: "Embark on an epic adventure in the Hoenn region! Battle Gym Leaders, catch wild Pokemon, and foil the villainous plots of Team Magma and Team Aqua to awaken legendary titans.",
    DescriptionSw: "Anza safari kubwa katika mkoa wa Hoenn! Pambana na viongozi wa gym, kamata Pokemon wa porini, na uzuie mipango mibaya ya Team Magma na Team Aqua kuamsha viumbe wa hadithi.",
    CompatibilityEn: "Runs flawlessly on any GBA emulator (MyBoy, John GBA, RetroArch) at full speed on any modern or low-end device.",
    CompatibilitySw: "Inacheza kikamilifu kwenye emulator yoyote ya GBA (MyBoy, John GBA, RetroArch) kwa kasi kamili kwenye kifaa chochote kile.",
    Size: "8.10 MB",
    DownloadLink: "https://archive.org/download/pokemon-emerald-gba-usa/Pokemon_Emerald.zip",
    CoverArtLink: "https://images.igdb.com/igdb/image/upload/t_cover_big/co29a9.png"
  },
  {
    GameID: "GBA-ZEL-TMC",
    FileName: "The Legend of Zelda: The Minish Cap",
    Extension: "GBA",
    Platform: "Nintendo Game Boy Advance",
    Genre: "Action-Adventure",
    Rating: "9.3/10",
    DescriptionEn: "Shrink down to microscopic size with the help of a magical talking cap named Ezlo. Explore the miniature world of the Minish to restore the Picori Blade and save Princess Zelda.",
    DescriptionSw: "Pungua hadi ukubwa wa ajabu kwa msaada wa kofia ya hadithi inayoongea inayoitwa Ezlo. Chunguza ulimwengu mdogo wa Minish ili kurejesha Upanga wa Picori na kumuokoa Binti Zelda.",
    CompatibilityEn: "Flawless emulation on all devices. Highly recommended retro masterpiece.",
    CompatibilitySw: "Emulation kamilifu kwenye vifaa vyote. Kazi nzuri ya kitambo inayopendekezwa sana.",
    Size: "5.50 MB",
    DownloadLink: "https://archive.org/download/zelda-minish-cap-gba/Zelda_Minish_Cap.zip",
    CoverArtLink: "https://images.igdb.com/igdb/image/upload/t_cover_big/co272p.png"
  },
  {
    GameID: "NDS-NSMB",
    FileName: "New Super Mario Bros.",
    Extension: "NDS",
    Platform: "Nintendo DS",
    Genre: "Platformer",
    Rating: "9.2/10",
    DescriptionEn: "Run, jump, and stomp through vibrant worlds in Mario's first side-scrolling adventure since Super Mario World. Transform into Mega Mario to flatten enemies and obstacles!",
    DescriptionSw: "Kimbia, ruka, na kanyaga maadui katika ulimwengu wenye msisimko kwenye mchezo wa kwanza wa Mario tangu Super Mario World. Badilika kuwa Mega Mario kuponda kila kitu!",
    CompatibilityEn: "Runs perfectly at 60 FPS on DraStic emulator. Turn on high-resolution 3D rendering for enhanced visuals.",
    CompatibilitySw: "Inacheza vizuri kabisa kwa FPS 60 kwenye DraStic emulator. Washa uwezo wa picha za 3D za hali ya juu kwa mwonekano mzuri zaidi.",
    Size: "14.50 MB",
    DownloadLink: "https://archive.org/download/new-super-mario-bros-nds/New_Super_Mario_Bros.zip",
    CoverArtLink: "https://images.igdb.com/igdb/image/upload/t_cover_big/co26a0.png"
  },
  {
    GameID: "NDS-MKDS",
    FileName: "Mario Kart DS",
    Extension: "NDS",
    Platform: "Nintendo DS",
    Genre: "Racing",
    Rating: "9.0/10",
    DescriptionEn: "The premier kart racer hits the double screen! Race with up to eight players, dodge blue shells, drift through classic and brand new circuits, and experience the iconic Mission Mode.",
    DescriptionSw: "Mchezo bora wa mbio za magari madogo unakuja kwenye skrini mbili! Shindana na wachezaji wengine, epuka makombora, na uteleze kwenye barabara nzuri.",
    CompatibilityEn: "Excellent. Works smoothly on DraStic or MelonDS emulator. Multi-touch controllers are highly responsive.",
    CompatibilitySw: "Nzuri sana. Inafanya kazi vizuri kwenye DraStic au MelonDS emulator. Vifungo vya kugusa skrini vinafanya kazi kwa wepesi.",
    Size: "22.30 MB",
    DownloadLink: "https://archive.org/download/mario-kart-ds-usa/Mario_Kart_DS.zip",
    CoverArtLink: "https://images.igdb.com/igdb/image/upload/t_cover_big/co25p1.png"
  },
  {
    GameID: "SEGA-SON-1",
    FileName: "Sonic the Hedgehog",
    Extension: "ROM",
    Platform: "Sega Genesis / Mega Drive",
    Genre: "Platformer",
    Rating: "8.9/10",
    DescriptionEn: "Zip through loops and collect rings as the fastest blue hedgehog in the world. Defeat Dr. Eggman and free innocent woodland animals in Sonic's timeless historical debut.",
    DescriptionSw: "Pita kwenye miduara kwa kasi ya umeme na ukusanye pete kama hedgehog wa buluu mwenye kasi zaidi duniani. Mshinde Dr. Eggman na uwaokoe wanyama wasio na hatia.",
    CompatibilityEn: "Flawless on RetroArch (Genesis Plus GX core) or MD.emu emulators. Playable on any smartphone ever made.",
    CompatibilitySw: "Inacheza vizuri sana kwenye RetroArch au emulator ya MD.emu. Inawezekana kucheza kwenye simu yoyote ile ya sasa.",
    Size: "1.20 MB",
    DownloadLink: "https://archive.org/download/sonic-hedgehog-sega/Sonic_Hedgehog.zip",
    CoverArtLink: "https://images.igdb.com/igdb/image/upload/t_cover_big/co50a0.png"
  }
];
