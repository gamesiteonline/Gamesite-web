export interface LanguageDictionary {
  welcomeTitle: string;
  welcomeDesc: string;
  selectLanguage: string;
  ownerText: string;
  tanzaniaFlag: string;
  searchPlaceholder: string;
  filterPlatform: string;
  filterGenre: string;
  filterRating: string;
  filterSize: string;
  allPlatforms: string;
  allGenres: string;
  allRatings: string;
  allSizes: string;
  resetFilters: string;
  totalGames: string;
  noGamesFound: string;
  downloadGame: string;
  backToBrowse: string;
  gameDetails: string;
  platformLabel: string;
  genreLabel: string;
  fileSizeLabel: string;
  formatLabel: string;
  ratingLabel: string;
  descriptionLabel: string;
  compatibilityLabel: string;
  downloadBtn: string;
  telegramNote: string;
  whatsappInvite: string;
  joinWhatsappBtn: string;
  contactBtn: string;
  contactOptionsTitle: string;
  whatsappChannel: string;
  smsText: string;
  copyNumber: string;
  copiedMsg: string;
  emailUs: string;
  telegramBot: string;
  homeTitle: string;
  homeSub: string;
  downloadProtocolTitle: string;
}

export const TRANSLATIONS: Record<"en" | "sw", LanguageDictionary> = {
  en: {
    welcomeTitle: "WELCOME TO GAMESITEONLINE",
    welcomeDesc: "Select your preferred language to begin browsing and downloading the best curated retro video games.",
    selectLanguage: "Select Language / Chagua Lugha",
    ownerText: "Owned by Fahad Mohamed",
    tanzaniaFlag: "Tanzania 🇹🇿",
    searchPlaceholder: "Search games by name, description, or platform...",
    filterPlatform: "Platform",
    filterGenre: "Genre",
    filterRating: "Rating",
    filterSize: "Game Size",
    allPlatforms: "All Platforms",
    allGenres: "All Genres",
    allRatings: "All Ratings",
    allSizes: "All Sizes",
    resetFilters: "Reset Filters",
    totalGames: "Games Available",
    noGamesFound: "No games found matching your search. Try resetting your filters!",
    downloadGame: "Download Game",
    backToBrowse: "Back to Browse",
    gameDetails: "Game Details",
    platformLabel: "Platform",
    genreLabel: "Genre",
    fileSizeLabel: "File Size",
    formatLabel: "Format/Extension",
    ratingLabel: "Rating",
    descriptionLabel: "Game Description",
    compatibilityLabel: "Emulator & Compatibility Guide",
    downloadBtn: "DOWNLOAD NOW",
    telegramNote: "[Download through Telegram bot: gamesiteonlinetz]",
    whatsappInvite: "Join our official WhatsApp Channel to request new games, get instant notifications on new uploads, and cheat codes!",
    joinWhatsappBtn: "Join WhatsApp Channel",
    contactBtn: "GET IN TOUCH",
    contactOptionsTitle: "Support & Inquiries",
    whatsappChannel: "WhatsApp Channel (Latest Games & Updates)",
    smsText: "SMS/Text: +255 796 339 436",
    copyNumber: "Copy Number",
    copiedMsg: "Copied!",
    emailUs: "Email: gamesiteonlinetz@gmail.com",
    telegramBot: "Telegram Admin: @faliz_AI",
    homeTitle: "THE RETRO HUB",
    homeSub: "Fast, unfiltered, high-speed direct game downloads for mobile and console emulators.",
    downloadProtocolTitle: "Game Download Protocol"
  },
  sw: {
    welcomeTitle: "KARIBU GAMESITEONLINE",
    welcomeDesc: "Chagua lugha unayopendelea ili kuanza kuvinjari na kupakua michezo bora ya video ya kitambo iliyochaguliwa vizuri.",
    selectLanguage: "Chagua Lugha / Select Language",
    ownerText: "Inamilikiwa na Fahad Mohamed",
    tanzaniaFlag: "Tanzania 🇹🇿",
    searchPlaceholder: "Tafuta michezo kwa jina, maelezo, au jukwaa...",
    filterPlatform: "Jukwaa",
    filterGenre: "Aina",
    filterRating: "Ukadiriaji",
    filterSize: "Ukubwa wa Mchezo",
    allPlatforms: "Majukwaa Yote",
    allGenres: "Aina Zote",
    allRatings: "Ukadiriaji Wote",
    allSizes: "Ukubwa Wote",
    resetFilters: "Futa Vichungi",
    totalGames: "Michezo Inayopatikana",
    noGamesFound: "Hakuna mchezo uliopatikana. Jaribu kufuta vichungi vyako!",
    downloadGame: "Pakua Mchezo",
    backToBrowse: "Rudi Kwenye Orodha",
    gameDetails: "Maelezo ya Mchezo",
    platformLabel: "Jukwaa",
    genreLabel: "Aina ya Mchezo",
    fileSizeLabel: "Ukubwa wa Faili",
    formatLabel: "Aina/Kiambishi",
    ratingLabel: "Alama/Ukadiriaji",
    descriptionLabel: "Maelezo ya Mchezo",
    compatibilityLabel: "Mwongozo wa Emulator na Utangamano",
    downloadBtn: "PAKUA SASA",
    telegramNote: "[Pakua kupitia bot ya Telegram: gamesiteonlinetz]",
    whatsappInvite: "Jiunge na Channel yetu rasmi ya WhatsApp ili kuomba michezo mipya, kupokea taarifa za papo hapo na mbinu za mchezo!",
    joinWhatsappBtn: "Jiunge na Channel ya WhatsApp",
    contactBtn: "WASILIANA NASI",
    contactOptionsTitle: "Msaada na Maswali",
    whatsappChannel: "Channel ya WhatsApp (Michezo Mipya na Taarifa)",
    smsText: "SMS/Ujumbe: +255 796 339 436",
    copyNumber: "Nakili Namba",
    copiedMsg: "Imenakiliwa!",
    emailUs: "Barua Pepe: gamesiteonlinetz@gmail.com",
    telegramBot: "Telegram Admin: @faliz_AI",
    homeTitle: "KITUO CHA RETRO",
    homeSub: "Upakuaji wa michezo wa haraka, wa moja kwa moja, usio na kikomo kwa emulators za simu na kompyuta.",
    downloadProtocolTitle: "Itifaki ya Kupakua Mchezo"
  }
};
