const ht = [
  {
    label: "YouTube",
    matches: ["*://www.youtube.com/*", "*://m.youtube.com/*"],
    js: "youtube.js",
    id: "youtube",
    usesBlocklist: !0
  },
  {
    label: "MySpace",
    matches: ["*://myspace.com/*"],
    js: "myspace.js",
    id: "myspace"
  },
  {
    label: "Bandcamp Daily",
    matches: ["*://daily.bandcamp.com/*"],
    js: "bandcamp-daily.js",
    id: "bandcamp-daily"
  },
  {
    label: "Bandcamp Embed",
    matches: ["*://*.bandcamp.com/EmbeddedPlayer/*"],
    js: "bandcamp-embed.js",
    id: "bandcamp-embed",
    allFrames: !0
  },
  {
    label: "Bandcamp",
    matches: ["*://*.bandcamp.com/*", "*://bandcamp.com/*"],
    js: "bandcamp.js",
    id: "bandcamp"
  },
  {
    label: "Buy Music Club",
    matches: ["*://www.buymusic.club/*"],
    js: "buymusicclub.js",
    id: "buymusicclub"
  },
  {
    label: "Pandora",
    matches: ["*://www.pandora.com/*"],
    js: "pandora.js",
    id: "pandora"
  },
  {
    label: "Pakartot",
    matches: ["*://www.pakartot.lt/*"],
    js: "pakartot.js",
    id: "pakartot"
  },
  {
    label: "Deezer",
    matches: ["*://www.deezer.com/*"],
    js: "deezer.js",
    id: "deezer"
  },
  {
    label: "WEFUNK Radio",
    matches: ["*://session.wefunkradio.com/*", "*://www.wefunkradio.com/*"],
    js: "wefunkradio.js",
    id: "wefunkradio"
  },
  {
    label: "SoundCloud",
    matches: ["*://soundcloud.com/*", "*://m.soundcloud.com/*"],
    js: "soundcloud.js",
    id: "soundcloud"
  },
  {
    label: "Amazon Music",
    matches: [
      "*://music.amazon.*/*",
      "*://www.amazon.*/gp/dmusic/cloudplayer/*"
    ],
    js: "amazon.js",
    id: "amazon"
  },
  {
    label: "Amazon Echo",
    matches: ["*://alexa.amazon.*/spa/*"],
    js: "amazon-alexa.js",
    id: "amazon-alexa"
  },
  {
    label: "Radio Vas3k Club",
    matches: ["https://radio.vas3k.club/*"],
    js: "vas3kradio.js",
    id: "vas3kradio"
  },
  {
    label: "VK",
    matches: ["*://vk.ru/*", "*://vk.com/*"],
    js: "vk.js",
    id: "vk"
  },
  {
    label: "iHeart",
    matches: ["*://*.iheart.com/*"],
    js: "iheart.js",
    id: "iheart"
  },
  {
    label: "Indie Shuffle",
    matches: ["*://www.indieshuffle.com/*"],
    js: "indieshuffle.js",
    id: "indieshuffle"
  },
  {
    label: "Tuba.FM",
    matches: ["*://fm.tuba.pl/*"],
    js: "tubafm.js",
    id: "tubafm"
  },
  {
    label: "Spotify Embed",
    matches: ["*://open.spotify.com/embed/*"],
    js: "spotify-embed.js",
    id: "spotify-embed",
    allFrames: !0
  },
  {
    label: "Spotify",
    matches: ["*://open.spotify.com/*"],
    js: "spotify.js",
    id: "spotify",
    hasNativeScrobbler: !0
  },
  {
    label: "Dandelion Radio",
    matches: ["*://www.dandelionradio.com/player.htm"],
    js: "dandelionradio.js",
    id: "dandelionradio"
  },
  {
    label: "SoGreatandPowerful",
    matches: ["*://sogreatandpowerful.com/*"],
    js: "sogreatandpowerful.js",
    id: "sogreatandpowerful"
  },
  {
    label: "Radio Cidade",
    matches: [
      "*://radiocidade.fm/player/*",
      "*://play.radiomania.com.br/*",
      "*://*.melodia.com.br/*",
      "*://jb.fm/player/*"
    ],
    js: "radiocidade.js",
    id: "radiocidade"
  },
  {
    label: "Radio Nova",
    matches: ["*://www.nova.fr/*"],
    js: "nova.js",
    id: "nova"
  },
  {
    label: "Радио Premium",
    matches: ["*://rpfm.ru/*"],
    js: "rpfm.js",
    id: "rpfm"
  },
  {
    label: "Focus@Will",
    matches: ["*://www.focusatwill.com/*"],
    js: "focusatwill.js",
    id: "focusatwill"
  },
  {
    label: "Subphonic (owncloud plugin)",
    matches: ["*://*/*/apps/subphonic/minisub/*"],
    js: "subphonic.js",
    id: "subphonic"
  },
  {
    label: "Nextcloud music",
    matches: ["*://*/apps/music/*"],
    js: "nextcloud-music.js",
    id: "nextcloud-music"
  },
  {
    label: "Digitally Imported",
    matches: ["*://www.di.fm/*"],
    js: "radiotunes.js",
    id: "di"
  },
  {
    label: "BBC Sounds",
    matches: ["*://*.bbc.co.uk/*"],
    js: "bbc-sounds.js",
    id: "bbc-sounds"
  },
  {
    label: "Gaana",
    matches: ["*://gaana.com/*"],
    js: "gaana.js",
    id: "gaana"
  },
  {
    label: "Яндекс.Музыка",
    matches: [
      "*://music.yandex.ru/*",
      "*://music.yandex.by/*",
      "*://music.yandex.kz/*",
      "*://music.yandex.ua/*",
      "*://music.yandex.com/*"
    ],
    js: "yandex-music.js",
    id: "yandex-music"
  },
  {
    label: "Plex",
    matches: [
      "*://*32400/web/*",
      "*://plex.tv/web/*",
      "*://*.plex.tv/web/*",
      "*://*.plex.tv/desktop*"
    ],
    js: "plex.js",
    id: "plex"
  },
  {
    label: "TuneIn",
    matches: ["*://tunein.com/*"],
    js: "tunein.js",
    id: "tunein"
  },
  {
    label: "Mixcloud Embed",
    matches: ["*://player-widget.mixcloud.com/*"],
    js: "mixcloud-embed.js",
    id: "mixcloud-embed",
    allFrames: !0
  },
  {
    label: "Mixcloud",
    matches: ["*://*.mixcloud.com/*"],
    js: "mixcloud.js",
    id: "mixcloud"
  },
  {
    label: "ReverbNation",
    matches: ["*://www.reverbnation.com/*"],
    js: "reverbnation.js",
    id: "reverbnation"
  },
  {
    label: "NRK Radio",
    matches: ["*://radio.nrk.no/*"],
    js: "nrk-radio.js",
    id: "nrk-radio"
  },
  {
    label: "Internet Archive",
    matches: ["*://archive.org/details/*"],
    js: "archive.js",
    id: "archive"
  },
  {
    label: "Odnoklassniki",
    matches: ["*://odnoklassniki.ru/*", "*://ok.ru/*"],
    js: "odnoklassniki.js",
    id: "odnoklassniki"
  },
  {
    label: "outrahora rádio",
    matches: ["*://*.outrahora.com/*"],
    js: "outrahora.js",
    id: "outrahora"
  },
  {
    label: "Overcast",
    matches: ["*://overcast.fm/*"],
    js: "overcast.js",
    id: "overcast"
  },
  {
    label: "Online Radio Box",
    matches: ["*://onlineradiobox.com/*", "*://p.onlineradiobox.com/*"],
    js: "onlineradiobox.js",
    id: "onlineradiobox"
  },
  {
    label: "163 Music",
    matches: ["*://music.163.com/*"],
    js: "163-music.js",
    id: "163-music"
  },
  {
    label: "Ambient Sleeping Pill",
    matches: ["*://ambientsleepingpill.com/"],
    js: "ambientsleepingpill.js",
    id: "ambientsleepingpill"
  },
  {
    label: "a.m. ambient",
    matches: ["*://amambient.com/"],
    js: "ambientsleepingpill.js",
    id: "amambient"
  },
  {
    label: "Tidal",
    matches: ["*://tidal.com/*"],
    js: "tidal.js",
    id: "tidal"
  },
  {
    label: "Hype Machine Featured Albums",
    matches: ["*://hypem.com/album/*"],
    js: "hypem-albums.js",
    id: "hypem-premieres"
  },
  {
    label: "Hype Machine",
    matches: ["*://hypem.com/*"],
    js: "hypem.js",
    id: "hypem"
  },
  {
    label: "J1 Radio",
    matches: [
      "*://www.j1fm.tokyo/player/*",
      "*://www.j1fm.tokyo/michi/player/*"
    ],
    js: "aiircom.js",
    id: "j1-radio"
  },
  {
    label: "JazzAndRain",
    matches: ["*://*.jazzandrain.com/*"],
    js: "jazzandrain.js",
    id: "jazzandrain"
  },
  {
    label: "AccuRadio",
    matches: ["*://www.accuradio.com/*"],
    js: "accuradio.js",
    id: "accuradio"
  },
  {
    label: "I Love Music",
    matches: ["*://ilovemusic.de/*"],
    js: "ilovemusic.js",
    id: "ilmovemusic"
  },
  {
    label: "Imusic.am",
    matches: ["*://imusic.am/*"],
    js: "imusic.am.js",
    id: "imusic.am"
  },
  {
    label: "Player.fm",
    matches: ["*://player.fm/*"],
    js: "player.fm.js",
    id: "player.fm"
  },
  {
    label: "Sound Test",
    matches: ["*://sndtst.com/*"],
    js: "sndtst.js",
    id: "sndtst"
  },
  {
    label: "RadioTunes",
    matches: ["*://www.radiotunes.com/*"],
    js: "radiotunes.js",
    id: "radiotunes"
  },
  {
    label: "RockRadio",
    matches: ["*://www.rockradio.com/*"],
    js: "radiotunes.js",
    id: "rockradio"
  },
  {
    label: "ClassicalRadio",
    matches: ["*://www.classicalradio.com/*"],
    js: "radiotunes.js",
    id: "classicalradio"
  },
  {
    label: "Audacy",
    matches: ["*://www.audacy.com/*"],
    js: "audacy.js",
    id: "audacy"
  },
  {
    label: "Audius",
    matches: ["*://audius.co/*"],
    js: "audius.js",
    id: "audius"
  },
  {
    label: "Jamendo",
    matches: ["*://www.jamendo.com/*"],
    js: "jamendo.js",
    id: "jamendo"
  },
  {
    label: "Bandzone.cz",
    matches: ["*://bandzone.cz/*"],
    js: "bandzone.cz.js",
    id: "bandzone.cz"
  },
  {
    label: "Music Player for Google Drive",
    matches: ["*://www.driveplayer.com/*"],
    js: "driveplayer.js",
    id: "driveplayer"
  },
  {
    label: "Kodi",
    js: "kodi.js",
    id: "kodi"
  },
  {
    label: "RMFON",
    matches: ["*://www.rmfon.pl/*"],
    js: "rmfon.js",
    id: "rmfon"
  },
  {
    label: "Radio 357",
    matches: ["*://radio357.pl/*"],
    js: "radio357.js",
    id: "radio357"
  },
  {
    label: "JazzRadio",
    matches: ["*://www.jazzradio.com/*"],
    js: "radiotunes.js",
    id: "jazzradio"
  },
  {
    label: "Zen Radio",
    matches: ["*://www.zenradio.com/*"],
    js: "radiotunes.js",
    id: "zenradio"
  },
  {
    label: "SomaFM",
    matches: ["*://somafm.com/player/*", "*://somafm.com/player24/*"],
    js: "somafm.js",
    id: "somafm"
  },
  {
    label: "Free Music Archive",
    matches: ["*://*.freemusicarchive.org/*"],
    js: "freemusicarchive.js",
    id: "freemusicarchive"
  },
  {
    label: "Reddit Music Player",
    matches: ["*://musicplayer.io/"],
    js: "redditmusicplayer.js",
    id: "redditmusicplayer"
  },
  {
    label: "Новое Радио",
    matches: ["*://www.novoeradio.by/*"],
    js: "novoeradio.js",
    id: "novoeradio"
  },
  {
    label: "Radio Paradise",
    matches: ["*://radioparadise.com/*"],
    js: "radioparadise.js",
    id: "radioparadise",
    allFrames: !0
  },
  {
    label: "Beatport",
    matches: ["*://www.beatport.com/*"],
    js: "beatport.js",
    id: "beatport"
  },
  {
    label: "FluxFM Berlin",
    matches: ["*://www.fluxfm.de/*"],
    js: "fluxfm.js",
    id: "fluxfm"
  },
  {
    label: "Noise FM",
    matches: ["*://noisefm.ru/*", "*://en.noisefm.ru/*"],
    js: "noisefm.js",
    id: "noisefm",
    allFrames: !0
  },
  {
    label: "WWOZ",
    matches: ["*://www.wwoz.org/listen/player/*"],
    js: "wwoz.js",
    id: "wwoz"
  },
  {
    label: "Sonerezh",
    matches: ["*://sonerezh.*/*", "*://*/*sonerezh*"],
    js: "sonerezh.js",
    id: "sonerezh"
  },
  {
    label: "Youradio",
    matches: ["*://www.youradio.cz/*"],
    js: "youradio.js",
    id: "youradio"
  },
  {
    label: "Nightwave Plaza",
    matches: ["*://plaza.one/*"],
    js: "plaza.js",
    id: "plaza"
  },
  {
    label: "Genie",
    matches: ["*://www.genie.co.kr/player/fPlayer*"],
    js: "genie.js",
    id: "genie"
  },
  {
    label: "Bugs",
    matches: ["*://music.bugs.co.kr/newPlayer*"],
    js: "bugs.js",
    id: "bugs"
  },
  {
    label: "openfm",
    matches: ["*://open.fm/*"],
    js: "openfm.js",
    id: "openfm"
  },
  {
    label: "Pinguin Radio",
    matches: ["*://pinguinradio.com/*"],
    js: "pinguinradio.js",
    id: "pinguinradio"
  },
  {
    label: "JioSaavn",
    matches: ["*://www.jiosaavn.com/*"],
    js: "jiosaavn.js",
    id: "jiosaavn"
  },
  {
    label: "Anghami",
    matches: ["*://*.anghami.com/*"],
    js: "anghami.js",
    id: "anghami"
  },
  {
    label: "Mail.ru Music",
    matches: ["*://my.mail.ru/music", "*://my.mail.ru/music/*"],
    js: "mail.ru.js",
    id: "mail.ru"
  },
  {
    label: "Emby/Jellyfin",
    matches: ["*://*8096/web/*", "*://*8920/web/*", "*://app.emby.media/*"],
    js: "emby.js",
    id: "emby"
  },
  {
    label: "Freegal Music",
    matches: ["*://*.freegalmusic.com/*"],
    js: "freegalmusic.js",
    id: "freegalmusic"
  },
  {
    label: "hoopla",
    matches: ["*://www.hoopladigital.com/*"],
    js: "hoopladigital.js",
    id: "hoopladigital"
  },
  {
    label: "MUSICat",
    // musicat.co/libraries
    matches: [
      "*://capitalcityrecords.ca/*",
      // EDMONTON PUBLIC LIBRARY
      "*://amplify817.org/*",
      // FORT WORTH PUBLIC LIBRARY
      "*://playback.spl.org/*",
      // THE SEATTLE PUBLIC LIBRARY
      "*://hum.slcpl.org/*",
      // SALT LAKE CITY PUBLIC LIBRARY
      "*://hclib.musicat.co/*",
      // HENNEPIN COUNTY LIBRARY
      "*://atxlibrary.musicat.co/*",
      // AUSTIN PUBLIC LIBRARY
      "*://librarymusicproject.com/*",
      // MULTNOMAH COUNTY LIBRARY
      "*://stacks.carnegielibrary.org/*",
      // CARNEGIE LIBRARY of PITTSBURGH
      "*://tracksmusiclibrary.org/*",
      // CHAPEL HILL PUBLIC LIBRARY
      "*://flipside.apl.org/*",
      // APPLETON PUBLIC LIBRARY
      "*://qcbeats.org/*",
      // DAVENPORT PUBLIC LIBRARY
      "*://boombox.nashvillepubliclibrary.org/*",
      // NASHVILLE PUBLIC LIBRARY
      "*://thebeathartford.co/*",
      // HARTFORD PUBLIC LIBRARY
      "*://records.lilaccitylocal.com/*",
      // SPOKANE PUBLIC LIBRARY
      "*://baybeats.sfpl.org/*",
      // SAN FRANCISCO PUBLIC LIBRARY
      "*://vibes.kdl.org/*",
      // KENT DISTRICT LIBRARY
      "*://blast.hmcpl.org/*",
      // HUNTSVILLE-MADISON COUNTY PUBLIC LIBRARY
      "*://music.lplks.org/*",
      // LAWRENCE PUBLIC LIBRARY
      "*://memphis.musicat.co/*",
      // MEMPHIS PUBLIC LIBRARIES
      "*://sawdustcitysounds.org/*",
      // L.E. PHILLIPS MEMORIAL PUBLIC LIBRARY
      "*://crescentcitysounds.org/*",
      // NEW ORLEANS PUBLIC LIBRARY
      "*://waves.tadl.org/*",
      // TRAVERSE AREA PUBLIC LIBARY
      "*://smllogjam.org/*",
      // SHREVE MEMORIAL LIBRARY
      "*://pimadesertstreams.org/*",
      // PIMA COUNTY PUBLIC LIBRARY
      "*://redstickrhythms.org/*"
      // EAST BATON ROUGE PARISH LIBRARY
    ],
    js: "musicat.js",
    id: "musicat"
  },
  {
    label: "Q-Dance",
    matches: ["*://www.q-dance.com/*"],
    js: "q-dance.js",
    id: "q-dance"
  },
  {
    label: "Listen.moe",
    matches: ["*://listen.moe/*"],
    js: "listen.moe.js",
    id: "listen.moe"
  },
  {
    label: "anime(bits)",
    matches: [
      "*://radio.animebits.moe/",
      "*://radio.animebits.moe/player/*"
    ],
    js: "animebits.js",
    id: "animebits"
  },
  {
    label: "ULTRA Production Radios",
    matches: [
      "*://www.nashe.ru/*",
      "*://www.rockfm.ru/*",
      "*://radiojazzfm.ru/*",
      "*://radioultra.ru/*"
    ],
    js: "ultraproduction.js",
    id: "ultraproduction"
  },
  {
    label: "Listen Live",
    matches: ["*://player.listenlive.co/*"],
    js: "listenlive.js",
    id: "listenlive"
  },
  {
    label: "Rayo",
    matches: [
      "*://hellorayo.co.uk/*/play/*",
      "*://hellorayo.co.uk/*/player/*"
    ],
    js: "planetradio.js",
    id: "planetradio"
  },
  {
    label: "RadioPlayer",
    matches: [
      "*://ukradioplayer.*/*",
      "*://radioplayer.*/*",
      // Generic patterns
      "*://*/radioplayer/*",
      "*://*/radio/player/",
      "*://*/*/radio/player/"
    ],
    js: "radioplayer.js",
    id: "radioplayer"
  },
  {
    label: "deltaradio",
    matches: ["*://www.deltaradio.de/*"],
    js: "deltaradio.de.js",
    id: "deltaradio.de"
  },
  {
    label: "Radio Bob",
    matches: ["*://*.radiobob.de/*"],
    js: "radiobob.js",
    id: "radiobob"
  },
  {
    label: "ByteFM",
    matches: ["*://www.byte.fm/*"],
    js: "byte.fm.js",
    id: "byte.fm"
  },
  {
    label: "Deutschlandfunk Nova",
    matches: ["*://www.deutschlandfunknova.de/*"],
    js: "deutschlandfunknova.js",
    id: "deutschlandfunknova"
  },
  {
    label: "QQ Music",
    matches: ["*://y.qq.com/*"],
    js: "qq-music.js",
    id: "qq-music"
  },
  {
    label: "QQ Video",
    matches: ["*://v.qq.com/x/*"],
    js: "qq-video.js",
    id: "qq-video"
  },
  {
    label: "Naver Vibe",
    matches: ["*://vibe.naver.com/*"],
    js: "naver-vibe.js",
    id: "naver-vibe"
  },
  {
    label: "Soribada",
    matches: ["*://www.soribada.com/*"],
    js: "soribada.js",
    id: "soribada"
  },
  {
    label: "Flo",
    matches: ["*://www.music-flo.com/*"],
    js: "music-flo.js",
    id: "music-flo"
  },
  {
    label: "Discogs",
    matches: ["*://www.discogs.com/*"],
    js: "youtube-embed.js",
    id: "youtube-embed",
    allFrames: !0
  },
  {
    label: "NPR",
    matches: ["*://www.npr.org/*"],
    js: "npr.js",
    id: "npr"
  },
  {
    label: "Streemlion",
    matches: ["*://listen.streemlion.com/*"],
    js: "streemlion.js",
    id: "streemlion"
  },
  {
    label: "eMusic",
    matches: ["*://www.emusic.com/*"],
    js: "emusic.js",
    id: "emusic"
  },
  {
    label: "LyricsTraining",
    matches: ["*://lyricstraining.com/*"],
    js: "lyricstraining.js",
    id: "lyricstraining"
  },
  {
    label: "Music Walker",
    matches: ["*://musicwalker.app/*"],
    js: "musicwalker.js",
    id: "musicwalker"
  },
  {
    label: "radioeins",
    matches: ["*://www.radioeins.de/livestream/*"],
    js: "radioeins.js",
    id: "radioeins"
  },
  {
    label: "Fritz",
    matches: ["*://www.fritz.de/livestream/*"],
    js: "fritz.js",
    id: "fritz"
  },
  {
    label: "Musicoin",
    matches: ["*://musicoin.org/*"],
    js: "musicoin.js",
    id: "musicoin"
  },
  {
    label: "Phish.in",
    matches: ["*://phish.in/*"],
    js: "phish.in.js",
    id: "phish.in"
  },
  {
    label: "Rainwave",
    matches: [
      "*://rainwave.cc/*",
      "*://all.rainwave.cc/*",
      "*://game.rainwave.cc/*",
      "*://chiptune.rainwave.cc/*",
      "*://ocr.rainwave.cc/*",
      "*://covers.rainwave.cc/*"
    ],
    js: "rainwave.js",
    id: "rainwave"
  },
  {
    label: "Радиоволна.нет",
    matches: ["*://radiovolna.net/*"],
    js: "radiovolna.js",
    id: "radiovolna"
  },
  {
    label: "pCloud",
    matches: ["*://my.pcloud.com/*"],
    js: "pcloud.js",
    id: "pcloud"
  },
  {
    label: "JetSetRadio Live",
    matches: ["*://jetsetradio.live/*"],
    js: "jetsetradio.live.js",
    id: "jetsetradio.live"
  },
  {
    label: "Radio France",
    matches: ["*://www.radiofrance.fr/*"],
    js: "radiofrance.js",
    id: "radiofrance"
  },
  {
    label: "RemixRotation",
    matches: ["*://remixrotation.com/*"],
    js: "remixrotation.js",
    id: "remixrotation"
  },
  {
    label: "WFMU",
    matches: ["*://wfmu.org/*", "*://freeform.wfmu.org/*"],
    js: "wfmu.js",
    id: "wfmu"
  },
  {
    label: "SiriusXM",
    matches: [
      "*://www.siriusxm.com/*",
      "*://www.siriusxm.ca/*",
      "*://*.siriusxm.com/player/*"
    ],
    js: "siriusxm-player.js",
    id: "siriusxm-player"
  },
  {
    label: "1ting",
    matches: [
      "*://www.1ting.com/player/*",
      "*://www.1ting.com/p_*",
      "*://www.1ting.com/album*",
      "*://www.1ting.com/rand.php*",
      "*://www.1ting.com/day/*",
      "*://h5.1ting.com/*"
    ],
    js: "1ting.js",
    id: "1ting"
  },
  {
    label: "Douban Artists",
    matches: ["*://music.douban.com/artists/player/*"],
    js: "douban-artists.js",
    id: "douban-artists"
  },
  {
    label: "Kugou",
    matches: ["*://www.kugou.com/song/*"],
    js: "kugou.js",
    id: "kugou"
  },
  {
    label: "Gimme Radio",
    matches: [
      "*://gimmeradio.com/*",
      "*://www.gimmeradio.com/*",
      "*://gimmecountry.com/*",
      "*://www.gimmecountry.com/*",
      "*://gimmemetal.com/*",
      "*://www.gimmemetal.com/*"
    ],
    js: "gimmeradio.js",
    id: "gimmeradio"
  },
  {
    label: "9sky",
    matches: ["*://www.9sky.com/music*", "*://www.9sky.com/mv/detail*"],
    js: "9sky.js",
    id: "9sky"
  },
  {
    label: "Vagalume.FM",
    matches: ["*://vagalume.fm/*", "*://*.vagalume.com.br/*"],
    js: "vagalume.js",
    id: "vagalume"
  },
  {
    label: "Radiooooo",
    matches: ["*://app.radiooooo.com/*", "*://mobile.radiooooo.com/*"],
    js: "radiooooo.js",
    id: "radiooooo"
  },
  {
    label: "LetsLoop",
    matches: ["*://letsloop.com/*"],
    js: "letsloop.js",
    id: "letsloop"
  },
  {
    label: "mujRozhlas",
    matches: ["*://www.mujrozhlas.cz/*"],
    js: "mujrozhlas.js",
    id: "rozhlas"
  },
  {
    label: "blocSonic",
    matches: ["*://*.blocsonic.com/*"],
    js: "blocsonic.js",
    id: "blocsonic"
  },
  {
    label: "Resonate",
    matches: ["*://stream.resonate.coop/*"],
    js: "resonate.js",
    id: "resonate"
  },
  {
    label: "KEXP",
    matches: ["*://*.kexp.org/*"],
    js: "kexp.js",
    id: "kexp"
  },
  {
    label: "Hotmixradio.fr",
    matches: ["*://www.hotmixradio.fr/*"],
    js: "hotmixradio.js",
    id: "hotmixradio"
  },
  {
    label: "Aphex Twin",
    matches: ["*://aphextwin.warp.net/*"],
    js: "warp-aphextwin.js",
    id: "warp-aphextwin"
  },
  {
    label: "Zachary Seguin Music",
    matches: ["*://music.zacharyseguin.ca/*"],
    js: "musickit.js",
    id: "zacharyseguin"
  },
  {
    label: "Joox",
    matches: ["*://www.joox.com/*"],
    js: "joox.js",
    id: "joox"
  },
  {
    label: "Musish",
    matches: ["*://musi.sh/*"],
    js: "musickit.js",
    id: "musish"
  },
  {
    label: "1001tracklists",
    matches: ["*://www.1001tracklists.com/tracklist/*"],
    js: "1001tracklists.js",
    id: "1001tracklists"
  },
  {
    label: "YouTube Music",
    matches: ["*://music.youtube.com/*"],
    js: "youtube-music.js",
    id: "youtube-music"
  },
  {
    label: "Radiozenders.FM",
    matches: ["*://www.radiozenders.fm/*"],
    js: "radiozenders.js",
    id: "radiozenders"
  },
  {
    label: "Invidious",
    matches: ["*://*.invidio.us/*"],
    js: "invidious.js",
    id: "invidious"
  },
  {
    label: "Piped",
    matches: ["*://piped.video/*"],
    js: "piped.js",
    id: "piped"
  },
  {
    label: "Pretzel",
    matches: ["*://*.pretzel.rocks/*"],
    js: "pretzel.js",
    id: "pretzel"
  },
  {
    label: "Primordial Radio",
    matches: ["*://primordialradio.com/*"],
    js: "primordialradio.js",
    id: "primordialradio"
  },
  {
    label: "Radio Kyivstar",
    matches: ["*://radio.kyivstar.ua/*"],
    js: "kyivstar.js",
    id: "kyivstar"
  },
  {
    label: "Funkwhale",
    js: "funkwhale.js",
    id: "funkwhale"
  },
  {
    label: "Radio.co",
    matches: ["*://embed.radio.co/player/*"],
    js: "radioco.js",
    id: "radioco",
    allFrames: !0
  },
  {
    label: "R/a/dio",
    matches: ["*://r-a-d.io/*"],
    js: "r-a-d.io.js",
    id: "r-a-d.io"
  },
  {
    label: "Apple Music",
    matches: ["*://*music.apple.com/*"],
    js: "musickit.js",
    id: "apple-music"
  },
  {
    label: "Watch2Gether",
    matches: ["*://w2g.tv/*"],
    js: "watch2gether.js",
    id: "watch2gether"
  },
  {
    label: "Poolsuite",
    matches: ["*://poolsuite.net/*"],
    js: "poolsuite.js",
    id: "poolsuite"
  },
  {
    label: "GDS.FM",
    matches: ["*://www.gds.fm/*", "*://gds.fm/*"],
    js: "gds.fm.js",
    id: "gds"
  },
  {
    label: "RadioJavan",
    matches: ["*://play.radiojavan.com/*"],
    js: "radiojavan.js",
    id: "radiojavan"
  },
  {
    label: "Audiomack",
    matches: ["*://audiomack.com/*"],
    js: "audiomack.js",
    id: "audiomack"
  },
  {
    label: "Global Player",
    matches: ["*://www.globalplayer.com/*"],
    js: "globalplayer.js",
    id: "globalplayer"
  },
  {
    label: "The Current",
    matches: ["*://www.thecurrent.org/*"],
    js: "thecurrent.js",
    id: "thecurrent"
  },
  {
    label: "GRRIF",
    matches: ["*://*.grrif.ch/*"],
    js: "grrif.js",
    id: "grrif"
  },
  {
    label: "newgrounds",
    matches: ["*://www.newgrounds.com/audio*"],
    js: "newgrounds.js",
    id: "newgrounds"
  },
  {
    label: "Jango",
    matches: ["*://www.jango.com/*"],
    js: "jango.js",
    id: "jango"
  },
  {
    label: "Radio Record",
    matches: ["*://www.radiorecord.ru/*"],
    js: "radiorecord.js",
    id: "radiorecord"
  },
  {
    label: "Imago Radio",
    matches: ["*://*.imago.fm/*"],
    js: "imago.js",
    id: "imago"
  },
  {
    label: "Provoda.ch",
    matches: ["*://*.provoda.ch/*"],
    js: "provoda.ch.js",
    id: "provoda.ch"
  },
  {
    label: "Atomic Music Space",
    matches: ["*://stream.atomicmusic.space/*"],
    js: "atomicmusic.space.js",
    id: "atomicmusic.space"
  },
  {
    label: "The-radio.ru",
    matches: ["*://the-radio.ru/*"],
    js: "the-radio.ru.js",
    id: "the-radio.ru"
  },
  {
    label: "HQ Radio",
    matches: ["*://hqradio.ru/*"],
    js: "hqradio.js",
    id: "hqradio"
  },
  {
    label: "Smooth FM",
    matches: ["*://smoothfm.iol.pt/*"],
    js: "smoothfm.js",
    id: "smoothfm"
  },
  {
    label: "Relisten.net",
    matches: ["*://relisten.net/*"],
    js: "relisten.js",
    id: "relisten"
  },
  {
    label: "UpBeatRadio",
    matches: ["*://upbeatradio.net/*"],
    js: "upbeatradio.js",
    id: "upbeatradio"
  },
  {
    label: "Chillhop",
    matches: ["*://chillhop.com/*"],
    js: "chillhop.js",
    id: "chillhop"
  },
  {
    label: "Chillhop Radio",
    matches: ["*://app.chillhop.com/*"],
    js: "chillhop-radio.js",
    id: "chillhop-radio"
  },
  {
    label: "Shuffle",
    matches: ["*://shuffle.one/play*"],
    js: "shuffleone.js",
    id: "shuffleone"
  },
  {
    label: "JB FM",
    matches: ["*://jb.fm/player/*"],
    js: "jb.fm.js",
    id: "jbfm"
  },
  {
    label: "SECTOR Radio",
    matches: ["*://sectorradio.ru/*"],
    js: "sectorradio.js",
    id: "sectorradio"
  },
  {
    label: "LiveOne",
    matches: ["*://*.liveone.com/*"],
    js: "liveone.js",
    id: "liveone"
  },
  {
    label: "PocketCasts",
    matches: ["*://play.pocketcasts.com/*"],
    js: "pocketcasts.js",
    id: "pocketcasts"
  },
  {
    label: "Clyp",
    matches: ["*://clyp.it/*"],
    js: "clyp.js",
    id: "clyp"
  },
  {
    label: "RTBF Radio",
    matches: ["*://www.rtbf.be/radio/*"],
    js: "rtbf.js",
    id: "rtbf"
  },
  {
    label: "Musify",
    matches: ["*://*.musify.club/*"],
    js: "musify.js",
    id: "musify"
  },
  {
    label: "Radio Rethink",
    matches: ["*://www.radiorethink.com/*"],
    js: "radiorethink.js",
    id: "radiorethink"
  },
  {
    label: "SoundClick",
    matches: ["*://www.soundclick.com/*"],
    js: "soundclick.js",
    id: "soundclick"
  },
  {
    label: "Napster",
    matches: ["*://app.napster.com/*"],
    js: "napster.js",
    id: "napster"
  },
  {
    label: "abc.net.au",
    matches: ["*://www.abc.net.au/*/*live*/*"],
    js: "abc.net.au.js",
    id: "abcnetau"
  },
  {
    label: "JQBX",
    matches: ["*://app.jqbx.fm/*"],
    js: "jqbx.js",
    id: "jqbx"
  },
  {
    label: "Supla",
    matches: ["*://*.supla.fi/*"],
    js: "supla.js",
    id: "supla"
  },
  {
    label: "swr3",
    matches: ["*://www.swr3.de/*", "*://www.swr.de/*"],
    js: "swr3.js",
    id: "swr3"
  },
  {
    label: "Epidemic Sound",
    matches: ["*://*.epidemicsound.com/*"],
    js: "epidemicsound.js",
    id: "epidemicsound"
  },
  {
    label: "Rekt Network",
    matches: ["*://rekt.network/*"],
    js: "rekt.network.js",
    id: "rektnetwork"
  },
  {
    label: "Nightride FM",
    matches: ["*://nightride.fm/*"],
    js: "nightride.fm.js",
    id: "nightridefm"
  },
  {
    label: "Qobuz",
    matches: ["*://*.qobuz.com/*"],
    js: "qobuz.js",
    id: "qobuz"
  },
  {
    label: "TruckersFM",
    matches: ["*://*.truckers.fm/*"],
    js: "truckersfm.js",
    id: "truckersfm"
  },
  {
    label: "detektor.fm",
    matches: ["*://detektor.fm/*"],
    js: "detektorfm.js",
    id: "detektorfm"
  },
  {
    label: "iBroadcast",
    matches: ["*://media.ibroadcast.com/*"],
    js: "ibroadcast.js",
    id: "ibroadcast"
  },
  {
    label: "Radio7",
    matches: ["*://radio7.lv/*"],
    js: "radio7.js",
    id: "radio7lv"
  },
  {
    label: "Radio Nemiers",
    matches: ["*://radionemiers.com/*"],
    js: "radionemiers.js",
    id: "radionemiers"
  },
  {
    label: "Eggs",
    matches: ["*://eggs.mu/*"],
    js: "eggs.js",
    id: "eggs"
  },
  {
    label: "SubFire",
    matches: ["*://p.subfireplayer.net/*"],
    js: "subfire.js",
    id: "subfire"
  },
  {
    label: "Idagio",
    matches: ["*://app.idagio.com/*"],
    js: "idagio.js",
    id: "idagio"
  },
  {
    label: "Relax FM",
    matches: ["*://relax-fm.ru/*"],
    js: "relaxfm.js",
    id: "relaxfm"
  },
  {
    label: "Laut.fm",
    matches: ["*://laut.fm/*"],
    js: "laut.fm.js",
    id: "laut.fm"
  },
  {
    label: "Magnatune",
    matches: ["*://magnatune.com/*"],
    js: "magnatune.js",
    id: "magnatune"
  },
  {
    label: "Libre.fm",
    matches: ["*://libre.fm/*"],
    js: "librefm.js",
    id: "librefm"
  },
  {
    label: "Brain.fm",
    matches: ["*://my.brain.fm/*"],
    js: "brainfm.js",
    id: "brainfm"
  },
  {
    label: "bullofheaven.com",
    matches: ["*://bullofheaven.com/*"],
    js: "bullofheaven.com.js",
    id: "bullofheavencom"
  },
  {
    label: "All Classical Radio",
    matches: ["*://player.allclassical.org/*"],
    js: "allclassical.org.js",
    id: "allclassicalportland"
  },
  {
    label: "Migu Music",
    matches: ["*://music.migu.cn/*"],
    js: "migu-music.js",
    id: "migu-music"
  },
  {
    label: "Weibo",
    matches: ["*://weibo.com/*", "*://*.weibo.com/*"],
    js: "weibo.js",
    id: "weibo"
  },
  {
    label: "Street Voice",
    matches: ["*://www.streetvoice.cn/*", "*://streetvoice.com/*"],
    js: "streetvoice.js",
    id: "streetvoice"
  },
  {
    label: "Red Bull",
    matches: ["*://www.redbull.com/*"],
    js: "redbull.js",
    id: "redbull"
  },
  {
    label: "Synology",
    matches: [
      "*://*5000/*",
      "*://*5001/*",
      "*://*/?launchApp=SYNO.SDS.AudioStation.Application*"
    ],
    js: "synology.js",
    id: "synology"
  },
  {
    label: "Ragya",
    matches: ["*://www.ragya.com/*"],
    js: "ragya.js",
    id: "ragya"
  },
  {
    label: "CodeRadio",
    matches: ["*://coderadio.freecodecamp.org/*"],
    js: "coderadio.js",
    id: "coderadio"
  },
  {
    label: "LITT Live",
    matches: ["*://littlive.com/*"],
    js: "littlive.js",
    id: "dashradio"
  },
  {
    label: "Niconico",
    matches: ["*://www.nicovideo.jp/*"],
    js: "nicovideo.js",
    id: "nicovideo"
  },
  {
    label: "Звук",
    matches: ["*://zvuk.com/*"],
    js: "zvuk.js",
    id: "zvuk"
  },
  {
    label: "Navidrome",
    js: "navidrome.js",
    id: "navidrome"
  },
  {
    label: "LMS",
    js: "lms.js",
    id: "lms"
  },
  {
    label: "deepcut",
    matches: ["*://deepcut.live/*"],
    js: "deepcut.js",
    id: "deepcut.fm"
  },
  {
    label: "Burntable",
    matches: ["*://*.burntable.com/*"],
    js: "burntable.js",
    id: "burntable"
  },
  {
    label: "Stingray Music",
    matches: ["*://*.stingray.com/*"],
    js: "stingray.js",
    id: "stingray"
  },
  {
    label: "CBC Music",
    matches: ["*://www.cbc.ca/listen/cbc-music-playlists*"],
    js: "cbcmusic.js",
    id: "cbcmusic"
  },
  {
    label: "leanplayer",
    matches: ["*://*.leanplayer.com/*"],
    js: "leanplayer.js",
    id: "leanplayer"
  },
  {
    label: "Playlist Randomizer",
    matches: [
      "*://www.playlist-randomizer.com/*",
      "*://playlist-randomizer.com/*"
    ],
    js: "playlist-randomizer.js",
    id: "playlist-randomizer"
  },
  {
    label: "QueUp",
    matches: ["*://www.queup.net/*"],
    js: "queup.js",
    id: "queup"
  },
  {
    label: "SoundStack",
    matches: [
      "*://*.mystreamplayer.com/*",
      "*://player.gotradio.com/*",
      "*://player.live365.com/*",
      "*://player.181fm.com/*"
    ],
    js: "soundstack.js",
    id: "soundstack",
    allFrames: !0
  },
  {
    label: "Live365",
    matches: ["*://live365.com/*"],
    js: "live365.js",
    id: "live365"
  },
  {
    label: "Lounge.fm",
    matches: ["*://www.lounge.fm/*"],
    js: "lounge.fm.js",
    id: "lounge.fm"
  },
  {
    label: "EulerBeats",
    matches: ["*://eulerbeats.com/*"],
    js: "eulerbeats.js",
    id: "eulerbeats"
  },
  {
    label: "X-Team Radio",
    matches: ["*://radio.x-team.com/*"],
    js: "xteam-radio.js",
    id: "xteam-radio"
  },
  {
    label: "Calm",
    matches: ["*://*.calm.com/*"],
    js: "calm.js",
    id: "calm"
  },
  {
    label: "Keakie",
    matches: ["*://*.keakie.com/*"],
    js: "keakie.js",
    id: "keakie"
  },
  {
    label: "KKBOX",
    matches: ["*://*play.kkbox.com/*"],
    js: "kkbox.js",
    id: "kkbox"
  },
  {
    label: "Thrill Jockey",
    matches: ["*://thrilljockey.com/products/*"],
    js: "thrilljockey.js",
    id: "thrilljockey"
  },
  {
    label: "MediaStream",
    matches: [
      "*://sonarfm.cl/*",
      "*://playfm.cl/*",
      "*://player.wkmradio.com/*",
      "*://www.rockaxis.com/*"
    ],
    js: "mediastream.js",
    id: "mediastream"
  },
  {
    label: "Rock&Pop Chile",
    matches: ["*://www.rockandpop.cl/*"],
    js: "rockandpopcl.js",
    id: "rockandpopcl"
  },
  {
    label: "WYEP",
    matches: ["*://wyep.org/*"],
    js: "wyep.js",
    id: "wyep"
  },
  {
    label: "ZENO",
    matches: ["*://*zeno.fm/*"],
    js: "zeno.js",
    id: "zeno"
  },
  {
    label: "Naxos Music Library",
    matches: ["*://*.naxosmusiclibrary.com/*"],
    js: "naxosmusiclibrary.js",
    id: "naxosmusiclibrary"
  },
  {
    label: "Klassik Radio Plus",
    matches: ["*://klassikradioplus.de/*"],
    js: "klassikradioplus.js",
    id: "klassikradioplus"
  },
  {
    label: "Beetle",
    js: "beetle.js",
    id: "beetle"
  },
  {
    label: "RefNet",
    matches: ["*://listen.refnet.fm/*"],
    js: "refnet.js",
    id: "refnet"
  },
  {
    label: "La Radio du bord de l'eau",
    matches: ["*://*auborddeleau.radio/*"],
    js: "auborddeleau.radio.js",
    id: "auborddeleau.radio",
    allFrames: !0
  },
  {
    label: "Radio Willy",
    matches: ["*://*willy.radio/player/willy/*"],
    js: "willy.radio.js",
    id: "willy.radio"
  },
  {
    label: "NIGHT.FM",
    matches: ["*://*night.fm/*"],
    js: "night.fm.js",
    id: "night.fm"
  },
  {
    label: "Radio Nowy Swiat",
    matches: ["*://nowyswiat.online/*"],
    js: "nowyswiat.js",
    id: "nowyswiat"
  },
  {
    label: "Radiolla",
    matches: ["*://*radiolla.com/*"],
    js: "radiolla.js",
    id: "radiolla"
  },
  {
    label: "Oxigenio.fm",
    matches: ["*://*oxigenio.fm/*"],
    js: "oxigenio.fm.js",
    id: "oxigenio.fm"
  },
  {
    label: "Intergalactic FM",
    matches: ["*://*intergalactic.fm/*"],
    js: "intergalacticfm.js",
    id: "intergalactic.fm"
  },
  {
    label: "Irama Nusantara",
    matches: ["*://*.iramanusantara.org/*"],
    js: "iramanusantara.js",
    id: "iramanusantara"
  },
  {
    label: "Yammat FM",
    matches: ["*://*yammat.fm/*"],
    js: "yammat.fm.js",
    id: "yammat.fm"
  },
  {
    label: "Husk Recordings",
    matches: ["*://huskrecordings.com/music/*"],
    js: "huskrecordings.js",
    id: "huskrecordings"
  },
  {
    label: "nugs.net",
    matches: ["*://play.nugs.net/*"],
    js: "nugs.js",
    id: "nugs"
  },
  {
    label: "livephish.com",
    matches: ["*://plus.livephish.com/*"],
    js: "livephish.js",
    id: "livephish.com"
  },
  {
    label: "Ishkur's Guide to Electronic Music",
    matches: ["*://music.ishkur.com/*"],
    js: "ishkur.js",
    id: "music.ishkur.com"
  },
  {
    label: "Nonoki",
    matches: ["*://nonoki.com/music/*"],
    js: "nonoki.js",
    id: "nonoki"
  },
  {
    label: "Beatbump",
    matches: ["*://beatbump.io/*"],
    js: "beatbump.js",
    id: "beatbump"
  },
  {
    label: "LINE MUSIC",
    matches: ["*://music.line.me/*"],
    js: "line-music.js",
    id: "linemusic"
  },
  {
    label: "KCRW",
    matches: ["*://www.kcrw.com/*"],
    js: "kcrw.js",
    id: "kcrw"
  },
  {
    label: "World Fusion Radio",
    matches: ["*://worldfusionradio.com/*"],
    js: "worldfusionradio.js",
    id: "worldfusionradio"
  },
  {
    label: "Hardtunes",
    matches: [
      "*://www.hard-tunes.de/*",
      "*://www.hardtunes.com/*",
      "*://www.hardtunes.fr/*",
      "*://www.hardtunes.it/*",
      "*://www.hardtunes.nl/*"
    ],
    js: "hardtunes.js",
    id: "hardtunes"
  },
  {
    label: "KINK",
    matches: ["*://kink.nl/player", "*://kink.nl/player/*"],
    js: "kinknl.js",
    id: "kinknl"
  },
  {
    label: "The Jazz Groove",
    matches: ["*://jazzgroove.org/*"],
    js: "jazzgroove.js",
    id: "jazzgroove"
  },
  {
    label: "XRAY.FM",
    matches: ["*://*.xray.fm/*"],
    js: "xrayfm.js",
    id: "xrayfm"
  },
  {
    label: "DKFM Shoegaze Radio",
    matches: ["*://decayfm.com/*"],
    js: "decayfm.js",
    id: "decayfm"
  },
  {
    label: "QCIndie",
    matches: ["*://www.qcindie.com/listen-live/*"],
    js: "qcindie.js",
    id: "qcindie"
  },
  {
    label: "Colorado Public Radio",
    matches: ["*://www.cpr.org/*"],
    js: "cpr.js",
    id: "cpr"
  },
  {
    label: "WXPN",
    matches: ["*://xpn.org/*"],
    js: "xpn.js",
    id: "xpn"
  },
  {
    label: "FRISKY",
    matches: ["*://*.frisky.fm/*"],
    js: "friskyfm.js",
    id: "friskyfm"
  },
  {
    label: "LightningStream",
    matches: [
      "*://*.lightningstream.com/Player*",
      "*://*.lightningstream.com/player*"
    ],
    js: "lightningstream.js",
    id: "lightningstream"
  },
  {
    label: "Securenet Systems",
    matches: [
      "*://radio.securenetsystems.net/*",
      "*://stream*.securenetsystems.net/*"
    ],
    js: "securenetsystems.js",
    id: "securenetsystems"
  },
  {
    label: "uwu radio",
    matches: ["*://radio.uwu.network/*"],
    js: "uwu-radio.js",
    id: "uwu-radio"
  },
  {
    label: "Amazing Radio",
    matches: ["*://amazingradio.com/*", "*://amazingradio.us/*"],
    js: "amazingradio.js",
    id: "amazingradio"
  },
  {
    label: "DR Lyd",
    matches: ["*://www.dr.dk/lyd*"],
    js: "dr-lyd.js",
    id: "dr-lyd"
  },
  {
    label: "ROCK ANTENNE",
    matches: [
      "*://www.rockantenne.de/*",
      "*://www.rockantenne.bayern/*",
      "*://www.rockantenne.hamburg/*",
      "*://www.rockantenne.nrw/*",
      "*://www.rockantenne.at/*"
    ],
    js: "rockantenne.js",
    id: "rockantenne"
  },
  {
    label: "copyparty",
    matches: ["*://127.0.0.1:3923/*", "*://a.ocv.me/*"],
    js: "copyparty.js",
    id: "copyparty"
  },
  {
    label: "Radio Caprice",
    matches: ["*://radcap.ru/*"],
    js: "radcap.js",
    id: "radcap"
  },
  {
    label: "TrackerHub",
    matches: ["*://trackerhub.vercel.app/*", "*://trackerhub.cx/*"],
    js: "trackerhub.js",
    id: "trackerhub"
  },
  {
    label: "Gensokyo Radio",
    matches: ["*://gensokyoradio.net/*"],
    js: "gensokyoradio.js",
    id: "gensokyoradio"
  },
  {
    label: "Stationhead",
    matches: ["*://*stationhead.com/*"],
    js: "stationhead.js",
    id: "stationhead"
  },
  {
    label: "TECHNOBASE.FM",
    matches: [
      "*://*technobase.fm/*",
      "*://*housetime.fm/*",
      "*://*hardbase.fm/*",
      "*://*trancebase.fm/*",
      "*://*coretime.fm/*",
      "*://*clubtime.fm/*",
      "*://*teatime.fm/*",
      "*://*replay.fm/*"
    ],
    js: "technobase.fm.js",
    id: "technobase.fm"
  },
  {
    label: "Telegram A",
    matches: ["*://web.telegram.org/a/*"],
    js: "telegram-a.js",
    id: "telegram-a"
  },
  {
    label: "Telegram K",
    matches: ["*://web.telegram.org/k/*"],
    js: "telegram-k.js",
    id: "telegram-k"
  },
  {
    label: "TuneGenieEmbed",
    matches: ["*://b3.tunegenie.com/*"],
    js: "tunegenie-embed.js",
    id: "tunegenie-embed",
    allFrames: !0
  },
  {
    label: "TuneGenie",
    matches: ["*://*.tunegenie.com/*"],
    js: "tunegenie.js",
    id: "tunegenie"
  },
  {
    label: "RTL+ Musik",
    matches: ["*://plus.rtl.de/*"],
    js: "rtl-plus-musik.js",
    id: "rtl-plus-musik"
  },
  {
    label: "Tomorrowland",
    matches: ["*://www.tomorrowland.com/*"],
    js: "tomorrowland.js",
    id: "tomorrowland"
  },
  {
    label: "hearthis.at",
    matches: ["*://hearthis.at/*"],
    js: "hearthis-at.js",
    id: "hearthis-at"
  },
  {
    label: "Radio Italia",
    matches: ["*://www.radioitalia.it/*"],
    js: "radio-italia.js",
    id: "radio-italia"
  },
  {
    label: "Lyden av Norge",
    matches: ["*://www.lydenavnorge.no/*"],
    js: "lyden-av-norge.js",
    id: "lyden-av-norge"
  },
  {
    label: "audio.com",
    matches: ["*://audio.com/*"],
    js: "audio.js",
    id: "audio-com"
  },
  {
    label: "AfroCharts",
    matches: ["*://*.afrocharts.com/*"],
    js: "afrocharts.js",
    id: "afrocharts"
  },
  {
    label: "Ed Banger Records",
    matches: ["*://*.edbangerrecords.com/*"],
    js: "ed-banger-records.js",
    id: "ed-banger-records"
  },
  {
    label: "Hyperpipe",
    matches: ["*://hyperpipe.surge.sh/*"],
    js: "hyperpipe.js",
    id: "hyperpipe"
  },
  {
    label: "Radiofreccia",
    matches: ["*://play.rtl.it/live/*"],
    js: "radiofreccia.js",
    id: "radiofreccia"
  },
  {
    label: "khinsider",
    matches: ["*://downloads.khinsider.com/*"],
    js: "khinsider.js",
    id: "khinsider"
  },
  {
    label: "WDR",
    matches: ["*://*.wdr.de/radio/*"],
    js: "wdr.js",
    id: "wdr"
  },
  {
    label: "radio.de",
    matches: ["*://www.radio.de/*", "*://www.radio.net/*"],
    js: "radio.de.js",
    id: "radiode"
  },
  {
    label: "FMSpins",
    matches: ["*://*.fmspins.com/*"],
    js: "fmspins.js",
    id: "fmspins"
  },
  {
    label: "KissVK",
    matches: ["*://kissvk.top/*"],
    js: "kissvk.js",
    id: "kissvk"
  },
  {
    label: "Radio Student",
    matches: ["*://www.radiostudent.hr/*"],
    js: "radiostudent.js",
    id: "radiostudent"
  },
  {
    label: "BiliBili",
    matches: ["*://www.bilibili.com/*"],
    js: "bilibili.js",
    id: "bilibili",
    usesBlocklist: !0
  },
  {
    label: "jam.coop",
    matches: ["*://jam.coop/*"],
    js: "jam.coop.js",
    id: "jam.coop"
  },
  {
    label: "Zing MP3",
    matches: ["*://zingmp3.vn/*"],
    js: "zingmp3.js",
    id: "zingmp3"
  },
  {
    label: "NTS",
    matches: ["*://*nts.live/*"],
    js: "nts.js",
    id: "nts"
  },
  {
    label: "earth.fm",
    matches: ["*://earth.fm/*"],
    js: "earth.fm.js",
    id: "earthfm"
  },
  {
    label: "apt-get's auditorium",
    matches: ["*://tunes.apt-get.xyz/*"],
    js: "apt-get-tunes.js",
    id: "apt-get-tunes"
  },
  {
    label: "AzuraCast",
    js: "azuracast.js",
    id: "azuracast"
  },
  {
    label: "scrobblerad.io",
    matches: ["*://scrobblerad.io/*"],
    js: "scrobbleradio.js",
    id: "scrobbleradio"
  },
  {
    label: "VocaDB",
    matches: ["*://vocadb.net/*"],
    js: "vocadb.js",
    id: "vocadb"
  },
  {
    label: "UtaiteDB",
    matches: ["*://utaitedb.net/*"],
    js: "vocadb.js",
    id: "utaitedb"
  },
  {
    label: "TouhouDB",
    matches: ["*://touhoudb.com/*"],
    js: "vocadb.js",
    id: "touhoudb"
  },
  {
    label: "weareone.fm",
    matches: ["*://weareone.fm/*"],
    js: "weareone.js",
    id: "weareone"
  },
  {
    label: "Bollerwagen",
    matches: ["*://radiobollerwagen.de/*"],
    js: "bollerwagen.js",
    id: "bollerwagen"
  },
  {
    label: "МТС Музыка",
    matches: ["*://music.mts.ru/*"],
    js: "mts-music.js",
    id: "mts-music"
  },
  {
    label: "ChirpRadio",
    matches: ["*://chirpradio.org/*"],
    js: "chirpradio.js",
    id: "chirpradio"
  },
  {
    label: "OnlyHit",
    matches: ["*://onlyhit.us/*"],
    js: "onlyhit.js",
    id: "onlyhit"
  },
  {
    label: "InstantAudio",
    matches: [
      "*://instant.audio/*",
      // North America
      "*://radiosdecuba.com/*",
      "*://radio.ht/*",
      "*://jamaicaradio.net/*",
      "*://emisoras.com.mx/*",
      "*://radiosdepuertorico.com/*",
      "*://radios.com.do/*",
      "*://trinidadradiostations.net/*",
      // Central America
      "*://radios.co.cr/*",
      "*://radios.com.sv/*",
      "*://emisoras.com.gt/*",
      "*://radios.hn/*",
      "*://radios.co.ni/*",
      "*://radios.com.pa/*",
      // South America
      "*://radioarg.com/*",
      "*://radios.com.bo/*",
      "*://radiosaovivo.net/*",
      "*://emisora.cl/*",
      "*://radios.com.co/*",
      "*://radios.com.ec/*",
      "*://emisoras.com.py/*",
      "*://radios.com.pe/*",
      "*://surinaamseradio.com/*",
      "*://radios.com.uy/*",
      "*://radio.co.ve/*",
      // Europe
      "*://radiosonline.be/*",
      "*://ceskaradiaonline.cz/*",
      "*://radio.co.dk/*",
      "*://radiolisten.de/*",
      "*://raadiod.com/*",
      "*://emisora.org.es/*",
      "*://ecouterradioenligne.com/*",
      "*://radiofona.com.gr/*",
      "*://radios.hr/*",
      "*://ieradio.org/*",
      "*://ascoltareradio.com/*",
      "*://latvijasradio.com/*",
      "*://radios.lu/*",
      "*://radijas.org/*",
      "*://radiohallgatas.hu/*",
      "*://nederlandseradio.nl/*",
      "*://nettradionorge.com/*",
      "*://radios.co.at/*",
      "*://onlineradio.pl/*",
      "*://radioonline.com.pt/*",
      "*://radio.org.ro/*",
      "*://radiosonline.ch/*",
      "*://siradio.si/*",
      "*://radiostanice.rs/*",
      "*://nettiradiot.org/*",
      "*://radio.org.se/*",
      "*://internetradiouk.com/*",
      "*://bg-radio.org/*",
      "*://radio.pp.ru/*",
      "*://radioua.net/*",
      // Africa
      "*://radioalgerie.eu/*",
      "*://radio.co.cm/*",
      "*://radio.cd/*",
      "*://radio.co.ci/*",
      "*://radio.com.gh/*",
      "*://radio.or.ke/*",
      "*://radio.mg/*",
      "*://radio.co.ma/*",
      "*://egyptradio.net/*",
      "*://radio.org.ng/*",
      "*://radio.sn/*",
      "*://radiosa.org/*",
      "*://radiotunisienne.org/*",
      "*://radio.co.ug/*",
      // Asia
      "*://radio-bd.com/*",
      "*://radioonline.kr/*",
      "*://radios.hk/*",
      "*://onlineradios.in/*",
      "*://radioonline.co.id/*",
      "*://radioonline.my/*",
      "*://radionp.com/*",
      "*://jpradio.jp/*",
      "*://radio.net.pk/*",
      "*://radio.org.ph/*",
      "*://radiosingapore.org/*",
      "*://radio.com.lk/*",
      "*://vietnamradio.org/*",
      "*://radios.org.il/*",
      "*://radioth.net/*",
      "*://zhibo.fm/*",
      "*://radios.tw/*",
      // Oceania
      "*://radioau.net/*",
      "*://radio.org.nz/*"
    ],
    js: "instantaudio.js",
    id: "instantaudio"
  },
  {
    label: "Basspistol Radio",
    matches: ["*://*.basspistol.com/*"],
    js: "basspistol.js",
    id: "basspistol"
  },
  {
    label: "MyTuner",
    matches: ["*://mytuner-radio.com/*"],
    js: "mytuner.js",
    id: "mytuner"
  },
  {
    label: "Mirlo",
    matches: ["*://mirlo.space/*"],
    js: "mirlo.js",
    id: "mirlo"
  },
  {
    label: "Simulator Radio",
    matches: ["*://*.simulatorradio.com/*"],
    js: "simulatorradio.js",
    id: "simulatorradio"
  },
  {
    label: "Echo",
    matches: ["*://echo.sleepyfran.me/*"],
    js: "echo.js",
    id: "echo"
  },
  {
    label: "Gizz Tapes",
    matches: ["*://tapes.kglw.net/*"],
    js: "tapes-kglw.js",
    id: "tapes-kglw"
  },
  {
    label: "Systrum Sistum Radio",
    matches: ["*://systrum.net/*"],
    js: "systrum.js",
    id: "systrum"
  },
  {
    label: "cosine.club",
    matches: ["*://cosine.club/*"],
    js: "cosine.club.js",
    id: "cosine.club"
  },
  {
    label: "The Indie Beat Radio",
    matches: ["*://theindiebeat.fm/*"],
    js: "theindiebeat.js",
    id: "theindiebeat"
  },
  {
    label: "Musique Approximative",
    matches: ["*://*.musiqueapproximative.net/*"],
    js: "musiqueapproximative.js",
    id: "musiqueapproximative"
  },
  {
    label: "Suno AI",
    matches: ["*://suno.com/*"],
    js: "suno.js",
    id: "suno"
  },
  {
    label: "[untitled]",
    matches: ["*://untitled.stream/*"],
    js: "untitled.js",
    id: "[untitled]"
  },
  {
    label: "DAB Music Player",
    matches: ["*://dab.yeet.su/*", "*://dabmusic.xyz/*"],
    js: "dabmusic.js",
    id: "dabmusic"
  },
  {
    label: "GBS-FM",
    matches: ["*://gbs.fm/*"],
    js: "gbs.fm.js",
    id: "gbs"
  },
  {
    label: "Yumi Co. Radio",
    matches: ["*://yumicoradio.net/*"],
    js: "yumicoradio.js",
    id: "yumicoradio"
  },
  {
    label: "Kosmik Dstroyer",
    matches: ["*://kosmik-dstroyer.top/*"],
    js: "kosmik-dstroyer.js",
    id: "kosmik-dstroyer"
  },
  {
    label: "LaTeX 4000",
    matches: ["*://nonacademic.net/*"],
    js: "nonacademic.js",
    id: "nonacademic"
  },
  {
    label: "gravity.fm",
    matches: ["*://gravity.fm/*"],
    js: "gravity.fm.js",
    id: "gravity"
  },
  {
    label: "Archaic Horizon",
    matches: ["*://archaichorizon.com/*", "*://www.archaichorizon.com/*"],
    js: "archaichorizon.js",
    id: "archaichorizon"
  },
  {
    label: "Aonsoku",
    matches: ["*://aonsoku.vercel.app/*"],
    js: "aonsoku.js",
    id: "aonsoku"
  },
  {
    label: "CREAMER NATION",
    matches: ["*://creamernation.men/*"],
    js: "creamernation.js",
    id: "creamer-nation"
  },
  {
    label: "Feishin",
    matches: ["*://feishin.vercel.app/*"],
    js: "feishin.js",
    id: "feishin"
  },
  {
    label: "Ampwall",
    matches: ["*://ampwall.com/*"],
    js: "ampwall.js",
    id: "ampwall"
  },
  {
    label: "WQXR",
    matches: ["*://www.wqxr.org/*"],
    js: "wqxr.js",
    id: "wqxr"
  },
  {
    label: "Monochrome",
    matches: [
      "*://monochrome.prigoana.com/*",
      "*://monochrome.tf/*",
      "*://monochrome.samidy.com/*",
      "*://monochrome-back.pages.dev/*"
    ],
    js: "monochrome.js",
    id: "monochrome"
  },
  {
    label: "WeeklyBeats",
    matches: ["*://weeklybeats.com/*"],
    js: "weeklybeats.js",
    id: "weeklybeats"
  },
  {
    label: "XRaydio",
    matches: ["*://xraydio.net/*"],
    js: "xraydio.js",
    id: "xraydio"
  },
  {
    label: "Cytu.be",
    matches: ["*://cytu.be/r/*"],
    js: "cytu-be.js",
    id: "cytu-be"
  },
  {
    label: "Telegram Audio Player",
    matches: ["*://teleplay.rv7.nl/*"],
    js: "teleplay.js",
    id: "teleplay"
  },
  {
    label: "Subvert",
    matches: ["*://*.subvert.fm/*"],
    js: "subvert.js",
    id: "subvert"
  },
  {
    label: "Debrid Vault",
    matches: ["*://debridvault.elfhosted.com/*"],
    js: "debridvault.js",
    id: "debridvault"
  },
  {
    label: "Radio Swiss Classic",
    matches: [
      "*://www.radioswissclassic.ch/*",
      "*://www.radioswissjazz.ch/*",
      "*://www.radioswisspop.ch/*"
    ],
    js: "radioswissclassic.js",
    id: "radioswissclassic"
  },
  {
    label: "Rockserwis.fm",
    matches: ["*://rockserwis.fm/*"],
    js: "rockserwis.fm.js",
    id: "rockserwis.fm"
  },
  {
    label: "Bossa Jazz Brasil",
    matches: ["*://bossajazzbrasil.com/ouca-on-line/*"],
    js: "bossajazzbrazil.js",
    id: "bossajazzbrazil"
  },
  {
    label: "Kiss rádio",
    matches: ["*://www.kiss.cz/online/*"],
    js: "kiss.js",
    id: "kiss"
  },
  {
    label: "Radio SAW",
    matches: ["*://www.radiosaw.de/*"],
    js: "radiosaw.js",
    id: "radiosaw"
  },
  {
    label: "Radio SWH",
    matches: ["*://play.radioswh.lv/*"],
    js: "radioswh.js",
    id: "radioswh"
  },
  {
    label: "Star FM",
    matches: ["*://tv3.lv/starfm/online/*"],
    js: "starfm.js",
    id: "starfm"
  },
  {
    label: "bandwagon",
    matches: ["*://bandwagon.fm/*"],
    js: "bandwagon.js",
    id: "bandwagon"
  },
  {
    label: "Meloradio",
    matches: ["*://player.meloradio.pl/*"],
    js: "meloradio.js",
    id: "meloradio"
  },
  {
    label: "The Indie Beat Television",
    matches: ["*://tv.theindiebeat.fm/*"],
    js: "theindiebeat-owncast.js",
    id: "theindiebeat-tv"
  },
  {
    label: "escradio",
    matches: ["*://www.escradio.com/player/*"],
    js: "escradio.js",
    id: "escradio"
  },
  {
    label: "musicMe",
    matches: ["*://*.musicme.com/*"],
    js: "musicme.js",
    id: "musicme",
    allFrames: !0
  },
  {
    label: "zxART",
    matches: ["*://zxart.ee/*"],
    js: "zxart.js",
    id: "zxart"
  },
  {
    label: "DNA Lounge",
    matches: ["*://www.dnalounge.com/webcast/video.html"],
    js: "dnalounge.js",
    id: "dnalounge"
  },
  {
    label: "The Lot Radio",
    matches: ["*://www.thelotradio.com/shows/*"],
    js: "thelotradio.js",
    id: "thelotradio"
  },
  {
    label: "pixabay",
    matches: [
      "*://pixabay.com/music/*",
      "*://pixabay.com/users/*",
      "*://pixabay.com/playlists/*",
      "*://pixabay.com/accounts/playlists/*"
    ],
    js: "pixabay.js",
    id: "pixabay"
  },
  {
    label: "WPGU",
    matches: ["*://wpgu.com/*"],
    js: "wpgu.js",
    id: "wpgu"
  },
  {
    label: "Radyo Plyr",
    matches: ["*://radyovoyage.com/*", "*://radioeksen.com/*"],
    js: "radyoplyr.js",
    id: "radyoplyr"
  },
  {
    label: "SoundScout",
    matches: ["*://www.soundscout.com/player/*"],
    js: "soundscout.js",
    id: "soundscout"
  }
];
function ft(s) {
  return s.replace(/[$()*+.?[\\^{|}]/g, "\\$&");
}
function Qe(s) {
  return s.split("*").map(ft).join(".*");
}
function As(s) {
  if (typeof s != "string")
    return null;
  const e = /^(\*|https?):\/\/([^/]*)(\/.*)/.exec(s);
  if (!e)
    return null;
  const t = e[1], r = e[2], a = e[3];
  let i = "^";
  if (t === "*" ? i += "https?" : i += `${t}`, i += ft("://"), r === "*")
    i += "[^\\/]+";
  else if (r) {
    let n = r;
    r.startsWith("*.") && (i += "([^\\/]+\\.|)", n = n.substr(2)), i += Qe(n);
  } else
    return null;
  return i += Qe(a), i += "$", new RegExp(i);
}
function ks(s, e) {
  const t = As(e);
  return t ? t.test(s) : !1;
}
function bt(s) {
  return s && s.__esModule && Object.prototype.hasOwnProperty.call(s, "default") ? s.default : s;
}
var fe = { exports: {} }, vs = fe.exports, Xe;
function Rs() {
  return Xe || (Xe = 1, (function(s, e) {
    (function(t, r) {
      r(s);
    })(typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : vs, function(t) {
      if (!(globalThis.chrome && globalThis.chrome.runtime && globalThis.chrome.runtime.id))
        throw new Error("This script should only be loaded in a browser extension.");
      if (globalThis.browser && globalThis.browser.runtime && globalThis.browser.runtime.id)
        t.exports = globalThis.browser;
      else {
        const r = "The message port closed before a response was received.", a = (i) => {
          const n = {
            alarms: {
              clear: {
                minArgs: 0,
                maxArgs: 1
              },
              clearAll: {
                minArgs: 0,
                maxArgs: 0
              },
              get: {
                minArgs: 0,
                maxArgs: 1
              },
              getAll: {
                minArgs: 0,
                maxArgs: 0
              }
            },
            bookmarks: {
              create: {
                minArgs: 1,
                maxArgs: 1
              },
              get: {
                minArgs: 1,
                maxArgs: 1
              },
              getChildren: {
                minArgs: 1,
                maxArgs: 1
              },
              getRecent: {
                minArgs: 1,
                maxArgs: 1
              },
              getSubTree: {
                minArgs: 1,
                maxArgs: 1
              },
              getTree: {
                minArgs: 0,
                maxArgs: 0
              },
              move: {
                minArgs: 2,
                maxArgs: 2
              },
              remove: {
                minArgs: 1,
                maxArgs: 1
              },
              removeTree: {
                minArgs: 1,
                maxArgs: 1
              },
              search: {
                minArgs: 1,
                maxArgs: 1
              },
              update: {
                minArgs: 2,
                maxArgs: 2
              }
            },
            browserAction: {
              disable: {
                minArgs: 0,
                maxArgs: 1,
                fallbackToNoCallback: !0
              },
              enable: {
                minArgs: 0,
                maxArgs: 1,
                fallbackToNoCallback: !0
              },
              getBadgeBackgroundColor: {
                minArgs: 1,
                maxArgs: 1
              },
              getBadgeText: {
                minArgs: 1,
                maxArgs: 1
              },
              getPopup: {
                minArgs: 1,
                maxArgs: 1
              },
              getTitle: {
                minArgs: 1,
                maxArgs: 1
              },
              openPopup: {
                minArgs: 0,
                maxArgs: 0
              },
              setBadgeBackgroundColor: {
                minArgs: 1,
                maxArgs: 1,
                fallbackToNoCallback: !0
              },
              setBadgeText: {
                minArgs: 1,
                maxArgs: 1,
                fallbackToNoCallback: !0
              },
              setIcon: {
                minArgs: 1,
                maxArgs: 1
              },
              setPopup: {
                minArgs: 1,
                maxArgs: 1,
                fallbackToNoCallback: !0
              },
              setTitle: {
                minArgs: 1,
                maxArgs: 1,
                fallbackToNoCallback: !0
              }
            },
            browsingData: {
              remove: {
                minArgs: 2,
                maxArgs: 2
              },
              removeCache: {
                minArgs: 1,
                maxArgs: 1
              },
              removeCookies: {
                minArgs: 1,
                maxArgs: 1
              },
              removeDownloads: {
                minArgs: 1,
                maxArgs: 1
              },
              removeFormData: {
                minArgs: 1,
                maxArgs: 1
              },
              removeHistory: {
                minArgs: 1,
                maxArgs: 1
              },
              removeLocalStorage: {
                minArgs: 1,
                maxArgs: 1
              },
              removePasswords: {
                minArgs: 1,
                maxArgs: 1
              },
              removePluginData: {
                minArgs: 1,
                maxArgs: 1
              },
              settings: {
                minArgs: 0,
                maxArgs: 0
              }
            },
            commands: {
              getAll: {
                minArgs: 0,
                maxArgs: 0
              }
            },
            contextMenus: {
              remove: {
                minArgs: 1,
                maxArgs: 1
              },
              removeAll: {
                minArgs: 0,
                maxArgs: 0
              },
              update: {
                minArgs: 2,
                maxArgs: 2
              }
            },
            cookies: {
              get: {
                minArgs: 1,
                maxArgs: 1
              },
              getAll: {
                minArgs: 1,
                maxArgs: 1
              },
              getAllCookieStores: {
                minArgs: 0,
                maxArgs: 0
              },
              remove: {
                minArgs: 1,
                maxArgs: 1
              },
              set: {
                minArgs: 1,
                maxArgs: 1
              }
            },
            devtools: {
              inspectedWindow: {
                eval: {
                  minArgs: 1,
                  maxArgs: 2,
                  singleCallbackArg: !1
                }
              },
              panels: {
                create: {
                  minArgs: 3,
                  maxArgs: 3,
                  singleCallbackArg: !0
                },
                elements: {
                  createSidebarPane: {
                    minArgs: 1,
                    maxArgs: 1
                  }
                }
              }
            },
            downloads: {
              cancel: {
                minArgs: 1,
                maxArgs: 1
              },
              download: {
                minArgs: 1,
                maxArgs: 1
              },
              erase: {
                minArgs: 1,
                maxArgs: 1
              },
              getFileIcon: {
                minArgs: 1,
                maxArgs: 2
              },
              open: {
                minArgs: 1,
                maxArgs: 1,
                fallbackToNoCallback: !0
              },
              pause: {
                minArgs: 1,
                maxArgs: 1
              },
              removeFile: {
                minArgs: 1,
                maxArgs: 1
              },
              resume: {
                minArgs: 1,
                maxArgs: 1
              },
              search: {
                minArgs: 1,
                maxArgs: 1
              },
              show: {
                minArgs: 1,
                maxArgs: 1,
                fallbackToNoCallback: !0
              }
            },
            extension: {
              isAllowedFileSchemeAccess: {
                minArgs: 0,
                maxArgs: 0
              },
              isAllowedIncognitoAccess: {
                minArgs: 0,
                maxArgs: 0
              }
            },
            history: {
              addUrl: {
                minArgs: 1,
                maxArgs: 1
              },
              deleteAll: {
                minArgs: 0,
                maxArgs: 0
              },
              deleteRange: {
                minArgs: 1,
                maxArgs: 1
              },
              deleteUrl: {
                minArgs: 1,
                maxArgs: 1
              },
              getVisits: {
                minArgs: 1,
                maxArgs: 1
              },
              search: {
                minArgs: 1,
                maxArgs: 1
              }
            },
            i18n: {
              detectLanguage: {
                minArgs: 1,
                maxArgs: 1
              },
              getAcceptLanguages: {
                minArgs: 0,
                maxArgs: 0
              }
            },
            identity: {
              launchWebAuthFlow: {
                minArgs: 1,
                maxArgs: 1
              }
            },
            idle: {
              queryState: {
                minArgs: 1,
                maxArgs: 1
              }
            },
            management: {
              get: {
                minArgs: 1,
                maxArgs: 1
              },
              getAll: {
                minArgs: 0,
                maxArgs: 0
              },
              getSelf: {
                minArgs: 0,
                maxArgs: 0
              },
              setEnabled: {
                minArgs: 2,
                maxArgs: 2
              },
              uninstallSelf: {
                minArgs: 0,
                maxArgs: 1
              }
            },
            notifications: {
              clear: {
                minArgs: 1,
                maxArgs: 1
              },
              create: {
                minArgs: 1,
                maxArgs: 2
              },
              getAll: {
                minArgs: 0,
                maxArgs: 0
              },
              getPermissionLevel: {
                minArgs: 0,
                maxArgs: 0
              },
              update: {
                minArgs: 2,
                maxArgs: 2
              }
            },
            pageAction: {
              getPopup: {
                minArgs: 1,
                maxArgs: 1
              },
              getTitle: {
                minArgs: 1,
                maxArgs: 1
              },
              hide: {
                minArgs: 1,
                maxArgs: 1,
                fallbackToNoCallback: !0
              },
              setIcon: {
                minArgs: 1,
                maxArgs: 1
              },
              setPopup: {
                minArgs: 1,
                maxArgs: 1,
                fallbackToNoCallback: !0
              },
              setTitle: {
                minArgs: 1,
                maxArgs: 1,
                fallbackToNoCallback: !0
              },
              show: {
                minArgs: 1,
                maxArgs: 1,
                fallbackToNoCallback: !0
              }
            },
            permissions: {
              contains: {
                minArgs: 1,
                maxArgs: 1
              },
              getAll: {
                minArgs: 0,
                maxArgs: 0
              },
              remove: {
                minArgs: 1,
                maxArgs: 1
              },
              request: {
                minArgs: 1,
                maxArgs: 1
              }
            },
            runtime: {
              getBackgroundPage: {
                minArgs: 0,
                maxArgs: 0
              },
              getPlatformInfo: {
                minArgs: 0,
                maxArgs: 0
              },
              openOptionsPage: {
                minArgs: 0,
                maxArgs: 0
              },
              requestUpdateCheck: {
                minArgs: 0,
                maxArgs: 0
              },
              sendMessage: {
                minArgs: 1,
                maxArgs: 3
              },
              sendNativeMessage: {
                minArgs: 2,
                maxArgs: 2
              },
              setUninstallURL: {
                minArgs: 1,
                maxArgs: 1
              }
            },
            sessions: {
              getDevices: {
                minArgs: 0,
                maxArgs: 1
              },
              getRecentlyClosed: {
                minArgs: 0,
                maxArgs: 1
              },
              restore: {
                minArgs: 0,
                maxArgs: 1
              }
            },
            storage: {
              local: {
                clear: {
                  minArgs: 0,
                  maxArgs: 0
                },
                get: {
                  minArgs: 0,
                  maxArgs: 1
                },
                getBytesInUse: {
                  minArgs: 0,
                  maxArgs: 1
                },
                remove: {
                  minArgs: 1,
                  maxArgs: 1
                },
                set: {
                  minArgs: 1,
                  maxArgs: 1
                }
              },
              managed: {
                get: {
                  minArgs: 0,
                  maxArgs: 1
                },
                getBytesInUse: {
                  minArgs: 0,
                  maxArgs: 1
                }
              },
              sync: {
                clear: {
                  minArgs: 0,
                  maxArgs: 0
                },
                get: {
                  minArgs: 0,
                  maxArgs: 1
                },
                getBytesInUse: {
                  minArgs: 0,
                  maxArgs: 1
                },
                remove: {
                  minArgs: 1,
                  maxArgs: 1
                },
                set: {
                  minArgs: 1,
                  maxArgs: 1
                }
              }
            },
            tabs: {
              captureVisibleTab: {
                minArgs: 0,
                maxArgs: 2
              },
              create: {
                minArgs: 1,
                maxArgs: 1
              },
              detectLanguage: {
                minArgs: 0,
                maxArgs: 1
              },
              discard: {
                minArgs: 0,
                maxArgs: 1
              },
              duplicate: {
                minArgs: 1,
                maxArgs: 1
              },
              executeScript: {
                minArgs: 1,
                maxArgs: 2
              },
              get: {
                minArgs: 1,
                maxArgs: 1
              },
              getCurrent: {
                minArgs: 0,
                maxArgs: 0
              },
              getZoom: {
                minArgs: 0,
                maxArgs: 1
              },
              getZoomSettings: {
                minArgs: 0,
                maxArgs: 1
              },
              goBack: {
                minArgs: 0,
                maxArgs: 1
              },
              goForward: {
                minArgs: 0,
                maxArgs: 1
              },
              highlight: {
                minArgs: 1,
                maxArgs: 1
              },
              insertCSS: {
                minArgs: 1,
                maxArgs: 2
              },
              move: {
                minArgs: 2,
                maxArgs: 2
              },
              query: {
                minArgs: 1,
                maxArgs: 1
              },
              reload: {
                minArgs: 0,
                maxArgs: 2
              },
              remove: {
                minArgs: 1,
                maxArgs: 1
              },
              removeCSS: {
                minArgs: 1,
                maxArgs: 2
              },
              sendMessage: {
                minArgs: 2,
                maxArgs: 3
              },
              setZoom: {
                minArgs: 1,
                maxArgs: 2
              },
              setZoomSettings: {
                minArgs: 1,
                maxArgs: 2
              },
              update: {
                minArgs: 1,
                maxArgs: 2
              }
            },
            topSites: {
              get: {
                minArgs: 0,
                maxArgs: 0
              }
            },
            webNavigation: {
              getAllFrames: {
                minArgs: 1,
                maxArgs: 1
              },
              getFrame: {
                minArgs: 1,
                maxArgs: 1
              }
            },
            webRequest: {
              handlerBehaviorChanged: {
                minArgs: 0,
                maxArgs: 0
              }
            },
            windows: {
              create: {
                minArgs: 0,
                maxArgs: 1
              },
              get: {
                minArgs: 1,
                maxArgs: 2
              },
              getAll: {
                minArgs: 0,
                maxArgs: 1
              },
              getCurrent: {
                minArgs: 0,
                maxArgs: 1
              },
              getLastFocused: {
                minArgs: 0,
                maxArgs: 1
              },
              remove: {
                minArgs: 1,
                maxArgs: 1
              },
              update: {
                minArgs: 2,
                maxArgs: 2
              }
            }
          };
          if (Object.keys(n).length === 0)
            throw new Error("api-metadata.json has not been included in browser-polyfill");
          class h extends WeakMap {
            constructor(o, b = void 0) {
              super(b), this.createItem = o;
            }
            get(o) {
              return this.has(o) || this.set(o, this.createItem(o)), super.get(o);
            }
          }
          const w = (u) => u && typeof u == "object" && typeof u.then == "function", A = (u, o) => (...b) => {
            i.runtime.lastError ? u.reject(new Error(i.runtime.lastError.message)) : o.singleCallbackArg || b.length <= 1 && o.singleCallbackArg !== !1 ? u.resolve(b[0]) : u.resolve(b);
          }, k = (u) => u == 1 ? "argument" : "arguments", P = (u, o) => function(p, ...S) {
            if (S.length < o.minArgs)
              throw new Error(`Expected at least ${o.minArgs} ${k(o.minArgs)} for ${u}(), got ${S.length}`);
            if (S.length > o.maxArgs)
              throw new Error(`Expected at most ${o.maxArgs} ${k(o.maxArgs)} for ${u}(), got ${S.length}`);
            return new Promise((j, m) => {
              if (o.fallbackToNoCallback)
                try {
                  p[u](...S, A({
                    resolve: j,
                    reject: m
                  }, o));
                } catch (l) {
                  console.warn(`${u} API method doesn't seem to support the callback parameter, falling back to call it without a callback: `, l), p[u](...S), o.fallbackToNoCallback = !1, o.noCallback = !0, j();
                }
              else o.noCallback ? (p[u](...S), j()) : p[u](...S, A({
                resolve: j,
                reject: m
              }, o));
            });
          }, le = (u, o, b) => new Proxy(o, {
            apply(p, S, j) {
              return b.call(S, u, ...j);
            }
          });
          let K = Function.call.bind(Object.prototype.hasOwnProperty);
          const z = (u, o = {}, b = {}) => {
            let p = /* @__PURE__ */ Object.create(null), S = {
              has(m, l) {
                return l in u || l in p;
              },
              get(m, l, g) {
                if (l in p)
                  return p[l];
                if (!(l in u))
                  return;
                let d = u[l];
                if (typeof d == "function")
                  if (typeof o[l] == "function")
                    d = le(u, u[l], o[l]);
                  else if (K(b, l)) {
                    let W = P(l, b[l]);
                    d = le(u, u[l], W);
                  } else
                    d = d.bind(u);
                else if (typeof d == "object" && d !== null && (K(o, l) || K(b, l)))
                  d = z(d, o[l], b[l]);
                else if (K(b, "*"))
                  d = z(d, o[l], b["*"]);
                else
                  return Object.defineProperty(p, l, {
                    configurable: !0,
                    enumerable: !0,
                    get() {
                      return u[l];
                    },
                    set(W) {
                      u[l] = W;
                    }
                  }), d;
                return p[l] = d, d;
              },
              set(m, l, g, d) {
                return l in p ? p[l] = g : u[l] = g, !0;
              },
              defineProperty(m, l, g) {
                return Reflect.defineProperty(p, l, g);
              },
              deleteProperty(m, l) {
                return Reflect.deleteProperty(p, l);
              }
            }, j = Object.create(u);
            return new Proxy(j, S);
          }, $ = (u) => ({
            addListener(o, b, ...p) {
              o.addListener(u.get(b), ...p);
            },
            hasListener(o, b) {
              return o.hasListener(u.get(b));
            },
            removeListener(o, b) {
              o.removeListener(u.get(b));
            }
          }), ce = new h((u) => typeof u != "function" ? u : function(b) {
            const p = z(b, {}, {
              getContent: {
                minArgs: 0,
                maxArgs: 0
              }
            });
            u(p);
          }), ue = new h((u) => typeof u != "function" ? u : function(b, p, S) {
            let j = !1, m, l = new Promise((Z) => {
              m = function(L) {
                j = !0, Z(L);
              };
            }), g;
            try {
              g = u(b, p, m);
            } catch (Z) {
              g = Promise.reject(Z);
            }
            const d = g !== !0 && w(g);
            if (g !== !0 && !d && !j)
              return !1;
            const W = (Z) => {
              Z.then((L) => {
                S(L);
              }, (L) => {
                let ve;
                L && (L instanceof Error || typeof L.message == "string") ? ve = L.message : ve = "An unexpected error occurred", S({
                  __mozWebExtensionPolyfillReject__: !0,
                  message: ve
                });
              }).catch((L) => {
                console.error("Failed to send onMessage rejected reply", L);
              });
            };
            return W(d ? g : l), !0;
          }), de = ({
            reject: u,
            resolve: o
          }, b) => {
            i.runtime.lastError ? i.runtime.lastError.message === r ? o() : u(new Error(i.runtime.lastError.message)) : b && b.__mozWebExtensionPolyfillReject__ ? u(new Error(b.message)) : o(b);
          }, me = (u, o, b, ...p) => {
            if (p.length < o.minArgs)
              throw new Error(`Expected at least ${o.minArgs} ${k(o.minArgs)} for ${u}(), got ${p.length}`);
            if (p.length > o.maxArgs)
              throw new Error(`Expected at most ${o.maxArgs} ${k(o.maxArgs)} for ${u}(), got ${p.length}`);
            return new Promise((S, j) => {
              const m = de.bind(null, {
                resolve: S,
                reject: j
              });
              p.push(m), b.sendMessage(...p);
            });
          }, ge = {
            devtools: {
              network: {
                onRequestFinished: $(ce)
              }
            },
            runtime: {
              onMessage: $(ue),
              onMessageExternal: $(ue),
              sendMessage: me.bind(null, "sendMessage", {
                minArgs: 1,
                maxArgs: 3
              })
            },
            tabs: {
              sendMessage: me.bind(null, "sendMessage", {
                minArgs: 2,
                maxArgs: 3
              })
            }
          }, c = {
            clear: {
              minArgs: 1,
              maxArgs: 1
            },
            get: {
              minArgs: 1,
              maxArgs: 1
            },
            set: {
              minArgs: 1,
              maxArgs: 1
            }
          };
          return n.privacy = {
            network: {
              "*": c
            },
            services: {
              "*": c
            },
            websites: {
              "*": c
            }
          }, z(i, ge, n);
        };
        t.exports = a(chrome);
      }
    });
  })(fe)), fe.exports;
}
var Ts = Rs();
const T = /* @__PURE__ */ bt(Ts), pt = "*", Es = "[hidden]", Is = 30, wt = 50, xs = 30, Cs = 240;
function _(s, e = "log") {
  const t = console[e];
  if (typeof t != "function")
    throw new TypeError(`Unknown log type: ${e}`);
  t(s);
}
function Ps(s) {
  return s && typeof s == "number" && !isNaN(s) && isFinite(s) ? s : wt;
}
function Ls(s, e) {
  if (Os(s))
    return Is;
  if (s < xs)
    return -1;
  const t = Math.round(s * e / 100);
  return Math.min(t, Cs);
}
function Ze(s, e) {
  if (s && e) {
    const t = pt.repeat(s.length);
    return e.replace(s, t);
  }
  return e;
}
function yt(s) {
  return s ? typeof s == "string" ? pt.repeat(s.length) : Array.isArray(s) ? `[Array(${s.length})]` : Es : s === null ? "null" : s?.toString() ?? "undefined";
}
function Os(s) {
  return !s || typeof s != "number" || isNaN(s) || !isFinite(s);
}
function M(s, e) {
  return new Promise((t, r) => {
    const a = setTimeout(() => {
      r(new Error("promise timeout"));
    }, s);
    e.then(
      (i) => {
        clearTimeout(a), t(i);
      },
      (i) => {
        clearTimeout(a), r(i);
      }
    );
  });
}
function et(s, e) {
  return s.some((t) => t === e);
}
function Us(s, e) {
  return s.length > 0 && s.every((t) => t === e);
}
function _s() {
  return !!(!self.window || (location.href.startsWith("safari-web-extension") || location.href.startsWith("moz-extension")) && location.href.endsWith("generated_background_page.html"));
}
async function Ms(s) {
  const e = await fetch(s, {
    method: "GET"
  });
  return e.ok ? e.text() : null;
}
class St {
  events = /* @__PURE__ */ new Map();
  /**
   * Attach event listener
   *
   * @param event - event to listen to
   * @param fn - callback function
   */
  on(e, t) {
    const r = this.events.get(e) || [];
    this.events.set(e, [...r, t]);
  }
  /**
   * Disconnect event listener
   *
   * @param event - event to disconnect from
   * @param fn - callback function to disconnect
   */
  off(e, t) {
    const r = this.events.get(e) || [];
    this.events.set(
      e,
      r.filter((a) => a !== t)
    );
  }
  /**
   * Emit event
   *
   * @param event - event type to emit
   * @param args - arguments to pass to callback functions
   */
  emit(e, ...t) {
    for (const r of this.events.get(e) || [])
      r(...t);
  }
}
var f = /* @__PURE__ */ ((s) => (s.RESULT_OK = "ok", s.RESULT_IGNORE = "ignored", s.ERROR_AUTH = "error-auth", s.ERROR_OTHER = "error-other", s))(f || {});
class Ds {
  queue = [];
  isActive = !1;
  shouldPrint = (T.storage.sync || T.storage.local).get("Options").then((e) => e.Options?.debugLoggingEnabled);
  /**
   * Enqueue a log message to be printed.
   * @param text - Debug message
   * @param logType - Log type
   */
  push(e, t) {
    this.queue.push({ text: e, logType: t }), this.start();
  }
  /**
   * Process the queue to print logs in order.
   */
  async start() {
    if (!this.isActive) {
      this.isActive = !0;
      try {
        for (let e = 0; e < 100 && this.queue.length > 0; e++) {
          const t = this.queue.shift();
          if (t && await this.shouldPrint) {
            const r = console[t.logType];
            if (typeof r != "function")
              throw new TypeError(
                `Unknown log type: ${t.logType}`
              );
            const a = `Web Scrobbler: ${t.text?.toString()}`;
            r(a);
          }
        }
        this.isActive = !1;
      } catch {
        this.isActive = !1;
      }
    }
  }
}
const Fs = new Ds();
function y(s, e = "log") {
  Fs.push(s, e);
}
var Ce = /* @__PURE__ */ ((s) => (s.SUCCESSFUL = "success", s.IGNORED = "ignored", s.ERROR = "error", s.DISALLOWED = "disallowed", s.INVALID = "invalid", s))(Ce || {});
function Ns(s, e) {
  for (const t of s)
    if (t[e] === f.RESULT_IGNORE)
      return "ignored";
  for (const t of s)
    if (t[e] !== f.RESULT_OK)
      return "error";
  return "success";
}
const tt = 3e3;
class jt {
  // V extends DataModels[K], T extends Record<K, V>
  storage;
  namespace;
  requests = [];
  autoIncrement = 0;
  emitter = new St();
  /**
   * interval to ensure the locking doesnt get stuck permanently
   */
  interval = setInterval(() => {
    this.unlock();
  }, tt);
  /**
   * @param storage - StorageArea object
   * @param namespace - Storage namespace
   */
  constructor(e, t) {
    this.storage = e, this.namespace = t;
  }
  unlock() {
    this.requests = this.requests.slice(1), this.emitter.emit("updateLock", this.requests[0]), clearInterval(this.interval), this.interval = setInterval(() => {
      this.unlock();
    }, tt);
  }
  /**
   * Read data from storage, don't respect locking
   * @returns Storage data
   */
  async get() {
    try {
      const e = await this.storage.get(this.namespace);
      if (this.namespace in e)
        return e[this.namespace];
    } catch (e) {
      y(`StorageWrapper#get(${this.namespace}); ${e}`);
    }
    return null;
  }
  /**
   * Read data from storage, respect locking
   * @returns Storage data
   */
  async getLocking() {
    return await new Promise((t) => {
      const r = this.autoIncrement++;
      if (this.requests.push(r), this.requests[0] === r) {
        t(!0);
        return;
      }
      const a = (i) => {
        i === r && (t(!0), this.emitter.off("updateLock", a));
      };
      this.emitter.on("updateLock", a);
    }), this.get();
  }
  /**
   * Save data to storage, don't lock storage
   * @param data - Data to save
   */
  async set(e) {
    const t = {
      [this.namespace]: e
    };
    try {
      await this.storage.set(t);
    } catch (r) {
      y(`StorageWrapper#set(${this.namespace}); ${r}`);
    }
  }
  /**
   * Save data to storage, and lock storage
   * @param data - Data to save
   */
  async setLocking(e) {
    try {
      await this.set(e);
    } catch (t) {
      y(t, "warn");
    }
    this.unlock();
  }
  /**
   * Extend saved data by given one.
   * @param data - Data to add
   */
  async update(e) {
    const t = await this.getLocking(), r = Object.assign(t ?? {}, e);
    await this.setLocking(r);
  }
  /**
   * Log storage data to console output.
   * @param hiddenKeys - Array of keys should be hidden
   */
  /* istanbul ignore next */
  async debugLog(e = []) {
    const t = await this.get(), a = JSON.stringify(t, (i, n) => e.includes(i) ? yt(n) : n, 2);
    location?.protocol === "chrome-extension:" && y(`storage.${this.namespace} = ${a}`, "info");
  }
  /**
   * Clear storage.
   */
  async clear() {
    try {
      await this.storage.remove(this.namespace);
    } catch (e) {
      y(`StorageWrapper#remove(${this.namespace}); ${e}`);
    }
  }
}
const R = 0, J = 1, Fe = "Connectors", At = "ConnectorsOverrideOptions", kt = "customPatterns", Bs = "Notifications", vt = "BlockedTags", be = "LocalCache", zs = "NativeScrobblerNotification", Rt = "Blocklists", Ne = "Options", $s = "StateManagement", Be = "DisabledTabs", Pe = "RegexEdits", Le = "ScrobbleCache", qs = "Core", Hs = {
  [Fe]: J,
  [At]: J,
  [kt]: J,
  [Bs]: J,
  // make sure to update '@/core/util/debug' if you change this
  [Ne]: J,
  LastFM: R,
  LibreFM: R,
  ListenBrainz: R,
  Maloja: R,
  Webhook: R,
  Pleroma: R,
  [zs]: R,
  [Rt]: R,
  [be]: R,
  [Pe]: R,
  [Le]: R,
  [vt]: R,
  [qs]: R,
  [$s]: R,
  [Be]: R
};
function I(s) {
  switch (Hs[s]) {
    case J:
      return Gs(s);
    case R:
      return oe(s);
    default:
      throw new Error(`Unknown storage namespace: ${s}`);
  }
}
function Vs(s) {
  return oe(s);
}
function oe(s) {
  const e = T.storage.local;
  return new jt(e, s);
}
function Gs(s) {
  const e = T.storage.sync || T.storage.local;
  return new jt(e, s);
}
const Ks = I(kt);
function Ws() {
  return Ks.get();
}
async function Js(s) {
  const e = await Ws() || {};
  for (const t of ht) {
    const r = t.matches || [];
    e[t.id] && r.push(...e[t.id]);
    for (const a of r)
      if (ks(s, a))
        return t;
  }
  return null;
}
function Ys(s) {
  if (!Array.isArray(s))
    throw new TypeError(`Invalid 'fields' argument: expected 'string[]', got '${typeof s}'`);
  if (s.length === 0)
    throw new Error("Invalid 'fields' argument: received an empty array");
  for (const e of s) {
    if (typeof e != "string")
      throw new TypeError(`Invalid field: expected 'string', got '${typeof e}'`);
    if (!e)
      throw new TypeError("Invalid field: expected 'string', got an empty string");
  }
}
function Qs(s) {
  if (!s)
    throw new TypeError("No filter set is specified!");
  if (typeof s != "object")
    throw new TypeError(`Invalid filter set: expected 'object', got '${typeof s}'`);
  for (const e in s)
    Tt(s[e]);
}
function Tt(s) {
  Array.isArray(s) ? Xs(s) : Et(s);
}
function Xs(s) {
  s.forEach(Et);
}
function Et(s) {
  if (typeof s != "function")
    throw new TypeError(`Invalid filter function: expected 'function', got '${typeof s}'`);
}
function It(s) {
  return new F(s);
}
function xt(s, e) {
  return Ys(s), Tt(e), s.reduce((t, r) => (t[r] = e, t), {});
}
class F {
  /**
   * @constructor
   *
   * @param filterSet Set of filters
   *
   * @throws Throw an error if no filter set is specified
   */
  constructor(e) {
    this.mergedFilterSet = {}, this.appendFilters(e);
  }
  /**
   * Filter the field value using filters for the given field.
   *
   * @param field Metadata field
   * @param fieldValue Field value to be filtered
   *
   * @return Filtered string
   *
   * @throws Throw an error if an invalid field is specified
   */
  filterField(e, t) {
    if (e in this.mergedFilterSet)
      return this.filterText(t, this.mergedFilterSet[e]);
    throw new TypeError(`Invalid filter field: ${e}`);
  }
  /**
   * Append a new filter set.
   *
   * @param filterSet Set of filters
   *
   * @return Current instance
   */
  append(e) {
    return this.appendFilters(e), this;
  }
  /**
   * Extend the filter by a filter set from a given filter.
   *
   * @param filter Filter object
   *
   * @return Current instance
   */
  extend(e) {
    if (!e)
      throw new TypeError("No filter is specified!");
    if (!(e instanceof F))
      throw new TypeError(`Invalid filter: expected 'MetadataFilter', got '${typeof e}'`);
    return this.appendFilters(e.mergedFilterSet), this;
  }
  /**
   * Check if the filter contains filter functions for a given field.
   *
   * @param field Field to check
   *
   * @return Check result
   */
  canFilterField(e) {
    return e in this.mergedFilterSet;
  }
  /**
   * Return a list of fields that the filter can filter.
   *
   * @return List of fields
   */
  getFields() {
    return Object.keys(this.mergedFilterSet);
  }
  /**
   * Filter text using given filters.
   *
   * @param text String to be filtered
   * @param filters Array of filter functions
   *
   * @return Filtered string
   */
  filterText(e, t) {
    return e && t.reduce((r, a) => a(r), e);
  }
  /**
   * Wrap given filters into array of filters, if needed.
   *
   * @param filters Array of filter functions or filter function
   *
   * @return Array of filter functions
   */
  wrapFiltersIntoArray(e) {
    return Array.isArray(e) ? e : [e];
  }
  /**
   * Add given filters to current ones.
   *
   * @param filterSet Set of filters
   *
   * @throws Throw an error if a filter function is not a function
   */
  appendFilters(e) {
    Qs(e);
    for (const t in e) {
      t in this.mergedFilterSet || (this.mergedFilterSet[t] = []);
      const r = this.wrapFiltersIntoArray(e[t]);
      this.mergedFilterSet[t].push(...r);
    }
  }
}
const Zs = [
  // (Explicit) or [Explicit]
  { source: /\s[([]Explicit[)\]]/i, target: "" },
  // (Clean) or [Clean]
  { source: /\s[([]Clean[)\]]/i, target: "" }
], er = [
  // [Feat. Artist] or (Feat. Artist)
  { source: /\s[([]feat. .+[)\]]/i, target: "" },
  { source: /\s(feat. .+)/i, target: "" }
], tr = [
  // Track - Live
  // Track - Live at
  { source: /\s-\sLive(\s.+)?$/, target: "" },
  // Track (Live)
  { source: /\s[([]Live[)\]]$/, target: "" }
], sr = [
  // [Feat. Artist] or (Feat. Artist) -> Feat. Artist
  { source: /\s[([](feat. .+)[)\]]/i, target: " $1" }
], rr = [
  // Party In the CIA (Parody of "Party In The U.S.A." by Miley Cyrus)
  { source: /\s\(Parody of ".*" by .*\)$/, target: "" },
  // White & Nerdy (Parody of "Ridin'" by Chamillionaire feat. Krayzie Bone)
  { source: /\s\(Parody of ".*" by .* feat\. .*\)$/, target: "" },
  // The Saga Begins (Lyrical Adaption of "American Pie")
  { source: /\s\(Lyrical Adaption of ".*"\)$/, target: "" }
], ar = [
  // Album Title Re-issue
  { source: /\sRe-?issue$/i, target: "" },
  // Album Title [Whatever Re-issue Whatever]
  { source: /\s\[.*?Re-?issue.*?\]/i, target: "" },
  // Album Title (Whatever Re-issue Whatever)
  { source: /\s\(.*?Re-?issue.*?\)/i, target: "" }
], ir = [
  // Ticket To Ride - Live / Remastered
  { source: /Live\s\/\sRemastered/, target: "Live" },
  // Mothership (Remastered)
  // Let It Be (Remastered 2009)
  // How The West Was Won [Remastered]
  // Ride the Lightning (Deluxe Remaster)
  // ...And Justice For All (Remastered Deluxe Box Set)
  { source: /\s[([].*Re-?[Mm]aster(ed)?.*[)\]]$/, target: "" },
  // Outside The Wall - 2011 - Remaster
  // China Grove - 2006 Remaster
  // Easy Living - 2003 Remastered
  // Learning To Fly - 2001 Digital Remaster
  // Red Right Hand - 2011 Remastered Version
  { source: /\s-\s\d{4}(\s-)?\s.*Re-?[Mm]aster(ed)?.*$/, target: "" },
  // Here Comes The Sun - Remastered
  // 1979 - Remastered 2012
  // 1979 - Remastered Version
  { source: /\s-\sRe-?[Mm]aster(ed)?.*$/, target: "" },
  // Wish You Were Here [Remastered] (Remastered Version)
  { source: /\s\[Remastered\]\s\(Remastered\sVersion\)$/, target: "" }
], or = [
  // "- X Remix" -> "(X Remix)" and similar
  {
    source: /-\s(.+?)\s((Re)?mix|edit|dub|mix|vip|version)$/i,
    target: "($1 $2)"
  },
  { source: /-\s(Remix|VIP|Instrumental)$/i, target: "($1)" }
], nr = [
  // Leftovers after e.g. (official video)
  { source: /\(+\s*\)+/, target: "" },
  // trim starting white chars and dash
  { source: /^[/,:;~\s"-]+/, target: "" },
  // trim trailing white chars and dash
  { source: /[/,:;~\s"-]+$/, target: "" },
  // remove multiple spaces
  { source: /\u0020{1,}/, target: " " }
], lr = [
  { source: /(Various Artists).+/, target: "$1" }
], cr = [
  // Love Will Come To You (Album Version)
  { source: /\s[([]Album Version[)\]]$/, target: "" },
  // I Melt With You (Rerecorded)
  // When I Need You [Re-Recorded]
  { source: /\s[([]Re-?recorded[)\]]$/, target: "" },
  // Your Cheatin' Heart (Single Version)
  { source: /\s[([]Single Version[)\]]$/, target: "" },
  // All Over Now (Edit)
  { source: /\s[([]Edit[)\]]$/, target: "" },
  // (I Can't Get No) Satisfaction - Mono Version
  { source: /\s-\sMono Version$/, target: "" },
  // Ruby Tuesday - Stereo Version
  { source: /\s-\sStereo Version$/, target: "" },
  // Pure McCartney (Deluxe Edition)
  { source: /\s\(Deluxe Edition\)$/, target: "" },
  // Ace of Spades (Expanded Edition)
  // Overkill (Expanded Bonus Track Edition)
  // On Parole (Expanded and Remastered)
  { source: /\s[([]Expanded.*[)\]]$/, target: "" },
  // Sound of White Noise - Expanded Edition
  { source: /\s-\sExpanded Edition$/, target: "" },
  // 6 Foot 7 Foot (Explicit Version)
  { source: /\s[([]Explicit Version[)\]]/i, target: "" },
  // No Remorse (Bonus Track Edition)
  { source: /\s[([]Bonus Track Edition[)\]]/i, target: "" },
  // Peace Sells...But Who's Buying (25th Anniversary)
  // Persistence of Time (30th Anniversary Remaster)
  { source: /\s[([]\d+th\sAnniversary.*[)\]]/i, target: "" },
  // 6 Foot 7 Foot - Original
  { source: /\s-\sOriginal$/i, target: "" },
  // California Love - Original Version
  // Personal Jesus - Original Single Version
  // Prince of the Moment - Original 7" Version
  // YMCA - Original Version 1978
  { source: /\s-\sOriginal.*Version(\s\d{4})?$/i, target: "" }
], ur = [
  // Trim whitespaces
  { source: /^\s+|\s+$/g, target: "" },
  // **NEW**
  { source: /\*+\s?\S+\s?\*+$/, target: "" },
  // [Whatever]
  { source: /\[[^\]]+\]/, target: "" },
  // 【Whatever】
  { source: /【[^\]]+】/, target: "" },
  // （Whatever）
  { source: /（[^\]]+）/, target: "" },
  // (Whatever Version)
  { source: /\([^)]*version\)$/i, target: "" },
  // Video extensions
  { source: /\.(avi|wmv|mpg|mpeg|flv)$/i, target: "" },
  // (Lyrics Video)
  { source: /\(.*lyrics?\s*(video)?\)/i, target: "" },
  // ((Official)? (Track)? Stream)
  { source: /\((of+icial\s*)?(track\s*)?stream\)/i, target: "" },
  // ((Official)? (Music)? Video|Audio)
  { source: /\((of+icial\s*)?(music\s*)?(video|audio)\)/i, target: "" },
  // - (Official)? (Music)? Video|Audio
  { source: /-\s(of+icial\s*)?(music\s*)?(video|audio)$/i, target: "" },
  // ((Whatever)? Album Track)
  { source: /\(.*Album\sTrack\)/i, target: "" },
  // (Official)
  { source: /\(\s*of+icial\s*\)/i, target: "" },
  // (1999)
  { source: /\(\s*[0-9]{4}\s*\)/i, target: "" },
  // (HD) / (HQ)
  { source: /\(\s*(HD|HQ)\s*\)$/, target: "" },
  // HD / HQ
  { source: /(HD|HQ)\s?$/, target: "" },
  // Video Clip Officiel / Video Clip Official
  { source: /(vid[\u00E9e]o)?\s?clip\sof+ici[ae]l/i, target: "" },
  // Offizielles
  { source: /of+iziel+es\s*video/i, target: "" },
  // Video Clip
  { source: /vid[\u00E9e]o\s?clip/i, target: "" },
  // Clip
  { source: /\sclip/i, target: "" },
  // Full Album
  { source: /full\s*album/i, target: "" },
  // (Live)
  { source: /\(live.*?\)$/i, target: "" },
  // | Something
  { source: /\|.*$/i, target: "" },
  // Artist - The new "Track title" featuring someone
  { source: /^(|.*\s)"(.{5,})"(\s.*|)$/, target: "$2" },
  // 'Track title'
  { source: /^(|.*\s)'(.{5,})'(\s.*|)$/, target: "$2" },
  // (*01/01/1999*)
  { source: /\(.*[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{2,4}.*\)/i, target: "" },
  // Sub Español
  { source: /sub\s*español/i, target: "" },
  // (Letra)
  { source: /\s\(Letra\)/i, target: "" },
  // (En vivo)
  { source: /\s\(En\svivo\)/i, target: "" },
  // Sub Español
  { source: /sub\s*español/i, target: "" }
], dr = [
  { source: /\s(& .+)/i, target: "" },
  { source: /\s(x .+)/i, target: "" }
], st = {
  "&": /&amp;/g,
  "<": /&lt;/g,
  ">": /&gt;/g,
  '"': /&quot;/g
};
function Ct(s) {
  return s.includes(" feat. ") ? s.split(" feat. ")[0] : s;
}
function Pt(s) {
  let e = s;
  for (const t in st) {
    const r = st[t];
    e = e.replace(r, t);
  }
  return e = e.replace(/&#x([a-fA-f0-9]+);/g, (t, r) => {
    const a = parseInt(r, 16);
    return String.fromCharCode(a);
  }), e = e.replace(/&#(\d+);/g, (t, r) => String.fromCharCode(r)), e;
}
function C(s, e) {
  return e.reduce((t, r) => {
    const { source: a, target: i } = r;
    return t.replace(a, i);
  }, s);
}
function H(s) {
  return C(s, or);
}
function mr(s) {
  return C(s, lr);
}
function Oe(s) {
  return C(s, sr);
}
function Ue(s) {
  return C(s, Zs);
}
function Lt(s) {
  return C(s, er);
}
function gr(s) {
  return C(s, dr);
}
function V(s) {
  return C(s, tr);
}
function Ot(s) {
  return C(s, rr);
}
function Ut(s) {
  return C(s, ar);
}
function D(s) {
  return C(s, ir);
}
function Q(s) {
  return C(s, cr);
}
function hr(s) {
  return s.replace(/[\u200B-\u200D\uFEFF]/g, "");
}
function _t(s) {
  return s.replace(/\u00a0/g, " ");
}
function Mt(s) {
  return C(s, [
    ...ur,
    ...nr
  ]);
}
function fr(s) {
  return s.replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"');
}
function br() {
  return new F({ track: Mt });
}
function pr() {
  return new F({
    track: D,
    album: D
  });
}
function wr() {
  return new F({
    track: [D, Ot, H, V],
    album: [
      D,
      H,
      V,
      Ut,
      Q
    ]
  });
}
function yr() {
  return new F({
    artist: [Oe],
    track: [
      Ue,
      Lt,
      D,
      H,
      Q,
      V
    ],
    album: [
      Pt,
      Ue,
      D,
      H,
      Q,
      V
    ],
    albumArtist: [Oe, Ct]
  });
}
function Sr() {
  return new F({
    track: [D, H, Q, V],
    album: [D, H, Q, V]
  });
}
const jr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  MetadataFilter: F,
  albumArtistFromArtist: Ct,
  createAmazonFilter: yr,
  createFilter: It,
  createFilterSetForFields: xt,
  createRemasteredFilter: pr,
  createSpotifyFilter: wr,
  createTidalFilter: Sr,
  createYouTubeFilter: br,
  decodeHtmlEntities: Pt,
  filterWithFilterRules: C,
  fixTrackSuffix: H,
  fixVariousArtists: mr,
  normalizeFeature: Oe,
  removeAdditionalArtists: gr,
  removeCleanExplicit: Ue,
  removeFeature: Lt,
  removeLive: V,
  removeParody: Ot,
  removeReissue: Ut,
  removeRemastered: D,
  removeVersion: Q,
  removeZeroWidth: hr,
  replaceNbsp: _t,
  replaceSmartQuotes: fr,
  youtube: Mt
}, Symbol.toStringTag, { value: "Module" }));
function Dt(s) {
  const e = Object.entries(s).reduce(
    (t, [r, a]) => (typeof a == "string" ? t[r] = a : typeof a == "number" ? t[r] = a.toString() : (typeof a > "u" || a === null) && (t[r] = ""), t),
    {}
  );
  return new URLSearchParams(e).toString();
}
function Ar() {
  return T.runtime.getManifest().version;
}
function ee(s, e) {
  return T.i18n.getMessage(s, e);
}
const he = "Base", Y = "Disallowed", rt = "Disabled", _e = "Error", kr = "Ignored", at = "Loading", Re = "Playing", vr = "Paused", Te = "Scrobbled", Rr = "Skipped", Ft = "Unknown", Tr = "Loved", Er = "Unloved";
function x(s) {
  return (e) => e(s);
}
function Ir(...s) {
  T.runtime.onMessage.addListener(
    (e, t) => {
      let r = !1;
      for (const a of s) {
        const i = a((n) => {
          if (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            e.type === n.type
          )
            return r = !0, n.fn(
              // eslint-disable-next-line
              e.payload,
              t
            );
        });
        if (r)
          return Promise.resolve(i);
      }
    }
  );
}
async function xr(s, e) {
  return T.tabs.sendMessage(s, e);
}
function Cr(s) {
  return (e) => e(s);
}
function Pr(...s) {
  T.runtime.onMessage.addListener(
    (e, t) => {
      let r = !1;
      for (const a of s) {
        const i = a((n) => {
          if (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            e.type === n.type
          )
            return r = !0, n.fn(
              // eslint-disable-next-line
              e.payload,
              t
            );
        });
        if (r)
          return Promise.resolve(i);
      }
    }
  );
}
async function v(s) {
  return T.runtime.sendMessage(s);
}
const Ae = ", ", Nt = [
  " -- ",
  "--",
  " ~ ",
  " - ",
  " – ",
  " — ",
  " // ",
  " -",
  " –",
  " —",
  "- ",
  "– ",
  "— ",
  ":",
  "|",
  "///",
  "/",
  "~"
];
function ze(s) {
  if (!s || !/^\s*-?((\d{1,2}:\d\d:\d\d)|(\d{1,2}:\d\d)|(\d{1,2}))\s*$/g.test(s))
    return 0;
  const t = /-/g, r = /\d{1,2}/g, a = s.match(r)?.reverse().map((i) => parseInt(i, 10)).reduce((i, n, h) => i + n * Math.pow(60, h));
  return a && t.test(s) ? -a : a ?? 0;
}
function Bt(s, e = null) {
  if (s === null || s.length === 0)
    return null;
  for (const t of e || Nt) {
    const r = s.indexOf(t);
    if (r > -1)
      return { index: r, length: t.length };
  }
  return null;
}
function Lr(s) {
  return !s || s.length === 0 ? null : s.map((e) => e.textContent).join(Ae);
}
function Or(s) {
  return s.join(Ae);
}
function $e(s, e = null, t = !1) {
  if (!s)
    return { artist: null, track: null };
  const [r, a] = ke(s, e, t);
  return { artist: r, track: a };
}
const zt = /^[A-Z][1-9]\.? /;
function Ur(s) {
  return s !== null ? s.replace(zt, "") : null;
}
function _r(s, e = null, t = !1) {
  const [r, a] = ke(s, e, t);
  return { artist: r, album: a };
}
function $t(s, e = "/", t = !1) {
  if (s === null)
    return {
      currentTime: void 0,
      duration: void 0
    };
  const [r, a] = ke(s, [e], t).map(
    (i) => ze(i)
  );
  return { currentTime: r, duration: a };
}
function ke(s, e, t = !1) {
  let r = null, a = null;
  if (s) {
    const i = Bt(s, e);
    i !== null && (r = s.substr(0, i.index), a = s.substr(i.index + i.length), t && ([a, r] = [r, a]));
  }
  return [r, a];
}
function qt(s) {
  return typeof s != "number" || isNaN(s) || !isFinite(s) ? null : Math.round(s);
}
function Ht(s) {
  if (!s)
    return null;
  const e = /url\((["']?)(.*)\1\)/.exec(s);
  return e ? e[2].trim() : null;
}
function Vt(s, e) {
  let t = 0, r = setTimeout(() => {
  }, 0);
  return () => {
    const a = Date.now(), i = e - (a - t);
    if (i <= 0)
      return t = a, s();
    clearTimeout(r), r = setTimeout(() => {
      t = Date.now(), s();
    }, i);
  };
}
function pe(s) {
  return !(s && s.artist && s.track);
}
function re(s, e, t) {
  if (!e || !Array.isArray(t))
    return s;
  for (const r of t)
    !s[r] && e[r] && (s[r] = e[r]);
  return s;
}
function Gt(s) {
  if (!(s && s.metadata))
    return null;
  const { artist: e, album: t, title: r, artwork: a } = s.metadata, i = r;
  let n = null;
  if (a?.length > 0) {
    const { src: h } = a[a.length - 1];
    n = h;
  }
  return { artist: e, track: i, album: t, trackArt: n };
}
function O(s, e = null) {
  if (s === null)
    return e;
  const t = N(s);
  if (!t)
    return e;
  for (const r of t) {
    const a = r.innerText;
    if (a)
      return a;
  }
  return e;
}
function Kt(s, e, t = null) {
  if (s === null)
    return t;
  const r = N(s);
  if (r) {
    if (r.length === 1)
      return r[0].getAttribute(e);
    for (const a of r) {
      const i = a.getAttribute(e);
      if (i)
        return i;
    }
  }
  return t;
}
function Mr(s, e, t) {
  const r = N(s);
  if (r)
    for (const a of r)
      if (typeof e == "string")
        a.addEventListener(e, t);
      else
        for (const i of e)
          a.addEventListener(i, t);
}
function we(s) {
  return ze(O(s) ?? "");
}
function Wt(s) {
  if (s === null)
    return null;
  const e = N(s);
  if (!e || !e.length)
    return null;
  let t = e[0].getAttribute("src");
  if (!t) {
    const r = ["background-image", "background"], a = window.getComputedStyle(e[0]);
    for (const i of r) {
      const n = a.getPropertyValue(i);
      n && (t = Ht(n));
    }
  }
  return Yt(t);
}
function Dr(s, e) {
  const t = N(s);
  if (!t)
    return null;
  for (const r of t) {
    const a = Jt(r, e);
    if (a)
      return a;
  }
  return null;
}
function Jt(s, e) {
  return window.getComputedStyle(s).getPropertyValue(e);
}
function Fr(s, e) {
  if (s === null)
    return !1;
  const t = N(s);
  if (!t)
    return !1;
  for (const r of t)
    if (r.classList.contains(e))
      return !0;
  return !1;
}
function Nr(s) {
  for (const e of s)
    if (e.offsetWidth || e.offsetHeight || e.getClientRects().length)
      return !0;
  return !1;
}
function ae(s) {
  if (!s)
    return !1;
  const e = N(s);
  return (e && Nr(e)) ?? !1;
}
function Br(s) {
  const e = N(s);
  return !e || !("value" in e) ? null : e.value;
}
function zr(s, e) {
  return Kt(s, `data-${e}`);
}
function N(s) {
  if (!s)
    return null;
  if (typeof s == "string")
    return document.querySelectorAll(s);
  if (!Array.isArray(s))
    throw new TypeError(`Unknown type of selector: ${typeof s}`);
  for (const e of s) {
    const t = document.querySelectorAll(
      e
    );
    if (t.length > 0)
      return t;
  }
  return null;
}
async function $r(s, e) {
  const t = await I(
    Fe
  ).get();
  return t && s in t && e in t[s] ? t[s][e] : (y(`Option ${e} for connector ${s} not found`, "warn"), !1);
}
function Yt(s) {
  return s ? s.startsWith("//") ? location.protocol + s : s.match(/^\/(?!\/)/g) ? location.origin + s : s : null;
}
function Qt(s) {
  const e = document.createElement("script");
  e.src = s, e.onload = function() {
    const t = this;
    t.parentNode?.removeChild(t);
  }, (document.head || document.documentElement).appendChild(e);
}
const Xt = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?.*v=))([^#&?]*).*/, qe = "Provided to YouTube", Zt = "Auto-generated by YouTube.", es = " · ", ts = [
  // Artist "Track", Artist: "Track", Artist - "Track", etc.
  {
    pattern: /(.+?)([\s:—-])+\s*"(.+?)"/,
    groups: { artist: 1, track: 3 }
  },
  // Artist「Track」 (Japanese tracks)
  {
    pattern: /(.+?)[『｢「](.+?)[」｣』]/,
    groups: { artist: 1, track: 2 }
  },
  // Track (... by Artist)
  {
    pattern: /(\w[\s\w]*?)\s+\([^)]*\s*by\s*([^)]+)+\)/,
    groups: { artist: 2, track: 1 }
  }
];
function qr(s) {
  let e = null, t = null;
  if (!s)
    return { artist: e, track: t };
  let r = s.replace(/^((\[[^\]]+\])|(【[^】]+】))\s*-*\s*/i, "");
  r = r.replace(/^\s*([a-zA-Z]{1,2}|[0-9]{1,2})[1-9]?\.\s+/i, ""), r = r.replace(/-\s*([「【『])/, "$1"), r = r.replace(
    /[(［【][^(［【]*?((Music Video)|(MV)|(PV)).*?[】］)]/i,
    ""
  ), r = r.replace(/[(［【]((オリジナル)|(東方)).*?[】］)]+?/, ""), r = r.replace(/((?:Music Video)|MV|PV)([「［【『』】］」])/i, "$2"), r = r.replace(/\s+(MV|PV)$/i, "");
  for (const a of ts) {
    const i = a.pattern.exec(r);
    if (i) {
      e = i[a.groups.artist], t = i[a.groups.track];
      break;
    }
  }
  if (pe({ artist: e, track: t }) && ({ artist: e, track: t } = $e(r)), pe({ artist: e, track: t })) {
    const a = /(.+?)【(.+?)】/.exec(r);
    a && (e = a[1], t = a[2]);
  }
  return pe({ artist: e, track: t }) && (t = r), { artist: e, track: t };
}
function ss(s) {
  return !!(s && (s.startsWith(qe) || s.endsWith(Zt)));
}
function Hr(s) {
  if (!ss(s))
    return null;
  const e = s.split(`
`).filter((k) => k.length > 0).filter((k) => !k.startsWith(qe)), t = e[0], r = e[1], a = t.split(es), i = a.length, n = r;
  let h = null, w = null, A = null;
  if (i < 2)
    [w] = a;
  else if (i === 2)
    [w, h] = a;
  else if ([w, h, ...A] = a, !A.some(
    (P) => w?.includes(P)
  )) {
    const P = A.join(Ae);
    w = `${w} (feat. ${P})`;
  }
  return { artist: h, track: w, album: n };
}
function Vr(s) {
  if (!s)
    return null;
  const e = Xt.exec(s);
  return e ? e[7] : null;
}
const rs = /(.+)\s[:\u2013-\u2015-]\s(.+)/;
function Gr(s) {
  if (!s)
    return { artist: null, track: null };
  const e = rs.exec(s);
  return e && !/.*#\d+.*/.test(e[1]) ? {
    artist: e[1],
    track: e[2]
  } : { artist: null, track: s };
}
function Kr(s) {
  const e = document.querySelector(s);
  return e === null ? (y("Failed to resolve originUrl"), document.location.href) : e.getAttribute("href")?.split("?")?.[0] ?? document.location.href;
}
function Wr(s, e) {
  if (!s)
    return ee("pageActionLoading");
  const t = `${e?.getArtist()} - ${e?.getTrack()}`;
  switch (s) {
    case Y:
      return ee("infoBoxStateDisallowed", t);
    case _e:
      return ee("infoBoxStateError");
    case Ft:
      return ee("infoBoxStateUnknown");
    default:
      return ee(`pageAction${s}`, t);
  }
}
async function Jr(s, e, t) {
  const r = await v({
    type: "fetch",
    payload: {
      url: s,
      init: t
    }
  });
  if (!r.ok)
    return {
      ok: !1,
      content: null
    };
  switch (e) {
    case "text":
      return {
        ok: !0,
        content: r.content
      };
    case "json":
      return {
        ok: !0,
        content: JSON.parse(r.content)
      };
    case "html":
      return {
        ok: !0,
        content: new DOMParser().parseFromString(
          r.content,
          "text/html"
        )
      };
  }
}
const Yr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ARTIST_SEPARATOR: Ae,
  RECORD_SIDE_REGEX: zt,
  bindListeners: Mr,
  debugLog: y,
  defaultSeparators: Nt,
  escapeBadTimeValues: qt,
  extractImageUrlFromSelectors: Wt,
  extractUrlFromCssProperty: Ht,
  fetchFromServiceWorker: Jr,
  fillEmptyFields: re,
  findSeparator: Bt,
  getAttrFromSelectors: Kt,
  getCSSProperty: Jt,
  getCSSPropertyFromSelectors: Dr,
  getDataFromSelectors: zr,
  getInfoBoxText: Wr,
  getMediaSessionInfo: Gt,
  getOption: $r,
  getOriginUrl: Kr,
  getSecondsFromSelectors: we,
  getTextFromSelectors: O,
  getValueFromSelectors: Br,
  getYtVideoIdFromUrl: Vr,
  hasElementClass: Fr,
  injectScriptIntoDocument: Qt,
  isArtistTrackEmpty: pe,
  isElementVisible: ae,
  isYtVideoDescriptionValid: ss,
  joinArtistStrings: Or,
  joinArtists: Lr,
  normalizeUrl: Yt,
  parseYtVideoDescription: Hr,
  processSoundCloudTrack: Gr,
  processYtVideoTitle: qr,
  queryElements: N,
  removeRecordSide: Ur,
  scArtistTrackRe: rs,
  splitArtistAlbum: _r,
  splitArtistTrack: $e,
  splitString: ke,
  splitTimeInfo: $t,
  stringToSeconds: ze,
  throttle: Vt,
  ytDescFirstLine: qe,
  ytDescLastLine: Zt,
  ytDescSeparator: es,
  ytTitleRegExps: ts,
  ytVideoIdRegExp: Xt
}, Symbol.toStringTag, { value: "Module" }));
class as {
  /**
   * Meta of connector
   */
  meta;
  /**
   * Selector of an element containing artist name.
   *
   * Only applies when default implementation of
   * `BaseConnector.getArtist` is used.
   */
  artistSelector = null;
  /**
   * Selector of an element containing track name.
   *
   * Only applies when default implementation of
   * `BaseConnector.getTrack` is used.
   */
  trackSelector = null;
  /**
   * Selector of an element containing album name.
   *
   * Only applies when default implementation of
   * `BaseConnector.getAlbum` is used.
   */
  albumSelector = null;
  /**
   * Selector of an element containing the album artist.
   *
   * Only applies when default implementation of
   * `BaseConnector.getAlbumArtist` is used.
   */
  albumArtistSelector = null;
  /**
   * Selector of an element containing track current time in h:m:s format.
   *
   * Only applies when default implementation of
   * `BaseConnector.getCurrentTime` is used.
   */
  currentTimeSelector = null;
  /**
   * Selector of an element containing track remaining time in h:m:s format.
   *
   * Note that the remaining time is not used directly, but is used for
   * calculating current time or duration (it depends on what is missing
   * on a website).
   *
   * Use this property if the website has either current time or duration.
   * Do not override this property if the website contains both current time
   * and duration.
   *
   * Only applies when default implementation of
   * `BaseConnector.getRemainingTime` is used.
   */
  remainingTimeSelector = null;
  /**
   * Selector of an element containing track duration in h:m:s format.
   *
   * Only applies when default implementation of
   * `BaseConnector.getDuration` is used.
   */
  durationSelector = null;
  /**
   * Selector of an element containing both current time and duration.
   * `BaseConnector.currentTimeSelector` and `BaseConnector.durationSelector`
   * properties have priority over this, and `BaseConnector.timeInfoSelector`
   * is used only if any of the previous returns empty result.
   *
   * Only applies when default implementation of
   * `BaseConnector.getTimeInfo` is used.
   */
  timeInfoSelector = null;
  /**
   * Selector of an element containing both artist and track name.
   *
   * `BaseConnector.artistSelector` and `BaseConnector.trackSelector`
   * properties have priority over this,
   * and `BaseConnector.artistTrackSelector` is used only if any of
   * the previous returns empty result.
   *
   * Only applies when default implementation of
   * `BaseConnector.getArtistTrack` is used.
   */
  artistTrackSelector = null;
  /**
   * Selector of a play button element. If the element is not visible,
   * the playback is considered to be playing.
   *
   * Only applies when default implementation of
   * `BaseConnector.isPlaying` is used.
   */
  playButtonSelector = null;
  /**
   * Selector of a pause button element. If the element is visible,
   * the playback is considered to be playing.
   *
   * Only applies when default implementation of
   * `BaseConnector.isPlaying` is used.
   */
  pauseButtonSelector = null;
  /**
   * Selector of a container closest to the player. Changes on this element
   * will be observed and dispatched to `BaseConnector.onStateChanged`.
   *
   * Set this selector to use with default observing or
   * set up some custom detection of player state changing.
   */
  playerSelector = null;
  /**
   * This selector is used to determine where to inject the infobox
   */
  scrobbleInfoLocationSelector = null;
  /**
   * Styles to apply to the infobox
   * this is in camelCase so its fontSize, not font-size
   */
  scrobbleInfoStyle = {
    display: "flex",
    gap: "0.5em",
    alignItems: "center"
  };
  /**
   * Function that gets a unique ID for channel/user blocklist.
   *
   * Has to be specified if usesBlocklist is set to true in connectors.ts.
   * If connectors.ts does not have usesBlocklist set to true, this should be null.
   */
  getChannelId = null;
  /**
   * Selector of an element containing channel label.
   *
   * Only applies when default implementation of
   * {@link getChannelLabel} is used.
   */
  channelLabelSelector = null;
  /**
   * Function that gets a label for the channel of ID fetched by {@link getChannelId}.
   *
   * This is the name that will be displayed to the user, and has no bearing on internal logic.
   * If not specified, {@link getChannelId} will be used.
   */
  getChannelLabel = () => O(this.channelLabelSelector);
  /**
   * Function that gets ID and label for a channel.
   *
   * A connector can specify this in lieu of {@link getChannelId}, as this is basically combo of
   * both {@link getChannelId} and {@link getChannelLabel}
   *
   * You may return null in this function, but if you return a result for one property,
   * you must return a result for both properties, even if the label is just
   * a duplicate of the id.
   */
  getChannelInfo = () => {
    const e = this.getChannelId?.();
    return e ? {
      id: e,
      label: this.getChannelLabel?.() || e
    } : null;
  };
  /**
   * Selector of element contains a track art of now playing song.
   * Default implementation looks for track art URL in `src` attribute or
   * `background-image` (`background`) CSS property of given element.
   *
   * Used for the notification service and "Now playing" popup.
   *
   * If not specified will fall back to Last.fm API.
   */
  trackArtSelector = null;
  /**
   * Priority of getters:
   * 1) getters (`Connector.getArtist` etc.);
   * 2) `Connector.getArtistTrack` and `Connector.getTimeInfo`;
   * 3) `Connector.getTrackInfo`.
   */
  /**
   * Default implementation of artist name lookup by selector.
   *
   * Override this method for more complex behaviour.
   *
   * @returns Song artist
   */
  getArtist;
  /**
   * Default implementation of track name lookup by selector.
   *
   * Override this method for more complex behaviour.
   *
   * @returns Song title
   */
  getTrack;
  /**
   * Default implementation of album name lookup by selector.
   *
   * Override this method for more complex behaviour.
   *
   * @returns Song album
   */
  getAlbum;
  /**
   * Default implementation of album artist name lookup by selector.
   *
   * Override this method for more complex behaviour.
   *
   * @returns Song album artist
   */
  getAlbumArtist;
  /**
   * Default implementation of track duration lookup. If this method returns
   * an empty result, the track duration loaded from L.FM will be used.
   *
   * While it's not generally needed, override this method for more
   * complex behaviour.
   *
   * @returns Track length in seconds
   */
  getDuration;
  /**
   * Default implementation of track current time lookup by selector with
   * some basic parsing.
   *
   * Override this method for more complex behaviour.
   *
   * @returns Number of seconds passed from the beginning of the track
   */
  getCurrentTime;
  /**
   * Default implementation of track remaining time lookup by selector with
   * some basic parsing.
   *
   * Note that the remaining time is not used directly, but is used for
   * calculating current time or duration (it depends on what is missing
   * on a website).
   *
   * Use this property if the website has either current time or duration.
   * Do not override this property if the website contains both current time
   * and duration.
   *
   * Override this method for more complex behaviour.
   *
   * @returns Number of remaining seconds
   */
  getRemainingTime;
  /**
   * Default implementation of current time and duration lookup by selector.
   * This method is called only when `BaseConnector.getCurrentTime` and
   * `BaseConnector.getDuration` return an empty result.
   *
   * Override this method for more complex behaviour.
   *
   * @returns Object containing current time and duration info
   */
  getTimeInfo;
  /**
   * Default implementation of artist and track name lookup by selector.
   * This method is called only when either `BaseConnector.getArtist` or
   * `BaseConnector.getTrack` returns an empty result.
   *
   * Override this method for more complex behaviour.
   *
   * @returns Object containing artist and track information
   */
  getArtistTrack;
  /**
   * Get object contains track info.
   * See documentation of `defaultState` variable for supported properties.
   *
   * Use this function to get several properties
   * from a single source per one call.
   *
   * @returns Track info
   */
  getTrackInfo = () => null;
  /**
   * Returns a unique identifier of current track. The identifier does not
   * have to be in any specific format. The uniqueness is only needed within
   * the scope of the connector (values are internally namespaced by connector
   * names).
   *
   * The value is used for storing the track metadata and reusing them later.
   * Connectors which will implement this method will allow its users to store
   * custom metadata where otherwise the track would be unrecognized.
   *
   * It is strongly recommended for connector authors to implement this method
   * when possible.
   *
   * @returns Song unique ID
   */
  getUniqueID = () => null;
  /**
   * Default implementation of check for active playback by play/pause button
   * selector. The state of playback allows the core to detect pauses.
   *
   * Override this method for custom behaviour.
   *
   * @returns True if song is now playing; false otherwise
   */
  isPlaying;
  /**
   * Default implementation to check whether a podcast is playing. Only has an
   * effect if the user has opted to disable podcast scrobbling.
   *
   * @returns True if the current track is a podcast; false otherwise
   */
  isPodcast = () => !1;
  /**
   * Default implementation used to get the track art URL from the selector.
   *
   * Override this method for more complex behaviour.
   *
   * @returns Track art URL
   */
  getTrackArt;
  /**
   * Default implementation of a check if given track art URL
   * equals default one. Default track arts are not used by the extension.
   *
   * Override this method to exclude default track arts.
   *
   * @param trackArtUrl - Track art URL
   * @returns Check result
   */
  isTrackArtDefault = () => !1;
  /**
   * Button to love/like a song on listening service.
   *
   * Note: for safety, you should generally implement BOTH loveButtonSelector AND unloveButtonSelector.
   * Ensure there is a direct transition between one to the other with zero time where neither matches.
   * Web scrobbler not discovering either for a bit will cause it not to to love/unlove.
   */
  loveButtonSelector = null;
  /**
   * Button to unlove/unlike a song on listening service.
   *
   * Note: for safety, you should generally implement BOTH loveButtonSelector AND unloveButtonSelector.
   * Ensure there is a direct transition between one to the other with zero time where neither matches.
   * Web scrobbler not discovering either for a bit will cause it not to to love/unlove.
   */
  unloveButtonSelector = null;
  /**
   * A check to see if song is loved or not.
   * If this changes from false to true or vice-versa the song
   * will be loved/unloved on scrobbling services.
   *
   * @returns True if song is liked; false otherwise
   */
  isLoved = () => {
    if (this.loveButtonSelector) {
      if (ae(this.loveButtonSelector))
        return !1;
      if (!this.unloveButtonSelector)
        return !0;
    }
    if (this.unloveButtonSelector) {
      if (ae(this.unloveButtonSelector))
        return !0;
      if (!this.loveButtonSelector)
        return !1;
    }
    return null;
  };
  /**
   * Default implementation of a check to see if a state change is allowed.
   * MutationObserver will ignore mutations while this function returns false.
   *
   * Override this method to allow certain states to be ignored, for example
   * if an advert is playing.
   *
   * @returns True if state change is allowed; false otherwise
   */
  isStateChangeAllowed = () => !0;
  /**
   * Default implementation of a check to see if scrobbling is allowed.
   * The connector resets current state if this function returns non-falsy state.
   * The string content of non-falsy state determines the reason to show user for non-scrobbling.
   *
   * Override this method to allow certain states to be reset.
   *
   * @returns null/undefined if state change is allowed; {@link DisallowedReason} otherwise
   */
  scrobblingDisallowedReason = () => null;
  /**
   * Function that will be called when the connector is injected and
   * the starter is configured to listen to state change.
   *
   * Override this method for more complex behaviour.
   */
  onReady = () => {
  };
  /**
   * Called then injected script emits event.
   * See `Connector.injectScript` for details.
   *
   * Override this method to get data from injected scripts.
   *
   * @param event - Event object
   */
  onScriptEvent = () => {
  };
  /**
   * Default metadata filter to be used if none other is specified
   */
  defaultFilter = It(
    xt(
      ["artist", "track", "album", "albumArtist"],
      [(e) => e.trim(), _t]
    )
  );
  /**
   * Connectors can use, but must not override functions
   * and properties defined below.
   */
  /**
   * Add custom filter to default one. Use this method only to apply
   * custom metadata filters.
   *
   * The given filter will be used first to make sure the default filter
   * is executed after all other filters.
   *
   * @param filter - Filter object
   */
  applyFilter;
  /**
   * Send request to core to reset current state. Should be used if connector
   * has custom state change listener.
   */
  resetState;
  /**
   * Inject custom script into a page.
   *
   * Injected scripts communicate with content scripts
   * using `window.postMessage` function.
   *
   * The format of message is following:
   * \{
   * 	   // required fields
   *	   sender: 'web-scrobbler',
   *	   // optional fields used to exchange data
   *	   foo: bar,
   * 	   bar: baz,
   * \}
   *
   * @param scriptFile - Path to script file
   */
  injectScript = (e) => {
    if (window.webScrobblerScripts || (window.webScrobblerScripts = {}), window.webScrobblerScripts[e])
      return;
    const t = T.runtime.getURL(e);
    Qt(t), y(`Injected ${e}`), window.addEventListener(
      "message",
      (r) => {
        typeof r.data != "object" || !("sender" in r.data) || r.data.sender !== "web-scrobbler" || this.onScriptEvent(r);
      }
    ), window.webScrobblerScripts[e] = !0;
  };
  /**
   * Listener for the player state changes. Automatically detects the state,
   * collects the track metadata and communicates with the background script
   * if needed.
   */
  onStateChanged;
  /**
   * Enable support for MediaSession API.
   *
   * The connector will use MediaMetadata to get track info,
   * if Media Session API is available, and MediaMetadata is filled.
   */
  useMediaSessionApi = () => {
    this.isMediaSessionAllowed = "mediaSession" in navigator;
  };
  /**
   * used by {@link BaseConnector.useTabAudibleApi} for async {@link BaseConnector.isPlaying} updates
   */
  isPlayingAsync = !0;
  /**
   * interval being used by {@link BaseConnector.useTabAudibleApi}
   */
  tabAudibleFetchingInterval = null;
  /**
   * Enable using tab audible function for deciding whether song is playing.
   *
   * Polls for audible once a second, this isn't expensive so it's fine.
   *
   * overrides {@link BaseConnector.isPlaying}
   */
  useTabAudibleApi = () => {
    this.isPlaying = () => this.isPlayingAsync, this.tabAudibleFetchingInterval !== null && clearInterval(this.tabAudibleFetchingInterval), this.tabAudibleFetchingInterval = setInterval(() => {
      v({
        type: "isTabAudible",
        payload: void 0
      }).then((e) => {
        this.isPlayingAsync = e, this.onStateChanged();
      }).catch(() => {
        this.isPlayingAsync = !0, this.onStateChanged();
      });
    }, 1e3);
  };
  /**
   * Internal functions, state & API.
   *
   * Connectors must not call functions defined below.
   * Connectors must not override functions and properties defined below.
   */
  /**
   * Default implementation for getting origin URL.
   *
   * @returns The source URL
   */
  getOriginUrl = () => document.location.href;
  /**
   * Boolean flag that indicates whether MediaSession API is supported.
   * This flag is set to true if connector calls `useMediaSessionApi` method.
   * Otherwise, it is set to false.
   */
  isMediaSessionAllowed = !1;
  /**
   * Filter object used to filter song metadata.
   */
  metadataFilter = this.defaultFilter;
  /**
   * Default values of state properties.
   */
  defaultState = {
    track: null,
    artist: null,
    album: null,
    albumArtist: null,
    uniqueID: null,
    duration: null,
    currentTime: null,
    isPlaying: !0,
    trackArt: null,
    isPodcast: !1,
    originUrl: null,
    scrobblingDisallowedReason: null
  };
  mediaSessionFields = [
    "artist",
    "track",
    "album",
    "trackArt"
  ];
  artistTrackFields = ["artist", "track"];
  timeInfoFields = ["duration", "currentTime"];
  /**
   * Gathered info about the current track for internal use.
   */
  currentState = Object.assign({}, this.defaultState);
  /**
   * Filtered info about the current track for internal use.
   */
  filteredState = Object.assign({}, this.defaultState);
  /**
   * Flag indicates the current state is reset by the connector.
   * Used to prevent spamming the controller by empty states.
   */
  isStateReset = !1;
  /**
   * Callback set by the controller to listen on state changes of this connector.
   */
  _controllerCallback = null;
  /**
   * Callback set by the controller to listen on state changes of this connector.
   */
  get controllerCallback() {
    return this._controllerCallback;
  }
  set controllerCallback(e) {
    e(this.getCurrentState()), this._controllerCallback = e;
  }
  /**
   * Callback set by the controller to listen on state changes of this connector.
   */
  _isLovedCallback = null;
  /**
   * Callback set by the controller to listen on state changes of this connector.
   */
  get isLovedCallback() {
    return this._isLovedCallback;
  }
  set isLovedCallback(e) {
    e(this.isLoved() ?? null), this._isLovedCallback = e;
  }
  /**
   * Function for all the hard work around detecting and updating state.
   */
  stateChangedWorker;
  /**
   * Get current state of connector.
   * @returns Current state
   */
  getCurrentState;
  /**
   * Filter changed fields.
   * @param changedFields - List of changed fields
   */
  filterState;
  /**
   * Throttled call for state changed worker.
   */
  stateChangedWorkerThrottled;
  constructor(e) {
    this.meta = e, this.getArtist = () => O(this.artistSelector), this.getTrack = () => O(this.trackSelector), this.getAlbum = () => O(this.albumSelector), this.getAlbumArtist = () => O(this.albumArtistSelector), this.getDuration = () => we(this.durationSelector), this.getCurrentTime = () => we(this.currentTimeSelector), this.getRemainingTime = () => we(this.remainingTimeSelector), this.getTimeInfo = () => $t(
      O(this.timeInfoSelector)
    ), this.getArtistTrack = () => $e(
      O(this.artistTrackSelector)
    ), this.isPlaying = () => {
      const t = () => this.playButtonSelector ? !ae(this.playButtonSelector) : null, r = this.pauseButtonSelector ? ae(this.pauseButtonSelector) : null;
      return (r || t()) ?? r ?? !0;
    }, this.getTrackArt = () => Wt(this.trackArtSelector), this.applyFilter = (t) => {
      this.metadataFilter = t.extend(this.defaultFilter);
    }, this.resetState = () => {
      this.isStateReset || (this.controllerCallback !== null && this.controllerCallback({}), this.isStateReset = !0);
    }, this.onStateChanged = () => {
      if (!this.isStateChangeAllowed())
        return;
      this.isPlaying() !== this.currentState.isPlaying ? this.stateChangedWorker() : this.stateChangedWorkerThrottled();
    }, this.stateChangedWorker = () => {
      this.isStateReset = !1;
      const t = [], r = this.getCurrentState();
      for (const a in this.currentState) {
        let i;
        const n = a;
        r[n] || r[n] === !1 ? i = r[n] : i = this.defaultState[n];
        const h = this.currentState[n];
        i !== h && (this.currentState[n] = i, t.push(n));
      }
      t.length > 0 && (this.filterState(t), this.controllerCallback !== null && this.controllerCallback(this.filteredState)), this.isLovedCallback?.(this.isLoved() ?? null);
    }, this.getCurrentState = () => {
      const t = {
        albumArtist: this.getAlbumArtist(),
        uniqueID: this.getUniqueID(),
        duration: this.getDuration(),
        currentTime: this.getCurrentTime(),
        isPlaying: this.isPlaying(),
        isPodcast: this.isPodcast(),
        originUrl: this.getOriginUrl(),
        scrobblingDisallowedReason: this.scrobblingDisallowedReason()
      };
      let r = null;
      if (this.isMediaSessionAllowed) {
        const { mediaSession: w } = navigator;
        r = Gt(w);
      }
      r || (r = {
        trackArt: this.getTrackArt(),
        artist: this.getArtist(),
        track: this.getTrack(),
        album: this.getAlbum()
      }), re(
        t,
        r,
        this.mediaSessionFields
      );
      const a = Math.abs(this.getRemainingTime() ?? 0);
      a && (!t.currentTime && t.duration && (t.currentTime = t.duration - a), !t.duration && t.currentTime && (t.duration = t.currentTime + a));
      const i = this.getTimeInfo();
      re(t, i, this.timeInfoFields);
      const n = this.getArtistTrack();
      re(t, n, this.artistTrackFields);
      const h = this.getTrackInfo();
      return h !== null && re(
        t,
        h,
        Object.keys(this.defaultState)
      ), t;
    }, this.filterState = (t) => {
      for (const r of t) {
        let a = this.currentState[r];
        switch (r) {
          case "albumArtist":
          case "artist":
          case "track":
          case "album": {
            if (a == null) {
              a = this.defaultState[r];
              break;
            }
            a = this.metadataFilter.filterField(
              r,
              a
            ) || this.defaultState[r];
            break;
          }
          case "currentTime":
          case "duration": {
            if (a == null) {
              a = this.defaultState[r];
              break;
            }
            a = qt(a) || this.defaultState[r];
            break;
          }
          case "trackArt":
            a && this.isTrackArtDefault(a) && (a = null);
            break;
        }
        this.filteredState[r] = a;
      }
    }, this.stateChangedWorkerThrottled = Vt(
      this.stateChangedWorker,
      500
    ), setTimeout(() => {
      this.onStateChanged();
    }, 1e3);
  }
}
const q = I(Ne), Ee = I(
  Fe
), is = I(
  At
), os = "useNotifications", ns = "useUnrecognizedSongNotifications", He = "showInfobox", Ve = "scrobblePodcasts", Ge = "autoToggleLove", Ke = "forceRecognize", ls = "scrobbleRecognizedTracks", We = "scrobbleEditedTracksOnly", cs = "scrobblePercent", G = "disabledConnectors", Qr = "debugLoggingEnabled", us = "albumGuessingDisabled", Xr = "albumGuessingUneditedOnly", ds = "albumGuessingAllTracks", ms = {
  [Ke]: !1,
  [Ve]: !0,
  [os]: !0,
  [ns]: !1,
  [ls]: !0,
  [We]: !1,
  [Qr]: !1,
  [cs]: wt,
  [He]: !0,
  [Ge]: !0,
  [us]: !1,
  [Xr]: !0,
  [ds]: !1,
  [G]: {}
}, Zr = {
  [Ke]: !1,
  [ls]: !0,
  [We]: !1,
  [Ve]: !0,
  [os]: !0,
  [ns]: !1,
  [He]: !0,
  [Ge]: !0
}, Ie = {
  YouTube: {
    scrobbleMusicRecognisedOnly: !0,
    enableGetTrackInfoFromYtMusic: !0,
    scrobbleMusicOnly: !0,
    scrobbleEntertainmentOnly: !1
  }
};
async function ea() {
  const s = { ...ms, ...await q.get() };
  await q.set(s), q.debugLog([G]);
  const e = {
    ...Ie,
    ...await Ee.get()
  };
  for (const t in Ie) {
    const r = t;
    e[r] = {
      ...Ie[r],
      ...e[r]
    };
  }
  await Ee.set(e), Ee.debugLog(), is.debugLog();
}
async function ta() {
  const s = await q.get();
  if (!s)
    throw new Error("No options data found");
  for (const e of Object.keys(s[G])) {
    let t = !1;
    for (const r of ht)
      if (r.id === e) {
        t = !0;
        break;
      }
    t || delete s[G][e];
  }
}
async function B(s, e) {
  if (ra(s), e !== void 0) {
    const r = await sa(e, s);
    if (r !== void 0)
      return r;
  }
  return (await q.get())?.[s];
}
async function sa(s, e) {
  return aa(e) ? (await is.get())?.[s]?.[e] : void 0;
}
function ra(s) {
  if (!(s in ms))
    throw new Error(`Unknown option key: ${s}`);
  return !0;
}
function aa(s) {
  return s in Zr;
}
async function ia(s, e) {
  const t = await q.get();
  if (!t)
    throw new Error("No options data found");
  e ? delete t[G][s.id] : t[G][s.id] = !0, await q.set(t);
}
ea().then(ta);
class Je {
  /**
   * Get song artist.
   *
   * @returns Song artist
   */
  getArtist() {
    return this.processed.artist || this.parsed.artist;
  }
  /**
   * Get song title.
   *
   * @returns Song title
   */
  getTrack() {
    return this.processed.track || this.parsed.track;
  }
  /**
   * Get song album.
   *
   * @returns Song album
   */
  getAlbum() {
    return this.processed.album || this.parsed.album;
  }
  /**
   * Return song's album artist (Optional)
   * @returns Album artist
   */
  getAlbumArtist() {
    return this.processed.albumArtist || this.parsed.albumArtist;
  }
  /**
   * Returns song's processed or parsed duration in seconds.
   * Parsed duration (received from connector) is preferred.
   *
   * @returns Song duration
   */
  getDuration() {
    return this.parsed.duration || this.processed.duration;
  }
  /**
   * Return the track art URL associated with the song.
   * Parsed track art (received from connector) is preferred.
   *
   * @returns Track art URL
   */
  getTrackArt() {
    return this.parsed.trackArt || this.metadata.trackArtUrl || null;
  }
  /**
   * Get formatted "Artist - Track" string. Return null if song is empty.
   *
   * @returns Formatted string
   */
  getArtistTrackString() {
    return this.isEmpty() ? null : `${this.getArtist() ?? "undefined"} — ${this.getTrack() ?? "undefined"}`;
  }
  /**
   * Get song unique ID.
   *
   * @returns Unique ID
   */
  getUniqueId() {
    return this.parsed.uniqueID;
  }
  /**
   * Get song source URL.
   *
   * @returns source URL.
   */
  getOriginUrl() {
    return this.parsed.originUrl;
  }
  /**
   * Check if song is empty. Empty song means it's missing
   * either artist or track title.
   *
   * @returns True if song is empty; false otherwise
   */
  isEmpty() {
    return !(this.getArtist() && this.getTrack());
  }
  /**
   * Check if song is valid. The song means valid if it's known by
   * scrobbler service or is corrected by the user.
   *
   * @returns True if song is valid; false otherwise
   */
  isValid() {
    return this.flags.isValid || this.flags.isCorrectedByUser;
  }
  /**
   * Check if song equals another song.
   * @param song - Song instance to compare
   * @returns Check result
   */
  equals(e) {
    if (!e || !(e instanceof Je))
      return !1;
    const t = this.getUniqueId(), r = e.getUniqueId();
    return t || r ? t === r : this.getArtist() === e.getArtist() && this.getTrack() === e.getTrack() && this.getAlbum() === e.getAlbum();
  }
  /**
   * Get a string representing the song.
   *
   * @returns String representing the object.
   */
  toString() {
    return JSON.stringify(this, null, 2);
  }
  /**
   * Get song data to send it to different context.
   *
   * @returns Object contain song data
   */
  getCloneableData() {
    return {
      parsed: this.parsed,
      noRegex: this.noRegex,
      processed: this.processed,
      metadata: this.metadata,
      flags: this.flags,
      connector: this.connector
    };
  }
  /**
   * Set `Love` status of song.
   *
   * This function is supposed to be used by multiple scrobblers
   * (services). Each service can have different value of `Love` flag;
   * the behavior of the function is to set `Love` to true, if all
   * services have the song with `Love` set to true.
   * @param isLoved - Flag means song is loved or not
   * @param force - Force status assignment
   */
  setLoveStatus(e, t = !1) {
    if (t) {
      this.metadata.userloved = e;
      return;
    }
    e ? this.metadata.userloved === void 0 && (this.metadata.userloved = !0) : this.metadata.userloved = !1;
  }
  /**
   * Custom fields can be defined by user.
   */
  static get USER_FIELDS() {
    return ["artist", "track", "album", "albumArtist"];
  }
  /**
   * Fields used to identify song.
   */
  static get BASE_FIELDS() {
    return ["artist", "track", "album", "albumArtist"];
  }
  /**
   * Fields in a processed song.
   */
  static get PROCESSED_FIELDS() {
    return ["track", "album", "artist", "albumArtist", "duration"];
  }
}
class X extends Je {
  parsed;
  processed;
  noRegex;
  flags;
  metadata;
  connector;
  /**
   * @param parsedData - Current state received from connector
   * @param connector - Connector match object
   */
  constructor(e, t) {
    super(), this.parsed = Object.assign(
      {
        track: null,
        artist: null,
        albumArtist: null,
        album: null,
        duration: null
      },
      e
    ), this.processed = {
      track: null,
      artist: null,
      albumArtist: null,
      album: null,
      duration: null
    }, this.noRegex = {
      track: null,
      artist: null,
      albumArtist: null,
      album: null,
      duration: null
    }, this.flags = {
      /* Filled in `initFlags` method */
    }, this.metadata = {
      /* Filled in `initMetadata` method */
    }, this.connector = t, this.initSongData();
  }
  resetInfo() {
    this.initProcessedData();
  }
  resetData() {
    this.initFlags(), this.initMetadata();
  }
  /** Private methods. */
  initSongData() {
    this.initFlags(), this.initMetadata(), this.initProcessedData();
  }
  initFlags() {
    this.flags = {
      /**
       * Flag means song is scrobbled successfully.
       */
      isScrobbled: !1,
      /**
       * Flag indicated song info is changed or approved by user.
       */
      isCorrectedByUser: !1,
      /**
       * Flag indicating song info has been affected by a user regex/bulk edit
       */
      isRegexEditedByUser: {
        track: !1,
        artist: !1,
        album: !1,
        albumArtist: !1
      },
      /**
       * Flag indicating that the album of the current track was fetched from the Last.fm API
       */
      isAlbumFetched: !1,
      /**
       * Flag indicated song is known by scrobbling service.
       */
      isValid: !1,
      /**
       * Flag indicates song is marked as playing by controller.
       */
      isMarkedAsPlaying: !1,
      /**
       * Flag means song is ignored by controller.
       */
      isSkipped: !1,
      /**
       * Flag means song is replaying again.
       */
      isReplaying: !1,
      /**
       * Flag means song has blocked tag
       */
      hasBlockedTag: !1,
      /**
       * Flag means song has been liked/loved in the scrobbling service.
       * Is null until value has been read from the service page.
       * This is because we do not want to do anything when first setting from page,
       * but we do want to do something if the value changes afterwards.
       */
      isLovedInService: null,
      /**
       * finishedProcessing is set to true after done processing in pipelines.
       * While false don't set the song as playing while we wait for pipelines to finish.
       */
      finishedProcessing: !1
    };
  }
  initMetadata() {
    this.metadata = {
      /**
       * Flag indicates song is loved by used on service.
       */
      userloved: void 0,
      /**
       * Time when song is started playing in UNIX timestamp format.
       */
      startTimestamp: Math.floor(Date.now() / 1e3),
      label: this.connector.label
    };
  }
  initProcessedData() {
    for (const e of X.PROCESSED_FIELDS)
      this.processed[e] = null, this.noRegex[e] = null;
  }
}
class it {
  targetSeconds = null;
  startedOn = null;
  pausedOn = null;
  spentPaused = 0;
  callback = null;
  hasTriggered = !1;
  timeoutId = null;
  constructor() {
    this.reset();
  }
  /**
   * Reset timer.
   */
  reset() {
    this.targetSeconds = null, this.startedOn = null, this.pausedOn = null, this.spentPaused = 0, this.callback = null, this.hasTriggered = !1, this.clearTrigger();
  }
  /**
   * Set timer and define trigger callback.
   * Use update function to define time to trigger.
   * @param cb - Function that will be called when timer is triggered
   */
  start(e) {
    this.reset(), this.startedOn = te(), this.callback = e;
  }
  /**
   * Pause timer.
   */
  pause() {
    this.startedOn !== null && this.pausedOn === null && (this.pausedOn = te(), this.clearTrigger());
  }
  /**
   * Unpause timer.
   */
  resume() {
    this.startedOn !== null && this.pausedOn !== null && (this.spentPaused += te() - this.pausedOn, this.pausedOn = null, !this.hasTriggered && this.targetSeconds !== null && this.targetSeconds !== void 0 && this.setTrigger(this.targetSeconds - this.getElapsed()));
  }
  /**
   * Update time for this timer before callback is triggered.
   * Already elapsed time is not modified and callback
   * will be triggered immediately if the new time is less than elapsed.
   *
   * Pass null to set destination time to 'never' - this prevents the timer from
   * triggering but still keeps it counting time.
   *
   * Intentionally does not check if the callback was already triggered.
   * This allows to update the timer after it went out once and still
   * be able to properly trigger the callback for the new timeout.
   *
   * @param seconds - Seconds
   */
  update(e) {
    this.startedOn !== null && (this.targetSeconds = e, this.targetSeconds !== null && this.targetSeconds !== void 0 ? this.pausedOn === null && this.setTrigger(this.targetSeconds - this.getElapsed()) : this.clearTrigger());
  }
  /**
   * Return remaining seconds or null if no destination time is set.
   * @returns Remaining seconds
   */
  getRemainingSeconds() {
    return this.targetSeconds === null || this.targetSeconds === void 0 ? null : this.targetSeconds - this.getElapsed();
  }
  /**
   * Check if timer is expired. Expired timer has negative remaining time.
   * @returns Check result
   */
  isExpired() {
    const e = this.getRemainingSeconds();
    return e !== null && e < 0;
  }
  /* Internal functions. */
  /**
   * Trigger timer in given seconds.
   * @param seconds - Seconds
   */
  setTrigger(e) {
    this.clearTrigger(), this.timeoutId = window.setTimeout(() => {
      this.callback && (this.callback(), this.hasTriggered = !0);
    }, e * 1e3);
  }
  /**
   * Clear internal timeout.
   */
  clearTrigger() {
    this.timeoutId && clearTimeout(this.timeoutId), this.timeoutId = null;
  }
  /**
   * Return seconds passed from the timer was started.
   * Time spent paused does not count
   * @returns Elapsed seconds
   */
  getElapsed() {
    if (this.startedOn === null)
      throw Error("elapsed time called before alarm started");
    let e = te() - this.startedOn - this.spentPaused;
    return this.pausedOn !== null && (e -= te() - this.pausedOn), e;
  }
}
function te() {
  return Math.round((/* @__PURE__ */ new Date()).valueOf() / 1e3);
}
var ye = { exports: {} }, oa = ye.exports, ot;
function na() {
  return ot || (ot = 1, (function(s) {
    (function(e) {
      function t(c, u) {
        var o = (c & 65535) + (u & 65535), b = (c >> 16) + (u >> 16) + (o >> 16);
        return b << 16 | o & 65535;
      }
      function r(c, u) {
        return c << u | c >>> 32 - u;
      }
      function a(c, u, o, b, p, S) {
        return t(r(t(t(u, c), t(b, S)), p), o);
      }
      function i(c, u, o, b, p, S, j) {
        return a(u & o | ~u & b, c, u, p, S, j);
      }
      function n(c, u, o, b, p, S, j) {
        return a(u & b | o & ~b, c, u, p, S, j);
      }
      function h(c, u, o, b, p, S, j) {
        return a(u ^ o ^ b, c, u, p, S, j);
      }
      function w(c, u, o, b, p, S, j) {
        return a(o ^ (u | ~b), c, u, p, S, j);
      }
      function A(c, u) {
        c[u >> 5] |= 128 << u % 32, c[(u + 64 >>> 9 << 4) + 14] = u;
        var o, b, p, S, j, m = 1732584193, l = -271733879, g = -1732584194, d = 271733878;
        for (o = 0; o < c.length; o += 16)
          b = m, p = l, S = g, j = d, m = i(m, l, g, d, c[o], 7, -680876936), d = i(d, m, l, g, c[o + 1], 12, -389564586), g = i(g, d, m, l, c[o + 2], 17, 606105819), l = i(l, g, d, m, c[o + 3], 22, -1044525330), m = i(m, l, g, d, c[o + 4], 7, -176418897), d = i(d, m, l, g, c[o + 5], 12, 1200080426), g = i(g, d, m, l, c[o + 6], 17, -1473231341), l = i(l, g, d, m, c[o + 7], 22, -45705983), m = i(m, l, g, d, c[o + 8], 7, 1770035416), d = i(d, m, l, g, c[o + 9], 12, -1958414417), g = i(g, d, m, l, c[o + 10], 17, -42063), l = i(l, g, d, m, c[o + 11], 22, -1990404162), m = i(m, l, g, d, c[o + 12], 7, 1804603682), d = i(d, m, l, g, c[o + 13], 12, -40341101), g = i(g, d, m, l, c[o + 14], 17, -1502002290), l = i(l, g, d, m, c[o + 15], 22, 1236535329), m = n(m, l, g, d, c[o + 1], 5, -165796510), d = n(d, m, l, g, c[o + 6], 9, -1069501632), g = n(g, d, m, l, c[o + 11], 14, 643717713), l = n(l, g, d, m, c[o], 20, -373897302), m = n(m, l, g, d, c[o + 5], 5, -701558691), d = n(d, m, l, g, c[o + 10], 9, 38016083), g = n(g, d, m, l, c[o + 15], 14, -660478335), l = n(l, g, d, m, c[o + 4], 20, -405537848), m = n(m, l, g, d, c[o + 9], 5, 568446438), d = n(d, m, l, g, c[o + 14], 9, -1019803690), g = n(g, d, m, l, c[o + 3], 14, -187363961), l = n(l, g, d, m, c[o + 8], 20, 1163531501), m = n(m, l, g, d, c[o + 13], 5, -1444681467), d = n(d, m, l, g, c[o + 2], 9, -51403784), g = n(g, d, m, l, c[o + 7], 14, 1735328473), l = n(l, g, d, m, c[o + 12], 20, -1926607734), m = h(m, l, g, d, c[o + 5], 4, -378558), d = h(d, m, l, g, c[o + 8], 11, -2022574463), g = h(g, d, m, l, c[o + 11], 16, 1839030562), l = h(l, g, d, m, c[o + 14], 23, -35309556), m = h(m, l, g, d, c[o + 1], 4, -1530992060), d = h(d, m, l, g, c[o + 4], 11, 1272893353), g = h(g, d, m, l, c[o + 7], 16, -155497632), l = h(l, g, d, m, c[o + 10], 23, -1094730640), m = h(m, l, g, d, c[o + 13], 4, 681279174), d = h(d, m, l, g, c[o], 11, -358537222), g = h(g, d, m, l, c[o + 3], 16, -722521979), l = h(l, g, d, m, c[o + 6], 23, 76029189), m = h(m, l, g, d, c[o + 9], 4, -640364487), d = h(d, m, l, g, c[o + 12], 11, -421815835), g = h(g, d, m, l, c[o + 15], 16, 530742520), l = h(l, g, d, m, c[o + 2], 23, -995338651), m = w(m, l, g, d, c[o], 6, -198630844), d = w(d, m, l, g, c[o + 7], 10, 1126891415), g = w(g, d, m, l, c[o + 14], 15, -1416354905), l = w(l, g, d, m, c[o + 5], 21, -57434055), m = w(m, l, g, d, c[o + 12], 6, 1700485571), d = w(d, m, l, g, c[o + 3], 10, -1894986606), g = w(g, d, m, l, c[o + 10], 15, -1051523), l = w(l, g, d, m, c[o + 1], 21, -2054922799), m = w(m, l, g, d, c[o + 8], 6, 1873313359), d = w(d, m, l, g, c[o + 15], 10, -30611744), g = w(g, d, m, l, c[o + 6], 15, -1560198380), l = w(l, g, d, m, c[o + 13], 21, 1309151649), m = w(m, l, g, d, c[o + 4], 6, -145523070), d = w(d, m, l, g, c[o + 11], 10, -1120210379), g = w(g, d, m, l, c[o + 2], 15, 718787259), l = w(l, g, d, m, c[o + 9], 21, -343485551), m = t(m, b), l = t(l, p), g = t(g, S), d = t(d, j);
        return [m, l, g, d];
      }
      function k(c) {
        var u, o = "", b = c.length * 32;
        for (u = 0; u < b; u += 8)
          o += String.fromCharCode(c[u >> 5] >>> u % 32 & 255);
        return o;
      }
      function P(c) {
        var u, o = [];
        for (o[(c.length >> 2) - 1] = void 0, u = 0; u < o.length; u += 1)
          o[u] = 0;
        var b = c.length * 8;
        for (u = 0; u < b; u += 8)
          o[u >> 5] |= (c.charCodeAt(u / 8) & 255) << u % 32;
        return o;
      }
      function le(c) {
        return k(A(P(c), c.length * 8));
      }
      function K(c, u) {
        var o, b = P(c), p = [], S = [], j;
        for (p[15] = S[15] = void 0, b.length > 16 && (b = A(b, c.length * 8)), o = 0; o < 16; o += 1)
          p[o] = b[o] ^ 909522486, S[o] = b[o] ^ 1549556828;
        return j = A(p.concat(P(u)), 512 + u.length * 8), k(A(S.concat(j), 640));
      }
      function z(c) {
        var u = "0123456789abcdef", o = "", b, p;
        for (p = 0; p < c.length; p += 1)
          b = c.charCodeAt(p), o += u.charAt(b >>> 4 & 15) + u.charAt(b & 15);
        return o;
      }
      function $(c) {
        return unescape(encodeURIComponent(c));
      }
      function ce(c) {
        return le($(c));
      }
      function ue(c) {
        return z(ce(c));
      }
      function de(c, u) {
        return K($(c), $(u));
      }
      function me(c, u) {
        return z(de(c, u));
      }
      function ge(c, u, o) {
        return u ? o ? de(u, c) : me(u, c) : o ? ce(c) : ue(c);
      }
      s.exports ? s.exports = ge : e.md5 = ge;
    })(oa);
  })(ye)), ye.exports;
}
var la = na();
const gs = /* @__PURE__ */ bt(la);
class Ye {
  storageRef;
  constructor() {
    this.storageRef = null;
  }
  _init(e) {
    this.storageRef = e;
  }
  /**
   * Remove all data from the storage.
   */
  async clear() {
    if (this.storageRef)
      return await this.storageRef.clear();
  }
  /**
   * Return data from the storage.
   *
   * @returns Storage data
   */
  async getData() {
    return this.storageRef ? await this.storageRef.get() : (_("Storage reference is not initialized", "warn"), null);
  }
  /**
   * Overwrite a given data to the storage.
   *
   * @param data - Data to save
   * @returns Storage data
   */
  async saveData(e) {
    if (!this.storageRef) {
      _("Storage reference is not initialized", "warn");
      return;
    }
    return await this.storageRef.set(e);
  }
  /**
   * Append a given data in the storage.
   *
   * @param data - Data to save
   * @returns Storage data
   */
  async updateData(e) {
    if (!this.storageRef) {
      _("Storage reference is not initialized", "warn");
      return;
    }
    return await this.storageRef.update(e);
  }
}
class U extends Ye {
  /**
   * Public functions.
   */
  /**
   * Apply edited song info to a given song object.
   *
   * @param song - Song instance
   * @returns True if data is loaded; false otherwise
   */
  async loadSongInfo(e) {
    let t = U.getSongId(e);
    const r = await this.getSongInfoStorage();
    if ((!r || !(t in r)) && (t = U.makeSongId(e, [
      "artist",
      "track",
      "album"
    ])), (!r || !(t in r)) && (t = U.makeSongId(e, ["artist", "track"])), r && t in r) {
      const a = r[t];
      return U.applyLoadedInfo(e, a), !0;
    }
    return !1;
  }
  /**
   * Save custom song info to the storage.
   *
   * @param song - Song instance
   * @param dataToSave - User data
   */
  async saveSongInfo(e, t) {
    const r = U.getSongId(e), a = await this.getSongInfoStorage();
    if (a === null) {
      await this.saveSongInfoToStorage({
        [r]: t
      });
      return;
    }
    a[r] = {
      ...a[r],
      ...t
    }, await this.saveSongInfoToStorage(a);
  }
  /**
   * Remove song info from the storage.
   *
   * @param song - Song object
   */
  async removeSongInfo(e) {
    if (e === null)
      throw new Error("Song is null");
    const t = U.getSongId(e);
    await this.removeSongInfoById(t);
  }
  /**
   * Remove song info from the storage.
   *
   * @param songId - Song ID
   */
  async removeSongInfoById(e) {
    const t = await this.getSongInfoStorage();
    t !== null && (delete t[e], await this.saveSongInfoToStorage(t));
  }
  /**
   * Static functions.
   */
  /**
   * Apply loaded info to a given song.
   *
   * @param song - Song instance
   * @param loadedInfo - Object containing loaded song info
   */
  static applyLoadedInfo(e, t) {
    e.processed = {
      ...e.processed,
      ...t
    };
  }
  /**
   * Get a song ID. If a song internal unique ID is missing,
   * generate a new unique ID.
   *
   * @param song - Song instance
   *
   * @returns Song unique ID
   */
  static getSongId(e) {
    const t = e.getUniqueId();
    return t || U.makeSongId(e, X.BASE_FIELDS);
  }
  /**
   * Create an unique ID for a song based on song properties.
   *
   * @param song - Song instance
   * @param properties - Array of properties
   *
   * @returns Generated unique ID
   */
  static makeSongId(e, t) {
    let r = "";
    for (const a of t)
      e.parsed[a] && (r += e.parsed[a]);
    if (r)
      return gs(r);
    throw new Error("Empty song");
  }
}
class ca extends U {
  songInfoStorage = I(
    be
  );
  init() {
    this._init(oe(be));
  }
  /** @override */
  async clear() {
    return await this.songInfoStorage.clear();
  }
  /** @override */
  async getSongInfoStorage() {
    return this.songInfoStorage.get();
  }
  /** @override */
  async saveSongInfoToStorage(e) {
    return await this.songInfoStorage.set(e);
  }
  /** @override */
  getStorage() {
    return I(be);
  }
}
const je = new ca();
async function ua(s) {
  let e = !1;
  try {
    e = await je.loadSongInfo(s);
  } catch (t) {
    y(t, "error");
  }
  s.flags.isCorrectedByUser = e;
}
const da = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  process: ua
}, Symbol.toStringTag, { value: "Module" }));
function ma(s) {
  for (const e of X.PROCESSED_FIELDS)
    s.processed[e] = s.parsed[e];
}
const ga = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  process: ma
}, Symbol.toStringTag, { value: "Module" })), ha = [
  "duration",
  "artist",
  "track"
], fa = [
  "trackArtUrl",
  "artistUrl",
  "trackUrl",
  "albumUrl",
  "userPlayCount",
  "albumMbId"
];
async function ba(s, e) {
  if (s.isEmpty())
    return;
  const t = await v({
    type: "getSongInfo",
    payload: {
      song: s.getCloneableData()
    }
  }), r = wa(t), a = r !== null;
  if (a) {
    if (!s.flags.isCorrectedByUser)
      for (const h of ha)
        r[h] && (s.processed[h] = r[h]);
    await pa(s) && (s.processed.album = r.album, s.noRegex.album = r.album, s.flags.isAlbumFetched = !0);
    for (const h of fa)
      s.metadata[h] = r[h];
  }
  const i = await B(
    Ke,
    e.id
  ), n = await B(
    We,
    e.id
  );
  s.flags.isValid = (a || !!i) && (s.flags.isCorrectedByUser || !n);
}
async function pa(s) {
  return s.getAlbum() && !s.flags.isAlbumFetched || await B(us) ? !1 : await B(ds) ? !0 : !s.flags.isCorrectedByUser;
}
function wa(s) {
  return s.length === 0 ? null : s.reduce((e, t) => t && (!e || nt(t) > nt(e)) ? t : e, {});
}
function nt(s) {
  let e = 0;
  if (s === null)
    return 0;
  for (const t in s)
    s[t] && ++e;
  return e;
}
const ya = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  process: ba
}, Symbol.toStringTag, { value: "Module" }));
function Sa(s) {
  for (const e of X.BASE_FIELDS) {
    const t = s.processed[e];
    typeof t == "string" && t && (s.processed[e] = t.normalize(), s.noRegex[e] = t.normalize());
  }
}
const ja = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  process: Sa
}, Symbol.toStringTag, { value: "Module" })), Me = (s) => ({
  isGlobal: s.isGlobal,
  isCaseInsensitive: s.isCaseInsensitive,
  isRegexDisabled: s.isRegexDisabled
}), hs = (s) => s.replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&");
function fs(s) {
  let e = "";
  return s.isGlobal && (e += "g"), s.isCaseInsensitive && (e += "i"), e;
}
function Aa(s, e) {
  for (const [t, r] of Object.entries(s)) {
    const a = t;
    if (r !== null && e.flags.isRegexEditedByUser[a])
      return !0;
  }
  return !1;
}
function ka(s, e) {
  if (Aa(s.replace, e))
    return !1;
  const t = Me(s);
  for (const [r, a] of Object.entries(s.search)) {
    const n = ie(e, r);
    if (!bs(a, n, t))
      return !1;
  }
  return !0;
}
function bs(s, e, t) {
  if (s === null)
    return !0;
  const r = t.isRegexDisabled ? hs(s) : s;
  try {
    return new RegExp(
      t.isGlobal ? r : `^${r}$`,
      fs(t)
    ).test(e);
  } catch {
    return !1;
  }
}
function va(s, e, t, r) {
  if (s === null || e === null)
    return t;
  const a = r.isRegexDisabled ? hs(s) : s;
  try {
    const i = new RegExp(
      r.isGlobal ? a : `^${a}$`,
      fs(r)
    );
    return t.replace(i, e);
  } catch {
    return t;
  }
}
function Ra(s, e) {
  const t = Me(s);
  for (const r of Object.keys(e)) {
    const a = r;
    if (!bs(s.search[a], e[a], t))
      return e;
  }
  for (const r of Object.keys(e)) {
    const a = r;
    e[a] = va(
      s.search[a],
      s.replace[a],
      e[a],
      Me(s)
    );
  }
  return e;
}
function Ta(s) {
  return {
    track: ie(s, "track"),
    artist: ie(s, "artist"),
    album: ie(s, "album"),
    albumArtist: ie(s, "albumArtist")
  };
}
function Ea(s, e) {
  const t = Ra(s, Ta(e));
  for (const [r, a] of Object.entries(t)) {
    const i = r;
    s.search[i] && typeof s.replace[i] == "string" && (e.flags.isRegexEditedByUser[i] = !0, e.processed[i] = a);
  }
}
function Ia(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function ie(s, e) {
  return s[`get${Ia(e)}`]() ?? "";
}
class xa extends Ye {
  /**
   * Apply regex edits to a given song object.
   *
   * @param song - Song instance
   */
  async loadSongInfo(e) {
    const t = await this.getRegexEditStorage();
    if (t)
      for (let r = t.length - 1; r >= 0; r--)
        ka(t[r], e) && Ea(t[r], e);
  }
  /**
   * Save custom regex edit to the storage.
   *
   * @param search - Search to save
   * @param replace - Replace to save
   */
  async saveRegexEdit(e) {
    e.search = {
      ...e.search
    }, e.replace = {
      ...e.replace
    };
    const t = await this.getRegexEditStorage();
    if (t === null) {
      await this.saveRegexEditToStorage([e]);
      return;
    }
    const r = [...t, e];
    await this.saveRegexEditToStorage(r);
  }
  async deleteRegexEdit(e) {
    const t = await this.getRegexEditStorage();
    t !== null && (t.splice(e, 1), await this.saveRegexEditToStorage(t));
  }
}
class Ca extends xa {
  regexEditStorage = this.getStorage();
  init() {
    this._init(oe(Pe));
  }
  /** @override */
  async getRegexEditStorage() {
    return this.regexEditStorage.get();
  }
  /** @override */
  async saveRegexEditToStorage(e) {
    return await this.regexEditStorage.set(e);
  }
  /** @override */
  getStorage() {
    return I(Pe);
  }
}
const ps = new Ca();
async function Pa(s) {
  if (!s.flags.isCorrectedByUser)
    try {
      await ps.loadSongInfo(s);
    } catch (e) {
      y(e, "error");
    }
}
const lt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  process: Pa
}, Symbol.toStringTag, { value: "Module" })), ws = 5e3;
async function La(s) {
  if (s.parsed.trackArt) {
    y("Using local/parsed artwork");
    return;
  } else if (s.metadata.trackArtUrl) {
    y("Found album artwork via LastFM");
    return;
  } else if (s.isEmpty())
    return;
  const e = ["release", "release-group"];
  for (const t of e) {
    let r = s.metadata.albumMbId, a = null;
    try {
      r || (r = await Oa(t, s)), a = await Ua(r);
    } catch {
      continue;
    }
    if (a) {
      y("Found album artwork via MusicBrainz"), s.metadata.trackArtUrl = a;
      return;
    }
  }
}
async function Oa(s, e) {
  const t = e.getArtist(), r = e.getTrack();
  if (t === null || r === null)
    throw new TypeError("artist or track is null");
  const a = `https://musicbrainz.org/ws/2/${s}?fmt=json&query=title:+"${r ?? ""}"^3 ${r ?? ""} artistname:+"${t ?? ""}"^4${t ?? ""}`, i = await M(ws, fetch(a));
  if (!i.ok)
    throw new Error("Unable to fetch MusicBrainz ID");
  const n = await i.json();
  if (n.count === 0)
    throw new Error("Unable to fetch MusicBrainz ID");
  return "releases" in n ? n.releases[0].id : "release-groups" in n ? n["release-groups"][0].id : "";
}
async function Ua(s) {
  const e = `https://coverartarchive.org/release/${s}/front-500`;
  if ((await M(
    ws,
    fetch(e, { method: "HEAD" })
  )).ok)
    return e;
  throw new Error("Unable to fetch cover art from MusicBrainz");
}
const _a = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  process: La
}, Symbol.toStringTag, { value: "Module" }));
let Ma = class {
  storage = I(vt);
  isReady;
  constructor() {
    this.isReady = this.init();
  }
  /**
   * Sets default values to blocklist if necessary
   */
  async setupDefaultBlocklist() {
    let e = await this.storage.getLocking();
    e || (e = {}), await this.storage.setLocking(e);
  }
  /**
   * Initializes the blocklist with default values
   */
  async init() {
    return await this.setupDefaultBlocklist(), !0;
  }
  /**
   * Adds a set of tags to blocklist
   *
   * @param type - type of tag to block
   * @param song - song to add
   */
  async addToBlocklist(e, t) {
    if (!t)
      return;
    await this.isReady;
    const r = await this.storage.getLocking(), a = t.getArtist(), i = t.getTrack();
    if (!r || !a || !i) {
      this.storage.unlock();
      return;
    }
    switch (r[a] || (r[a] = {
      tracks: {},
      albums: {}
    }), e) {
      case "artist": {
        r[a].disabled = !0;
        break;
      }
      case "album": {
        const n = t.getAlbum(), h = t.getAlbumArtist() || a;
        if (!n) {
          this.storage.unlock();
          return;
        }
        r[h] || (r[h] = {
          tracks: {},
          albums: {}
        }), r[h].albums[n] = !0;
        break;
      }
      case "track": {
        r[a].tracks[i] = !0;
        break;
      }
    }
    await this.storage.setLocking(r);
  }
  /**
   * Removes a set of tags from blocklist
   *
   * @param tags - Tags to remove
   */
  async removeFromBlocklist(e, t) {
    if (!t)
      return;
    const r = t.getArtist(), a = t.getTrack();
    if (!r || !a)
      return;
    const i = await this.storage.getLocking();
    if (!i) {
      this.storage.unlock();
      return;
    }
    switch (e) {
      case "artist": {
        delete i[r]?.disabled;
        break;
      }
      case "album": {
        const n = t.getAlbumArtist() || r, h = t.getAlbum();
        if (!h)
          return;
        delete i[n]?.albums[h];
        break;
      }
      case "track": {
        delete i[r]?.tracks[a];
        break;
      }
    }
    await this.storage.setLocking(i);
  }
  /**
   * @param song - song to check
   * @returns object of booleans saying whether each tag type is blocked for the song.
   */
  async getBlockedTypes(e) {
    const t = {
      artist: !1,
      album: !1,
      track: !1
    };
    if (!e)
      return t;
    await this.isReady;
    const r = await this.storage.get(), a = e.getArtist(), i = e.getTrack();
    if (!r || !a || !r[a] || !i)
      return t;
    r[a].disabled && (t.artist = !0), r[a].tracks[i] && (t.track = !0);
    const n = e.getAlbumArtist() || a, h = e.getAlbum();
    return !h || !r[n]?.albums[h] || (t.album = !0), t;
  }
  /**
   * @param song - song to check
   *
   * @returns true if song is blocklisted; false if it isn't
   */
  async hasBlockedTag(e) {
    const t = await this.getBlockedTypes(e);
    return t.artist || t.album || t.track;
  }
};
async function Da(s) {
  const e = new Ma();
  try {
    s.flags.hasBlockedTag = await e.hasBlockedTag(s);
  } catch (t) {
    y(t, "error");
  }
}
const Fa = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  process: Da
}, Symbol.toStringTag, { value: "Module" }));
class Na {
  song = null;
  processors = [
    ga,
    ja,
    da,
    lt,
    ya,
    lt,
    // Run regex edits again, as the regex edit might have caused an album to be found.
    Fa,
    _a
  ];
  constructor() {
    this.song = null;
  }
  async process(e, t) {
    this.song = e, this.song.flags.finishedProcessing = !1;
    try {
      for (const r of this.processors)
        await r.process(e, t);
      this.song.flags.finishedProcessing = !0;
    } catch (r) {
      throw this.song.flags.finishedProcessing = !0, r;
    }
    return e.equals(this.song);
  }
}
const ct = "ControllerReset", xe = "SongNowPlaying", ut = "SongUnrecognized";
class Ba extends Ye {
  MAX_SCROBBLE_CACHE_SIZE = 1e3;
  /**
   * Replace the data for a scrobble in the scrobble cache
   *
   * @param id - ID of the scrobble to modify
   * @param scrobble - data to replace it with
   */
  async replaceScrobble(e, t) {
    const r = await this.getScrobbleCacheStorageLocking();
    if (r) {
      for (let a = 0; a < r.length; a++)
        r[a].id === e && (r[a] = {
          ...t,
          id: e
        });
      await this.saveScrobbleCacheToStorageLocking(r);
    }
  }
  /**
   * Save scrobble to the storage.
   *
   * @param scrobble - {@link CacheScrobbleData} to save
   *
   * @returns the id of the new scrobble
   */
  async pushScrobble(e) {
    const t = await this.getScrobbleCacheStorageLocking();
    if (t === null)
      return await this.saveScrobbleCacheToStorageLocking([
        {
          ...e,
          id: 1
        }
      ]), 1;
    const r = (t.at(-1)?.id ?? 0) + 1;
    return t.push({
      ...e,
      id: r
    }), await this.saveScrobbleCacheToStorageLocking(
      t.slice(-this.MAX_SCROBBLE_CACHE_SIZE)
    ), r;
  }
  async deleteScrobbles(e) {
    const t = await this.getScrobbleCacheStorageLocking();
    if (!t)
      return;
    const r = /* @__PURE__ */ new Map();
    for (const a of e)
      r.set(a, !0);
    await this.saveScrobbleCacheToStorageLocking(
      t.filter((a) => r.get(a.id) !== !0)
    );
  }
}
class za extends Ba {
  scrobbleCacheStorage = this.getStorage();
  init() {
    this._init(
      oe(Le)
    );
  }
  /** @override */
  async getScrobbleCacheStorage() {
    return this.scrobbleCacheStorage.get();
  }
  /** @override */
  async getScrobbleCacheStorageLocking() {
    return this.scrobbleCacheStorage.getLocking();
  }
  /** @override */
  async saveScrobbleCacheToStorage(e) {
    return await this.scrobbleCacheStorage.set(e);
  }
  /** @override */
  async saveScrobbleCacheToStorageLocking(e) {
    return await this.scrobbleCacheStorage.setLocking(e);
  }
  /** @override */
  getStorage() {
    return I(Le);
  }
}
const Se = new za();
class $a {
  storage = I(Rt);
  connectorId;
  isReady;
  constructor(e) {
    this.connectorId = e, this.isReady = this.init();
  }
  /**
   * Sets default values to blocklist if necessary
   */
  async setupDefaultBlocklist() {
    let e = await this.storage.getLocking();
    e || (e = {}), (!(this.connectorId in e) || !e[this.connectorId]) && (e[this.connectorId] = {}), await this.storage.setLocking(e);
  }
  /**
   * Initializes the blocklist with default values
   */
  async init() {
    return await this.setupDefaultBlocklist(), !0;
  }
  /**
   * Adds a channel ID to blocklist
   *
   * @param id - ID of channel to add
   */
  async addToBlocklist(e) {
    if (!e?.id)
      return;
    await this.isReady;
    const t = await this.storage.getLocking();
    if (!t || !(this.connectorId in t) || !t[this.connectorId]) {
      this.storage.unlock();
      return;
    }
    t[this.connectorId] = {
      ...t[this.connectorId],
      [e.id]: e.label || e.id
    }, await this.storage.setLocking(t);
  }
  /**
   * Removes a channel ID from blocklist
   *
   * @param id - ID of channel to remove
   */
  async removeFromBlocklist(e) {
    if (!e)
      return;
    await this.isReady;
    const t = await this.storage.getLocking();
    if (!t || !(this.connectorId in t) || !t[this.connectorId]) {
      this.storage.unlock();
      return;
    }
    delete t[this.connectorId][e], this.storage.setLocking(t);
  }
  /**
   * @param id - ID of channel to check
   *
   * @returns label if channel is blocklisted; null if it isn't
   */
  async getChannelLabel(e) {
    if (!e)
      return null;
    await this.isReady;
    const t = await this.storage.get();
    return !t || !(this.connectorId in t) || !t[this.connectorId] ? null : t[this.connectorId][e];
  }
  /**
   * @param id - ID of channel to check
   *
   * @returns true if channel isn't blocklisted; false if it is.
   */
  async shouldScrobbleChannel(e) {
    return !await this.getChannelLabel(e);
  }
}
const qa = ["artist", "track", "album", "uniqueID"], dt = I(Be);
class Ha {
  connector;
  isEnabled;
  mode;
  tempMode;
  timeoutId = void 0;
  pipeline = new Na();
  playbackTimer = new it();
  replayDetectionTimer = new it();
  currentSong = null;
  isReplayingSong = !1;
  shouldScrobblePodcasts = !0;
  scrobbleCacheId = null;
  blocklist;
  isPaused = !1;
  forceScrobble = !1;
  shouldHaveScrobbled = !1;
  isEditing = !1;
  setNotEditingTimeout = setTimeout(() => {
  }, 0);
  eventEmitter = new St();
  tabId = v({
    type: "getTabId",
    payload: void 0
  });
  /**
   * Mutates this.currentSong to sync disallowed reason, and returns whether song should scrobble
   *
   * @returns true if song should scrobble; false if disallowed.
   */
  async shouldScrobble() {
    return this.forceScrobble ? !0 : !this.currentSong || this.currentSong.parsed.scrobblingDisallowedReason ? !1 : await this.blocklist.shouldScrobbleChannel(
      this.connector.getChannelId?.()
    ) ? this.currentSong?.flags.hasBlockedTag ? (this.currentSong.parsed.scrobblingDisallowedReason = "ForbiddenTag", !1) : !0 : (this.currentSong.parsed.scrobblingDisallowedReason = "ForbiddenChannel", !1);
  }
  /**
   * Function that handles updating the scrobble info box
   */
  async getInfoBoxElement() {
    if (!this.connector.scrobbleInfoLocationSelector || // infobox is disabled in options
    !await B(
      He,
      this.connector.meta.id
    ))
      return null;
    const e = document.querySelector(
      this.connector.scrobbleInfoLocationSelector
    );
    if (!e)
      return null;
    let t = document.querySelector(
      "#scrobbler-infobox-el"
    );
    if (t)
      if (t.parentElement !== e)
        t.remove();
      else
        return t;
    t = document.createElement("div"), t.setAttribute("id", "scrobbler-infobox-el");
    for (const r in this.connector.scrobbleInfoStyle)
      t.style[r] = this.connector.scrobbleInfoStyle[r] ?? "";
    return e.appendChild(t), t;
  }
  async updateInfoBox() {
    let e = !1;
    const t = await this.getInfoBoxElement();
    if (!t) {
      const n = document.querySelector(
        "#scrobbler-infobox-el"
      );
      n && n.remove();
      return;
    }
    const r = t.querySelector("span");
    r && (e = r.innerText);
    const a = this.getMode(), i = Util.getInfoBoxText(a, this.currentSong);
    if (!e || i !== e) {
      const n = document.createElement("img");
      n.setAttribute(
        "src",
        T.runtime.getURL("./icons/icon_main_48.png")
      ), n.setAttribute("alt", "Web Scrobbler state:"), n.setAttribute("style", "height: 1.2em");
      const h = document.createElement("span");
      for (h.innerText = i; t.firstChild; )
        t.removeChild(t.firstChild);
      t.appendChild(n), t.appendChild(h);
    }
  }
  /**
   * @param tabId - Tab ID
   * @param connector - Connector match object
   * @param isEnabled - Flag indicates initial stage
   */
  constructor(e, t) {
    this.connector = e, this.blocklist = new $a(this.connector.meta.id), this.isEnabled = t, this.mode = t ? he : rt, this.onModeChanged(), this.tempMode = null, B(Ve, e.meta.id).then((r) => {
      typeof r == "boolean" && (this.shouldScrobblePodcasts = r);
    }).catch((r) => {
      y(r, "error");
    }), this.debugLog(
      `Created controller for ${e.meta.label} connector`
    ), Ir(
      x({
        type: "skipCurrentSong",
        fn: () => {
          this.skipCurrentSong();
        }
      }),
      x({
        type: "toggleLove",
        fn: ({ isLoved: r, shouldShowNotification: a }) => {
          this.toggleLove(r, a);
        }
      }),
      x({
        type: "updateLove",
        fn: ({ isLoved: r }) => {
          this.currentSong?.setLoveStatus(r, !0);
        }
      }),
      x({
        type: "reprocessSong",
        fn: () => {
          this.reprocessSong();
        }
      }),
      x({
        type: "setEditState",
        fn: (r) => {
          this.isEditing = r, this.eventEmitter.emit("updateEditStatus", r), r && (clearTimeout(this.setNotEditingTimeout), this.setNotEditingTimeout = setTimeout(() => {
            this.isEditing = !1, this.eventEmitter.emit("updateEditStatus", !1);
          }, 5e3));
        }
      }),
      x({
        type: "resetData",
        fn: () => {
          this.resetSongData();
        }
      }),
      x({
        type: "setConnectorState",
        fn: (r) => {
          this.setConnectorState(r);
        }
      }),
      x({
        type: "disableConnectorUntilTabIsClosed",
        fn: () => this.disableUntilTabIsClosed()
      }),
      x({
        type: "getConnectorDetails",
        fn: () => ({
          mode: this.getMode(),
          permanentMode: this.mode,
          song: this.currentSong?.getCloneableData() ?? null
        })
      }),
      x({
        type: "forceScrobbleSong",
        fn: () => {
          this.forceScrobble = !0, this.shouldHaveScrobbled ? this.scrobbleSong() : this.setSongNowPlaying();
        }
      }),
      x({
        type: "getChannelDetails",
        fn: () => ({
          connector: this.connector.meta,
          channelInfo: this.connector.getChannelInfo?.()
        })
      }),
      x({
        type: "addToBlocklist",
        fn: async () => {
          await this.blocklist.addToBlocklist(
            this.connector.getChannelInfo?.() ?? null
          ), this.setMode(Y);
        }
      }),
      x({
        type: "removeFromBlocklist",
        fn: async () => {
          await this.blocklist.removeFromBlocklist(
            this.connector.getChannelInfo?.()?.id ?? null
          ), this.shouldHaveScrobbled ? this.scrobbleSong() : this.setSongNowPlaying();
        }
      })
    );
  }
  /** Listeners. */
  /**
   * Called if current song is updated.
   */
  onSongUpdated() {
    this.updateInfoBox(), v({
      type: "songUpdate",
      payload: this.currentSong?.getCloneableData() ?? null
    });
  }
  /**
   * Called if a controller mode is changed.
   */
  onModeChanged() {
    this.updateInfoBox(), v({
      type: "controllerModeChange",
      payload: {
        mode: this.getMode(),
        permanentMode: this.mode
      }
    });
  }
  /**
   * Called if a new event is dispatched.
   *
   * @param event - Event generated by the controller.
   */
  async onControllerEvent(e) {
    switch (e) {
      case xe: {
        const t = this.getCurrentSong();
        if (!t || t.flags.isReplaying || !await this.shouldScrobble() || !this.currentSong?.isValid() || !await this.tabId)
          break;
        v({
          type: "showNowPlaying",
          payload: {
            song: t.getCloneableData(),
            connector: this.connector.meta
          }
        });
        break;
      }
      case ct: {
        const t = this.getCurrentSong();
        t && v({
          type: "clearNowPlaying",
          payload: {
            song: t.getCloneableData()
          }
        });
        break;
      }
      case ut: {
        const t = this.getCurrentSong();
        if (!t || !await this.shouldScrobble() || !await this.tabId)
          break;
        v({
          type: "showSongNotRecognized",
          payload: {
            song: t.getCloneableData(),
            connector: this.connector.meta
          }
        });
        break;
      }
    }
    this.updateInfoBox();
  }
  /** Public functions */
  /**
   * Switch the state of controller.
   * @param flag - True means enabled and vice versa
   */
  setEnabled(e) {
    this.isEnabled = e, e ? this.setMode(he) : (this.resetState(), this.setMode(rt));
  }
  /**
   * Do finalization before unloading controller.
   */
  finish() {
    this.debugLog(
      `Remove controller for ${this.connector.meta.label} connector`
    ), this.resetState();
  }
  /**
   * Reset song data and process it again.
   */
  async resetSongData() {
    this.assertSongIsPlaying(), this.currentSong?.resetInfo(), await je.removeSongInfo(this.currentSong), this.unprocessSong(), this.processSong();
  }
  /**
   * Make the controller to ignore current song.
   */
  skipCurrentSong() {
    this.assertSongIsPlaying(), E(this.currentSong) && (this.setMode(Rr), this.currentSong.flags.isSkipped = !0, this.shouldHaveScrobbled = !1, this.forceScrobble = !1, this.playbackTimer.reset(), this.replayDetectionTimer.reset(), this.onSongUpdated());
  }
  /**
   * Get connector match object.
   * @returns Connector
   */
  getConnector() {
    return this.connector.meta;
  }
  /**
   * Get current song as plain object.
   * @returns Song copy
   */
  getCurrentSong() {
    return this.currentSong;
  }
  /**
   * Get current controller mode.
   * @returns Controller mode
   */
  getMode() {
    const e = [
      Re,
      Te
    ];
    return this.tempMode !== null ? this.tempMode : e.includes(this.mode) && this.isPaused ? vr : this.mode;
  }
  /**
   * Sets data for current song from user input
   * @param data - Object containing song data
   */
  async setUserSongData(e) {
    if (this.assertSongIsPlaying(), !!E(this.currentSong)) {
      if (this.currentSong.flags.isScrobbled)
        throw new Error("Unable to set user data for scrobbled song");
      await je.saveSongInfo(this.currentSong, e), this.unprocessSong(), this.processSong();
    }
  }
  /**
   * Reprocess currently playing song without otherwise changing it.
   */
  reprocessSong() {
    this.assertSongIsPlaying(), E(this.currentSong) && (this.unprocessSong(), this.processSong());
  }
  /**
   * Send request to love or unlove current song.
   * @param isLoved - Flag indicated song is loved
   * @param shouldShowNotification - Flag indicating that a notification should show up
   */
  async toggleLove(e, t) {
    if (this.assertSongIsPlaying(), !!E(this.currentSong)) {
      if (!this.currentSong.isValid())
        throw new Error("No valid song is now playing");
      this.currentSong.setLoveStatus(e, !0), this.onSongUpdated();
      try {
        e ? this.setTempMode(Tr) : this.setTempMode(Er), await v({
          type: "toggleLove",
          payload: {
            song: this.currentSong.getCloneableData(),
            isLoved: e,
            shouldShowNotification: t
          }
        });
      } catch {
        this.currentSong.setLoveStatus(!e, !0);
      }
      this.onSongUpdated();
    }
  }
  /**
   * React on love/unlove.
   * @param isLoved - Whether song is now liked or unliked
   */
  async onLoveChanged(e) {
    if (!(!this.currentSong || ![
      Re,
      Te
    ].includes(this.mode))) {
      if (this.currentSong.flags.isLovedInService === null) {
        this.currentSong.flags.isLovedInService = e;
        return;
      }
      if (e === null) {
        this.currentSong.flags.isLovedInService = null;
        return;
      }
      if (this.currentSong.flags.isLovedInService !== e && (this.currentSong.flags.isLovedInService = e, await B(
        Ge,
        this.connector.meta.id
      ))) {
        if (
          // do not show notification if:
          // 1. song is already loved and is being toggled to love status
          // 2. song is already unloved and is being toggled to unlove status
          this.currentSong.metadata.userloved === !0 && e || this.currentSong.metadata.userloved === !1 && !e
        )
          return;
        this.toggleLove(e, !0);
      }
    }
  }
  /**
   * React on state change.
   * @param newState - State of connector
   */
  onStateChanged(e) {
    if (!this.isEnabled)
      return;
    if (Va(e)) {
      this.currentSong && (this.debugLog("Received empty state - resetting"), this.reset()), e.isPlaying && this.debugLog(
        `State from connector doesn't contain enough information about the playing track: ${mt(
          e
        )}`,
        "warn"
      );
      return;
    }
    this.isSongChanged(e) || this.isReplayingSong ? e.isPlaying ? this.processNewState(e) : this.reset() : this.processCurrentState(e);
  }
  /** Internal functions */
  /**
   * Set the mode of the controller
   *
   * @param mode - new controller mode
   */
  setMode(e) {
    if (!e)
      throw new Error(`Unknown mode: ${e}`);
    this.mode = e, this.onModeChanged();
  }
  /**
   * Checks if the temp icon/mode is visible.
   */
  isTempIconVisible() {
    return this.timeoutId !== void 0;
  }
  /**
   * Temporarily set the mode of the controller,
   * then returns to previous mode after 5 seconds.
   *
   * @param newMode - new controller mode to be set
   *
   */
  setTempMode(e) {
    this.isTempIconVisible() && (clearTimeout(this.timeoutId), this.timeoutId = void 0);
    const t = 5e3;
    this.tempMode = e, this.onModeChanged(), this.timeoutId = setTimeout(() => {
      this.timeoutId = void 0, this.tempMode = null, this.onModeChanged();
    }, t);
  }
  dispatchEvent(e) {
    if (!e)
      throw new Error(`Unknown event: ${e}`);
    this.onControllerEvent(e);
  }
  /**
   * Process connector state as new one.
   * @param newState - Connector state
   */
  processNewState(e) {
    if (this.isPaused = !1, this.resetState(), this.currentSong = new X(e, this.connector.meta), this.currentSong.flags.isReplaying = this.isReplayingSong, this.debugLog(
      `New song detected: ${mt(
        e
      )}`
    ), !this.shouldScrobblePodcasts && e.isPodcast) {
      this.skipCurrentSong();
      return;
    }
    this.playbackTimer.start(() => {
      this.scrobbleSong();
    }), this.replayDetectionTimer.start(() => {
      this.debugLog("Replaying song..."), this.isReplayingSong = !0;
    }), e.isPlaying || this.setPaused(), this.processSong(), this.isReplayingSong = !1;
  }
  /**
   * Process connector state as current one.
   * @param newState - Connector state
   */
  async processCurrentState(e) {
    if (!E(this.currentSong) || this.currentSong.flags.isSkipped)
      return;
    const {
      currentTime: t,
      isPlaying: r,
      trackArt: a,
      duration: i,
      scrobblingDisallowedReason: n
    } = e, h = this.currentSong.parsed.isPlaying !== r;
    this.currentSong.parsed.currentTime = t, this.currentSong.parsed.isPlaying = r, this.currentSong.parsed.trackArt = a, this.currentSong.parsed.scrobblingDisallowedReason = n, this.isNeedToUpdateDuration(e) && i && this.updateSongDuration(i), h && r !== void 0 ? this.onPlayingStateChanged(r) : this.mode === Y && await this.shouldScrobble() && r && this.setSongNowPlaying();
  }
  /**
   * Reset controller state.
   */
  resetState() {
    this.dispatchEvent(ct), this.playbackTimer.reset(), this.replayDetectionTimer.reset(), this.shouldHaveScrobbled = !1, this.forceScrobble = !1, this.currentSong = null;
  }
  /**
   * Process song using pipeline module.
   */
  async processSong() {
    E(this.currentSong) && (this.shouldHaveScrobbled = !1, this.forceScrobble = !1, await this.shouldScrobble() ? this.setMode(at) : this.setMode(Y), await this.pipeline.process(
      this.currentSong,
      this.connector.meta
    ) && (this.debugLog(
      `Song finished processing: ${this.currentSong.toString()}`
    ), this.currentSong.flags.isMarkedAsPlaying = !1, await this.updateTimers(this.currentSong.getDuration()), this.currentSong.isValid() ? await this.shouldScrobble() ? this.currentSong.parsed.isPlaying ? await this.shouldScrobble() ? this.currentSong.parsed.isPlaying ? this.playbackTimer.isExpired() ? this.dispatchEvent(xe) : this.setSongNowPlaying() : this.setMode(he) : this.setMode(Y) : this.setSongNotRecognized() : this.setMode(Y) : this.setSongNotRecognized(), this.onSongUpdated()));
  }
  /**
   * Called when song was already flagged as processed, but now is
   * entering the pipeline again.
   */
  unprocessSong() {
    E(this.currentSong) && (this.debugLog(`Song unprocessed: ${this.currentSong.toString()}`), this.debugLog("Clearing playback timer destination time"), this.currentSong.resetData(), this.shouldHaveScrobbled = !1, this.forceScrobble = !1, this.playbackTimer.update(null), this.replayDetectionTimer.update(null));
  }
  /**
   * Called when playing state is changed.
   * @param value - New playing state
   */
  async onPlayingStateChanged(e) {
    if (this.debugLog(`isPlaying state changed to ${String(e)}`), e && this.currentSong) {
      this.setResumedPlaying(), this.playbackTimer.resume(), this.replayDetectionTimer.resume();
      const { isMarkedAsPlaying: t } = this.currentSong.flags;
      !t && this.currentSong.isValid() && await this.shouldScrobble() ? this.setSongNowPlaying() : this.onModeChanged();
    } else
      this.setPaused();
  }
  /**
   * Check if song is changed by given connector state.
   * @param newState - Connector state
   * @returns Check result
   */
  isSongChanged(e) {
    if (!E(this.currentSong))
      return !0;
    for (const t of qa)
      if (t in e && t in this.currentSong.parsed && // @ts-expect-error We check that the fields exist, TS is just being difficult.
      e[t] !== this.currentSong.parsed[t])
        return !0;
    return !1;
  }
  /**
   * Check if song duration should be updated.
   * @param newState - Connector state
   * @returns Check result
   */
  isNeedToUpdateDuration(e) {
    return !!e.duration && this.currentSong?.parsed.duration !== e.duration;
  }
  /**
   * Update song duration value.
   * @param duration - Duration in seconds
   */
  updateSongDuration(e) {
    E(this.currentSong) && (this.debugLog(`Update duration: ${e}`), this.currentSong.parsed.duration = e, this.updateTimers(e));
  }
  /**
   * Update internal timers.
   * @param duration - Song duration in seconds
   */
  async updateTimers(e) {
    if (this.playbackTimer.isExpired()) {
      this.debugLog("Attempt to update expired timers", "warn");
      return;
    }
    const t = await B(
      cs,
      this.connector.meta.id
    ), r = Ps(t), a = Ls(e, r);
    if (a !== -1) {
      this.playbackTimer.update(a), this.replayDetectionTimer.update(e);
      const i = this.playbackTimer.getRemainingSeconds();
      this.debugLog(
        `The song will be scrobbled in ${i ?? -999} seconds`
      ), this.debugLog(`The song will be repeated in ${e} seconds`);
    } else
      this.debugLog("The song is too short to scrobble");
  }
  /**
   * Contains all actions to be done when song is ready to be marked as
   * now playing.
   */
  async setSongNowPlaying() {
    if (!E(this.currentSong) || !this.currentSong.isValid() || !await this.shouldScrobble())
      return;
    if (!this.currentSong.flags.finishedProcessing) {
      this.debugLog("Song set as loading"), this.setMode(at);
      return;
    }
    this.currentSong.flags.isMarkedAsPlaying = !0;
    const e = await v({
      type: "setNowPlaying",
      payload: {
        song: this.currentSong.getCloneableData()
      }
    });
    et(e, f.RESULT_OK) ? (this.debugLog("Song set as now playing"), this.setMode(Re)) : (this.debugLog("Song isn't set as now playing"), this.setMode(_e)), this.dispatchEvent(xe);
  }
  async setPaused() {
    this.playbackTimer.pause(), this.replayDetectionTimer.pause(), !(!E(this.currentSong) || !this.currentSong.isValid() || !await this.shouldScrobble()) && (this.isPaused = !0, this.onModeChanged(), await v({
      type: "setPaused",
      payload: {
        song: this.currentSong.getCloneableData()
      }
    }));
  }
  async setResumedPlaying() {
    this.isPaused = !1, !(!E(this.currentSong) || !this.currentSong.isValid() || !await this.shouldScrobble()) && (this.onModeChanged(), await v({
      type: "setResumedPlaying",
      payload: {
        song: this.currentSong.getCloneableData()
      }
    }));
  }
  /**
   * Notify user that song it not recognized by the extension.
   */
  setSongNotRecognized() {
    this.setMode(Ft), this.dispatchEvent(ut);
  }
  /**
   * Enable or disable a connector
   *
   * @param isEnabled - Whether to enable or disable connector.
   */
  setConnectorState(e) {
    this.setEnabled(e), ia(this.getConnector(), e);
  }
  /**
   * Disable connector until tab is closed
   */
  async disableUntilTabIsClosed() {
    const e = await dt.get(), t = await this.tabId;
    dt.set({
      ...e,
      [t ?? -1]: {
        ...e?.[t ?? -1] ?? {},
        [this.connector.meta.id]: !0
      }
    }), this.setEnabled(!1);
  }
  /**
   * Tries to save failed scrobble due to disallowed/unrecognized.
   *
   * @returns true if scrobble is failed; false if should scrobble
   */
  async saveFailedScrobble() {
    return E(this.currentSong) ? await this.shouldScrobble() ? this.currentSong.isValid() ? !1 : (this.scrobbleCacheId = await Se.pushScrobble({
      song: this.currentSong.getCloneableData(),
      status: Ce.INVALID
    }), this.shouldHaveScrobbled = !0, !0) : (this.scrobbleCacheId = await Se.pushScrobble({
      song: this.currentSong.getCloneableData(),
      status: Ce.DISALLOWED
    }), this.shouldHaveScrobbled = !0, !0) : !0;
  }
  /**
   * Called when scrobble timer triggers.
   * The time should be set only after the song is validated and ready
   * to be scrobbled.
   */
  async scrobbleSong() {
    if (!E(this.currentSong) || await this.saveFailedScrobble())
      return;
    this.scrobbleCacheId && (Se.deleteScrobbles([this.scrobbleCacheId]), this.scrobbleCacheId = null), this.isEditing && await new Promise((t) => {
      const r = (a) => {
        a || (this.eventEmitter.off("updateEditStatus", r), t(!0));
      };
      this.eventEmitter.on("updateEditStatus", r);
    });
    const e = await v({
      type: "scrobble",
      payload: {
        songs: [this.currentSong.getCloneableData()],
        currentlyPlaying: !0
      }
    });
    et(e[0], f.RESULT_OK) ? (this.debugLog("Scrobbled successfully"), this.currentSong.flags.isScrobbled = !0, this.setMode(Te), this.onSongUpdated()) : Us(e[0], f.RESULT_IGNORE) ? (this.debugLog("Song is ignored by service"), this.setMode(kr)) : (this.debugLog("Scrobbling failed", "warn"), this.setMode(_e));
  }
  /**
   * Reset the state of the connector, removing currently playing song if there is one.
   */
  reset() {
    this.resetState(), this.setMode(he);
  }
  /**
   * Assert whether there is a song playing right now
   */
  assertSongIsPlaying() {
    if (!this.currentSong)
      throw new Error("No song is now playing");
  }
  /**
   * Print debug message prefixed with controller.
   * @param text - Debug message
   * @param logType - Log type
   */
  debugLog(e, t = "log") {
    const r = `Controller: ${e}`;
    y(r, t);
  }
}
function Va(s) {
  return !(s.artist && s.track) && !s.uniqueID && !s.duration;
}
function mt(s) {
  return JSON.stringify(s, null, 2);
}
function E(s) {
  return !!s;
}
function Ga() {
  if (window.STARTER_LOADED) {
    y("Starter is already loaded", "warn");
    return;
  }
  if (Ka()) {
    y(
      "You have overwritten or unset the Connector object",
      "warn"
    );
    return;
  }
  Wa();
}
function Ka() {
  return typeof Connector > "u" || !(Connector instanceof as);
}
async function Wa() {
  const e = await I(Ne).get(), r = await I(
    Be
  ).get(), a = await v({
    type: "getTabId",
    payload: void 0
  });
  if (Ja(
    !r?.[a ?? -2]?.[Connector.meta.id] && (e === null || !e[G][Connector.meta.id])
  ), Connector.playerSelector === null) {
    y(
      "`Connector.playerSelector` is empty. The current connector is expected to manually detect state changes",
      "info"
    );
    return;
  }
  y("Setting up observer");
  const i = Ss();
  i !== null ? ys(i) : (y(
    `Element '${Connector.playerSelector.toString()}' is missing`,
    "warn"
  ), Ya());
}
function Ja(s) {
  const e = new Ha(Connector, s);
  Connector.controllerCallback = e.onStateChanged.bind(e), Connector.isLovedCallback = e.onLoveChanged.bind(e);
}
function ys(s) {
  const e = new MutationObserver(Connector.onStateChanged), t = {
    childList: !0,
    subtree: !0,
    attributes: !0,
    characterData: !0
  };
  e.observe(s, t), y(
    `Used '${Connector.playerSelector?.toString() ?? "errorPlayerSelectorNotDefined"}' to watch changes.`
  );
}
function Ya() {
  const s = new MutationObserver(() => {
    const t = Ss();
    t !== null && (s.disconnect(), ys(t), Connector.onStateChanged());
  }), e = {
    childList: !0,
    subtree: !0,
    attributes: !1,
    characterData: !1
  };
  s.observe(document, e);
}
function Ss() {
  if (Connector.playerSelector === null)
    return null;
  if (typeof Connector.playerSelector == "object") {
    for (const s of Connector.playerSelector) {
      const e = document.querySelector(s);
      if (e !== null)
        return e;
    }
    return null;
  }
  return document.querySelector(Connector.playerSelector);
}
class ne {
  storage;
  userApiUrl = null;
  userToken = null;
  arrayProperties = null;
  constructor() {
    this.storage = this.initStorage(), this.initUserProps(), Pr(
      Cr({
        type: "updateScrobblerProperties",
        fn: () => {
          this.initUserProps();
        }
      })
    );
  }
  /**
   * Get user property values.
   *
   * Each property is a property used internally in scrobblers.
   * Users can edit custom properties in the extension settings.
   */
  async getUserProperties() {
    const e = await this.storage.get();
    return !e || !("properties" in e) || !e.properties ? {} : e.properties;
  }
  /**
   * Apply user properties.
   *
   * Each property is a property used internally in scrobblers.
   * Users can edit custom properties in the extension settings.
   *
   * @param props - Object contains user properties
   */
  async applyUserProperties(e) {
    this.applyProps(e, this.getUserDefinedProperties());
    let t = await this.storage.get();
    if (t || (t = {}), !t) {
      _("No data in storage", "error");
      return;
    }
    if ((!("properties" in t) || t.properties === void 0) && (t.properties = {}), !("properties" in t) || t.properties === void 0) {
      _("No properties in storage", "error");
      return;
    }
    for (const r in e) {
      const a = e[r];
      a ? t.properties[r] = a : r in t.properties && delete t.properties[r];
    }
    await this.storage.set(t);
  }
  /**
   * Return a list of user-defined scrobbler properties.
   *
   * @returns a list of user-defined scrobbler properties.
   */
  getUserDefinedProperties() {
    return [];
  }
  /**
   * Return a list of user-defined scrobbler array properties.
   *
   * @returns a list of user-defined scrobbler array properties.
   */
  getUserDefinedArrayProperties() {
    return [];
  }
  /**
   * Get array property values
   *
   * Each property is a property used internally in scrobblers.
   * Users can add and remove custom array properties in the extension settings.
   */
  async getArrayProperties() {
    const e = await this.storage.get();
    return !e || !("arrayProperties" in e) || !e.arrayProperties ? [] : e.arrayProperties;
  }
  /**
   * Add array property values
   *
   * Each property is a property used internally in scrobblers.
   * Users can add and remove custom array properties in the extension settings.
   *
   * @param props - The properties to add to the array.
   */
  async addUserArrayProperties(e) {
    let t = await this.storage.get();
    if ((!t || !("arrayProperties" in t) || !t.arrayProperties) && (t = {
      arrayProperties: []
    }), !t || !("arrayProperties" in t) || !t.arrayProperties) {
      _("No data in storage", "error");
      return;
    }
    t.arrayProperties.push(e), this.applyArrayProps(
      t.arrayProperties,
      this.getUserDefinedArrayProperties()
    ), await this.storage.set(t);
  }
  /**
   * Apply array property values
   *
   * Replaces the property array with the one supplied in parameters.
   *
   * @param props - property values to apply
   */
  async applyUserArrayProperties(e) {
    let t = await this.storage.get();
    if ((!t || !("arrayProperties" in t) || !t.arrayProperties) && (t = {
      arrayProperties: []
    }), !t || !("arrayProperties" in t) || !t.arrayProperties) {
      _("No data in storage", "error");
      return;
    }
    t.arrayProperties = e, this.applyArrayProps(
      t.arrayProperties,
      this.getUserDefinedArrayProperties()
    ), await this.storage.set(t);
  }
  /**
   * Remove session info.
   */
  async signOut() {
    const e = await this.storage.get();
    if (!e) {
      _("No data in storage", "error");
      return;
    }
    "sessionID" in e && delete e.sessionID, "sessionName" in e && delete e.sessionName, "arrayProperties" in e && delete e.arrayProperties, await this.storage.set(e);
  }
  /**
   * Get URL to profile page.
   * @returns Profile URL
   */
  async getProfileUrl() {
    const { sessionName: e } = await this.getSession();
    return `${this.getBaseProfileUrl()}${e ?? "undefined"}`;
  }
  /** Scrobbler features. */
  /**
   * Check if service supports loving songs.
   * @returns True if service supports that; false otherwise
   */
  canLoveSong() {
    return !1;
  }
  /**
   * Check if service supports retrieving of song info.
   * @returns True if service supports that; false otherwise
   */
  canLoadSongInfo() {
    return !1;
  }
  /**
   * Apply filters over song object. Override if scrobbler requires custom global filtering.
   *
   * @param song - the song about to be dispatched
   * @returns updated song
   */
  applyFilter(e) {
    return e;
  }
  /** Constants */
  /**
   * Get timeout of all API requests in milliseconds.
   */
  get REQUEST_TIMEOUT() {
    return 15e3;
  }
  /** Misc */
  /**
   * Helper function to show debug output.
   * @param text - Debug message
   * @param logType - Log type
   */
  debugLog(e, t = "log") {
    const r = `${this.getLabel()}: ${e}`;
    _(r, t);
  }
  /** Internal functions */
  initStorage() {
    const e = ["token", "sessionID", "sessionName"];
    e.push(...this.getUserDefinedProperties());
    const t = Vs(this.getStorageName());
    return t.debugLog(e), t;
  }
  async initUserProps() {
    const e = await this.storage.get();
    if (e && "properties" in e)
      for (const t in e.properties)
        t === "userApiUrl" && "userApiUrl" in e.properties && (this.userApiUrl = e.properties.userApiUrl), t === "userToken" && "userToken" in e.properties && (this.userToken = e.properties.userToken);
    e && "arrayProperties" in e && (this.arrayProperties = e.arrayProperties ?? []);
  }
  applyProps(e, t) {
    for (const r in e) {
      if (!t.includes(r))
        throw new Error(`Unknown property: ${r}`);
      const a = e[r];
      if (a === void 0)
        throw new Error(`Property is not set: ${r}`);
      a && r in this ? this[r] = e[r] : r in this && delete this[r];
    }
  }
  applyArrayProps(e, t) {
    if (!e)
      throw new Error("No props passed to applyArrayProps()");
    if (e.length === 0) {
      this.arrayProperties = [];
      return;
    }
    for (const r of e)
      for (const [a, i] of Object.entries(r)) {
        if (!t.includes(a))
          throw new Error(`Unknown property: ${a}`);
        if (i === void 0)
          throw new Error(`Property is not set: ${a}`);
      }
    this.arrayProperties = e;
  }
}
class js extends ne {
  isLocalOnly = !1;
  /** @override */
  async getAuthUrl() {
    const e = {
      method: "auth.gettoken"
    };
    let t = null, r = await this.storage?.get();
    try {
      t = (await this.sendRequest(
        { method: "GET" },
        e,
        !1
      )).token;
    } catch {
      throw this.debugLog("Error acquiring a token", "warn"), new Error("Error acquiring a token");
    }
    return r || (r = { token: t }), r.token = t, "sessionID" in r && delete r.sessionID, "sessionName" in r && delete r.sessionName, await this.storage.set(r), `${this.getBaseAuthUrl()}?api_key=${this.getApiKey()}&token=${t || ""}`;
  }
  /** @override */
  async getSession() {
    const e = await this.storage.get();
    if (!e)
      throw new Error(f.ERROR_AUTH);
    if (!("token" in e)) {
      if (!("sessionID" in e))
        throw new Error(f.ERROR_AUTH);
      return {
        sessionID: e.sessionID ?? "undefined",
        sessionName: e.sessionName
      };
    }
    const t = e.token || null;
    if (t !== null)
      try {
        const r = await this.tradeTokenForSession(t);
        return delete e.token, e.sessionID = r.sessionID, e.sessionName = r.sessionName, await this.storage.set(e), r;
      } catch {
        throw this.debugLog("Failed to trade token for session", "warn"), await this.signOut(), new Error(f.ERROR_AUTH);
      }
    return {
      sessionID: e.sessionID,
      sessionName: e.sessionName
    };
  }
  /** @override */
  async isReadyForGrantAccess() {
    const e = await this.storage.get();
    return !e || !("token" in e) ? !1 : !!e.token;
  }
  /** @override */
  async sendNowPlaying(e) {
    const { sessionID: t } = await this.getSession(), r = {
      method: "track.updatenowplaying",
      track: e.getTrack(),
      artist: e.getArtist(),
      sk: t
    };
    e.getAlbum() && (r.album = e.getAlbum()), e.getAlbumArtist() && (r.albumArtist = e.getAlbumArtist()), e.getDuration() && (r.duration = `${e.getDuration() ?? ""}`);
    const a = await this.sendRequest({ method: "POST" }, r);
    return this.processResponse(a);
  }
  /** @override */
  async sendPaused() {
    return Promise.resolve(f.RESULT_OK);
  }
  /** @override */
  async sendResumedPlaying() {
    return Promise.resolve(f.RESULT_OK);
  }
  /** @override */
  async scrobble(e) {
    const { sessionID: t } = await this.getSession(), r = {
      method: "track.scrobble",
      sk: t
    };
    for (const [n, h] of e.slice(0, 50).entries())
      r[`timestamp[${n}]`] = h.metadata.startTimestamp.toString(), r[`track[${n}]`] = h.getTrack(), r[`artist[${n}]`] = h.getArtist(), h.getAlbum() && (r[`album[${n}]`] = h.getAlbum()), h.getAlbumArtist() && (r[`albumArtist[${n}]`] = h.getAlbumArtist());
    const a = await this.sendRequest(
      { method: "POST" },
      r
    ), i = this.processResponse(a);
    if (i === f.RESULT_OK) {
      const n = a.scrobbles;
      if (n) {
        const h = n["@attr"].ignored;
        if (Number(h) === 0)
          return new Array(
            Math.min(e.length, 50)
          ).fill(f.RESULT_OK);
        if (!Array.isArray(n.scrobble))
          return new Array(
            Math.min(e.length, 50)
          ).fill(f.RESULT_IGNORE);
        const w = {};
        for (const [k, P] of e.entries())
          w[P.metadata.startTimestamp.toString()] = k;
        const A = new Array(Math.min(e.length, 50));
        for (const k of n.scrobble)
          A[w[k.timestamp]] = k.ignoredMessage.code === "0" ? f.RESULT_OK : f.RESULT_IGNORE;
      } else
        return new Array(
          Math.min(e.length, 50)
        ).fill(f.ERROR_OTHER);
    }
    return new Array(Math.min(e.length, 50)).fill(
      i
    );
  }
  /** @override */
  async toggleLove(e, t) {
    const { sessionID: r } = await this.getSession(), a = {
      method: t ? "track.love" : "track.unlove",
      track: e.getTrack(),
      artist: e.getArtist(),
      sk: r
    }, i = await this.sendRequest({ method: "POST" }, a);
    return this.processResponse(i);
  }
  /** @override */
  canLoveSong() {
    return !0;
  }
  /** Internal functions. */
  /**
   * Execute asynchronous request.
   *
   * API key will be added to params by default and all parameters will be
   * encoded for use in query string internally.
   *
   * @param  options - Fetch options
   * @param  params - Object of key =\> value url parameters
   * @param  signed - Should the request be signed?
   * @returns Parsed response
   */
  async sendRequest(e, t, r = !0) {
    const a = this.makeRequestUrl(t, r), i = fetch(a, e), n = this.REQUEST_TIMEOUT;
    let h = null, w = null;
    try {
      h = await M(n, i), w = await h.json();
    } catch {
      throw new Error(f.ERROR_OTHER);
    }
    const A = JSON.stringify(w, null, 2), k = Qa(w, A);
    if (!h.ok)
      throw this.debugLog(`${t.method} response:
${k}`, "error"), "error" in w && w.error === 9 && (await this.signOut(), this.debugLog(
        "error 9 received, triggering signOut so that user grant access again."
      )), new Error(f.ERROR_OTHER);
    return this.debugLog(`${t.method} response:
${k}`), w;
  }
  /**
   * Make a call to API to trade token for session ID.
   * Assume the token was authenticated by the user.
   *
   * @param token - Token provided by scrobbler service
   * @returns Session data
   */
  async tradeTokenForSession(e) {
    const t = { method: "auth.getsession", token: e }, r = await this.sendRequest(
      { method: "GET" },
      t
    );
    if (this.processResponse(r) !== f.RESULT_OK)
      throw new Error(f.ERROR_AUTH);
    const i = r.session.name;
    return { sessionID: r.session.key, sessionName: i };
  }
  /**
   * Create URL of API request based on API params.
   * @param params - Object of key =\> value url parameters
   * @param signed - Should the request be signed?
   * @returns URL of API request
   */
  makeRequestUrl(e, t) {
    e.api_key = this.getApiKey(), e.format = "json", t && (e.api_sig = this.generateSign(e));
    const r = Dt(e);
    return `${this.getApiUrl()}?${r}`;
  }
  /**
   * Compute string for signing request.
   * See http://www.last.fm/api/authspec#8
   * @param params - Parameters of API method
   * @returns Signed parameters
   */
  generateSign(e) {
    const t = Object.keys(e).sort();
    let r = "";
    for (const a of t)
      ["format", "callback"].includes(a) || (r += `${a}${e[a] || ""}`);
    return gs(r + this.getApiSecret());
  }
  /**
   * Process response and return service call result.
   * @param responseData - Response data
   * @returns Response result
   */
  processResponse(e) {
    return e.error ? f.ERROR_OTHER : f.RESULT_OK;
  }
}
function Qa(s, e) {
  let t = e;
  const r = [s.token], a = s.session;
  a && (r.push(a.name), r.push(a.key));
  for (const i of r)
    typeof i == "string" ? t = Ze(i, t) : typeof i == "number" && (t = Ze(i.toString(), t));
  return t;
}
class Xa extends js {
  /** @override */
  getApiUrl() {
    return "https://ws.audioscrobbler.com/2.0/";
  }
  /** @override */
  getApiKey() {
    return "d9bb1870d3269646f740544d9def2c95";
  }
  /** @override */
  getApiSecret() {
    return "2160733a567d4a1a69a73fad54c564b2";
  }
  /** @override */
  getBaseAuthUrl() {
    return "https://www.last.fm/api/auth/";
  }
  /** @override */
  getBaseProfileUrl() {
    return "https://last.fm/user/";
  }
  /** @override */
  getId() {
    return "lastfm";
  }
  /** @override */
  getLabel() {
    return "Last.fm";
  }
  /** @override */
  getStatusUrl() {
    return "http://status.last.fm/";
  }
  /** @override */
  getStorageName() {
    return "LastFM";
  }
  /** @override */
  async getSongInfo(e) {
    const t = {
      track: e.getTrack(),
      artist: e.getArtist(),
      method: "track.getinfo"
    };
    try {
      const { sessionName: n } = await this.getSession();
      t.username = n;
    } catch {
    }
    e.getAlbum() && (t.album = e.getAlbum());
    const r = await this.sendRequest(
      { method: "GET" },
      t,
      !1
    );
    if (this.processResponse(r) !== f.RESULT_OK)
      throw new Error("Unable to load song info");
    const i = this.parseSongInfo(r);
    return this.canLoveSong() && i && xr(e.controllerTabId, {
      type: "updateLove",
      payload: {
        isLoved: i.userloved || !1
      }
    }), i;
  }
  /** @override */
  canLoadSongInfo() {
    return !0;
  }
  /**
   * Parse service response and return parsed data.
   * @param responseData - Last.fm track.getInfo response data
   * @returns Parsed song info
   */
  parseSongInfo(e) {
    const t = {}, r = e.track, a = e.track.album, i = e.track.artist, n = r.userloved;
    if (n ? t.userloved = n === "1" : t.userloved = void 0, t.artist = i.name, t.artistUrl = i.url, t.track = r.name, t.trackUrl = r.url, t.duration = parseInt(r.duration) / 1e3 || null, a && (t.album = a.title, t.albumUrl = a.url, t.albumMbId = a.mbid, Array.isArray(a.image))) {
      const h = a.image.reduce(
        (A, k) => (A[k.size] = k["#text"], A),
        {}
      ), w = ["extralarge", "large", "medium"];
      for (const A of w) {
        const k = h[A];
        if (k) {
          t.trackArtUrl = k;
          break;
        }
      }
    }
    return t.userPlayCount = parseInt(r.userplaycount) || 0, t;
  }
  /** @override */
  applyFilter(e) {
    if (e.getAlbumArtist()) {
      const t = e.getAlbumArtist() || "";
      e.parsed.albumArtist = t.includes("Various Artists") ? "Various Artists" : t;
    }
    return e;
  }
}
class Za extends js {
  /** @override */
  getApiUrl() {
    return "https://libre.fm/2.0/";
  }
  /** @override */
  getApiKey() {
    return "r8i1y91hz71tcx7vyrp9hk1alhqp1898";
  }
  /** @override */
  getApiSecret() {
    return "8187db5vg234yq6tm7o62q8mtl1niala";
  }
  /** @override */
  getBaseAuthUrl() {
    return "https://www.libre.fm/api/auth/";
  }
  /** @override */
  getBaseProfileUrl() {
    return "https://libre.fm/user/";
  }
  /** @override */
  getLabel() {
    return "Libre.fm";
  }
  /** @override */
  getStatusUrl() {
    return "";
  }
  /** @override */
  getStorageName() {
    return "LibreFM";
  }
  async getSongInfo() {
    return Promise.resolve({});
  }
  /** @override */
  sendRequest(e, t, r) {
    return e.method?.toLowerCase() === "post" && (e.headers = {
      "Content-Type": "application/x-www-form-urlencoded"
    }, e.body = Dt(t)), super.sendRequest(e, t, r);
  }
}
const ei = "https://listenbrainz.org/settings/", De = "https://api.listenbrainz.org/1", ti = `${De}/submit-listens`;
class si extends ne {
  isLocalOnly = !1;
  async getSongInfo() {
    return Promise.resolve({});
  }
  /** @override */
  async getAuthUrl() {
    const e = await this.storage.get();
    let t;
    return e && "properties" in e && (t = e.properties), t ? await this.storage.set({ isAuthStarted: !0, properties: t }) : await this.storage.set({ isAuthStarted: !0 }), "https://listenbrainz.org/login/musicbrainz?next=%2Fsettings%2F";
  }
  /** @override */
  getBaseProfileUrl() {
    return "https://listenbrainz.org/user/";
  }
  /** @override */
  getLabel() {
    return "ListenBrainz";
  }
  /** @override */
  async getProfileUrl() {
    return this.userToken ? "" : await super.getProfileUrl();
  }
  /** @override */
  getStatusUrl() {
    return this.userToken ? "" : "https://listenbrainz.org/current-status";
  }
  /** @override */
  getStorageName() {
    return "ListenBrainz";
  }
  /** @override */
  getUserDefinedProperties() {
    return ["userApiUrl", "userToken"];
  }
  /** @override */
  async signOut() {
    (this.userApiUrl || this.userToken) && await this.applyUserProperties({
      userApiUrl: null,
      userToken: null
    }), await super.signOut();
  }
  /** @override */
  async getSession() {
    if (this.userToken)
      return { sessionID: this.userToken };
    const e = await this.storage.get();
    if (!e)
      throw this.debugLog("no data", "error"), await this.signOut(), new Error(f.ERROR_AUTH);
    if ("isAuthStarted" in e && e.isAuthStarted)
      try {
        const t = await this.requestSession();
        return e.sessionID = t.sessionID, e.sessionName = t.sessionName, delete e.isAuthStarted, await this.storage.set(e), t;
      } catch {
        throw this.debugLog("Failed to get session", "warn"), await this.signOut(), new Error(f.ERROR_AUTH);
      }
    else if (!("sessionID" in e) || !e.sessionID)
      throw new Error(f.ERROR_AUTH);
    return {
      sessionID: e.sessionID,
      sessionName: e.sessionName
    };
  }
  /** @override */
  async isReadyForGrantAccess() {
    if (this.userToken)
      return !1;
    const e = await this.storage.get();
    return !e || !("isAuthStarted" in e) ? !1 : e.isAuthStarted ?? !1;
  }
  /** @override */
  async sendNowPlaying(e) {
    const { sessionID: t } = await this.getSession(), a = {
      listen_type: "playing_now",
      payload: [
        {
          track_metadata: this.makeTrackMetadata(e)
        }
      ]
    };
    return this.sendScrobbleRequest(a, t);
  }
  /** @override */
  async sendPaused() {
    return Promise.resolve(f.RESULT_OK);
  }
  /** @override */
  async sendResumedPlaying() {
    return Promise.resolve(f.RESULT_OK);
  }
  /** @override */
  async scrobble(e, t) {
    const { sessionID: r } = await this.getSession(), a = {
      listen_type: t ? "single" : "import",
      payload: e.slice(0, 50).map((n) => ({
        listened_at: n.metadata.startTimestamp,
        track_metadata: this.makeTrackMetadata(n)
      }))
    }, i = await this.sendScrobbleRequest(a, r);
    return new Array(Math.min(e.length, 50)).fill(
      i
    );
  }
  /** @override */
  async toggleLove(e, t) {
    const r = e.getTrack(), a = e.getArtist();
    if (typeof r != "string" || typeof a != "string")
      throw new Error(
        `Invalid track ${JSON.stringify({ artist: a, track: r })}`
      );
    const i = new URLSearchParams({
      recording_name: r,
      artist_name: a
    });
    let n = {};
    try {
      n = await this.listenBrainzApi(
        "GET",
        `${De}/metadata/lookup?${i.toString()}`,
        null,
        null
      );
    } catch {
    }
    if (this.debugLog(
      `lookup result: ${JSON.stringify(n, null, 2)}`
    ), !n.recording_mbid)
      return this.debugLog(
        `Could not lookup metadata for song: ${e.toString()}`
      ), {};
    const { sessionID: h } = await this.getSession(), w = {
      recording_mbid: n.recording_mbid,
      score: t ? 1 : 0
    }, A = await this.listenBrainzApi(
      "POST",
      `${De}/feedback/recording-feedback`,
      w,
      h
    );
    return this.processResult(A);
  }
  /** @override */
  canLoveSong() {
    return !0;
  }
  /** Private methods. */
  async listenBrainzApi(e, t, r, a) {
    const i = {
      method: e,
      headers: {
        "Content-Type": "application/json; charset=UTF-8"
      }
    };
    r && (i.body = JSON.stringify(r)), a && i.headers && (i.headers.Authorization = `Token ${a}`);
    const n = fetch(t, i), h = this.REQUEST_TIMEOUT;
    let w = null, A = null;
    try {
      A = await M(h, n), w = await A.json();
    } catch {
      throw this.debugLog("Error while sending request", "error"), new Error(f.ERROR_OTHER);
    }
    switch (A.status) {
      case 400:
        throw this.debugLog("Invalid JSON sent", "error"), new Error(f.ERROR_AUTH);
      case 401:
        throw this.debugLog("Invalid Authorization sent", "error"), new Error(f.ERROR_AUTH);
    }
    return this.debugLog(JSON.stringify(w, null, 2)), w;
  }
  async sendScrobbleRequest(e, t) {
    const r = await this.listenBrainzApi(
      "POST",
      this.userApiUrl || ti,
      e,
      t
    );
    return this.processResult(r);
  }
  async requestSession() {
    let e = null;
    try {
      e = await this.fetchSession(ei);
    } catch {
      this.debugLog("request session timeout", "warn");
    }
    if (e) {
      const t = yt(e.sessionID);
      return this.debugLog(`Session ID: ${t}`), e;
    }
    throw new Error(f.ERROR_AUTH);
  }
  async fetchSession(e) {
    this.debugLog(`Use ${e}`);
    const t = _s() ? Ms(e) : v({
      type: "sendListenBrainzRequest",
      payload: {
        url: e
      }
    }), r = this.REQUEST_TIMEOUT, a = await M(r, t);
    if (a !== null) {
      let i = null;
      const n = a.match(
        /<script id="global-react-props" type="application\/json">(.*?)<\/script>/
      )?.[1];
      n && (i = JSON.parse(
        n
      ));
      const h = i?.current_user.name, w = i?.current_user.auth_token;
      if (w && h)
        return { sessionID: w, sessionName: h };
    }
    return null;
  }
  processResult(e) {
    return e.status !== "ok" ? f.ERROR_OTHER : f.RESULT_OK;
  }
  makeTrackMetadata(e) {
    const t = {
      artist_name: e.getArtist() ?? "",
      track_name: e.getTrack() ?? "",
      additional_info: {
        submission_client: "Web Scrobbler",
        submission_client_version: Ar(),
        music_service_name: e.metadata.label
      }
    }, r = e.getAlbum();
    r && (t.release_name = r);
    const a = e.getOriginUrl();
    a && (t.additional_info.origin_url = a);
    const i = e.getAlbumArtist();
    i && (t.additional_info.release_artist_name = i), a && e.metadata.label === "Spotify" && (t.additional_info.spotify_id = a);
    const n = e.getDuration();
    return n && (t.additional_info.duration = n), t;
  }
}
class ri extends ne {
  isLocalOnly = !0;
  /** @override */
  getStorageName() {
    return "Maloja";
  }
  /** @override */
  getLabel() {
    return "Maloja";
  }
  /** @override */
  getStatusUrl() {
    return "";
  }
  /** @override */
  getUserDefinedProperties() {
    return ["userApiUrl", "userToken"];
  }
  /** @override */
  async getProfileUrl() {
    return Promise.resolve("");
  }
  /** @override */
  async getAuthUrl() {
    return Promise.resolve("");
  }
  /** @override */
  getBaseProfileUrl() {
    return "";
  }
  /** @override */
  getSongInfo() {
    return Promise.resolve({});
  }
  toggleLove() {
    return Promise.resolve(f.ERROR_OTHER);
  }
  /** @override */
  async getSession() {
    if (!this.userToken)
      throw new Error(f.ERROR_AUTH);
    return Promise.resolve({ sessionID: this.userToken });
  }
  /** @override */
  isReadyForGrantAccess() {
    return Promise.resolve(!1);
  }
  /** @override */
  sendNowPlaying() {
    return Promise.resolve(f.RESULT_OK);
  }
  /** @override */
  async sendPaused() {
    return Promise.resolve(f.RESULT_OK);
  }
  /** @override */
  async sendResumedPlaying() {
    return Promise.resolve(f.RESULT_OK);
  }
  /** @override */
  async scrobble(e) {
    const t = [];
    for (const r of e.slice(0, 50)) {
      const a = this.makeTrackMetadata(r);
      t.push(this.sendRequest(a, this.userToken));
    }
    return Promise.all(t);
  }
  /** Private methods */
  async sendRequest(e, t) {
    e.key = t;
    const r = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(e)
    }, a = fetch(this.userApiUrl, r), i = this.REQUEST_TIMEOUT;
    let n = null;
    try {
      if (n = await M(i, a), n.status !== 200)
        return f.ERROR_OTHER;
    } catch {
      return this.debugLog("Error while sending request", "error"), f.ERROR_OTHER;
    }
    return f.RESULT_OK;
  }
  makeTrackMetadata(e) {
    const t = {
      artist: e.getArtist() ?? "",
      title: e.getTrack() ?? "",
      time: e.metadata.startTimestamp
    }, r = e.getAlbum();
    r && (t.album = r);
    const a = e.getAlbumArtist();
    return a && (t.albumartists = [a]), t;
  }
}
class ai extends ne {
  isLocalOnly = !0;
  /** @override */
  getBaseProfileUrl() {
    return "";
  }
  /** @override */
  getLabel() {
    return "Webhook";
  }
  /** @override */
  getStatusUrl() {
    return "";
  }
  /** @override */
  getStorageName() {
    return "Webhook";
  }
  /** @override */
  getSession() {
    return !this.arrayProperties || this.arrayProperties.length === 0 ? Promise.reject(new Error("")) : Promise.resolve({ sessionID: "webhook" });
  }
  /** @override */
  getAuthUrl() {
    return Promise.resolve("");
  }
  /** @override */
  isReadyForGrantAccess() {
    return Promise.resolve(!1);
  }
  /** @override */
  async getProfileUrl() {
    return Promise.resolve("");
  }
  /** @override */
  getUserDefinedArrayProperties() {
    return ["applicationName", "userApiUrl"];
  }
  async getSongInfo() {
    return Promise.resolve({});
  }
  /** @override */
  async sendRequest(e) {
    if (!this.arrayProperties || this.arrayProperties.length === 0)
      return f.ERROR_AUTH;
    this.debugLog(
      `Webhook - sendRequest: ${JSON.stringify(e, null, 2)}`
    );
    const t = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(e)
    }, r = [];
    for (const i of this.arrayProperties)
      r.push(fetch(i.userApiUrl, t));
    const a = this.REQUEST_TIMEOUT;
    try {
      const i = await M(
        a,
        Promise.all(r)
      );
      for (const n of i)
        if (n.status !== 200)
          return this.debugLog(`Error in ${n.url}.`, "error"), f.ERROR_OTHER;
    } catch {
      return this.debugLog("Error while sending request", "error"), f.ERROR_OTHER;
    }
    return f.RESULT_OK;
  }
  /** @override */
  async sendNowPlaying(e) {
    return this.sendRequest({
      eventName: "nowplaying",
      time: Date.now(),
      data: { song: e }
    });
  }
  /** @override */
  async sendPaused(e) {
    return this.sendRequest({
      eventName: "paused",
      time: Date.now(),
      data: { song: e }
    });
  }
  /** @override */
  async sendResumedPlaying(e) {
    return this.sendRequest({
      eventName: "resumedplaying",
      time: Date.now(),
      data: { song: e }
    });
  }
  /** @override */
  async scrobble(e, t) {
    const r = await this.sendRequest({
      eventName: "scrobble",
      time: Date.now(),
      // send the first song as a separate argument to avoid breaking older implementations
      data: {
        song: e[0],
        songs: e,
        currentlyPlaying: t
      }
    });
    return new Array(e.length).fill(r);
  }
  /** @override */
  toggleLove(e, t) {
    return this.sendRequest({
      eventName: "loved",
      time: Date.now(),
      data: { song: e, isLoved: t }
    });
  }
}
class ii extends ne {
  isLocalOnly = !0;
  /** @override */
  getStorageName() {
    return "Pleroma";
  }
  /** @override */
  getLabel() {
    return "Pleroma";
  }
  /** @override */
  getStatusUrl() {
    return "";
  }
  /** @override */
  getUserDefinedProperties() {
    return ["userApiUrl", "userToken"];
  }
  /** @override */
  async getProfileUrl() {
    return Promise.resolve("");
  }
  /** @override */
  async getAuthUrl() {
    return Promise.resolve("");
  }
  /** @override */
  getBaseProfileUrl() {
    return "";
  }
  /** @override */
  getSongInfo() {
    return Promise.resolve({});
  }
  toggleLove() {
    return Promise.resolve(f.ERROR_OTHER);
  }
  /** @override */
  async getSession() {
    if (!this.userToken)
      throw new Error(f.ERROR_AUTH);
    const e = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.userToken}`
      }
    }, t = `https://${this.userApiUrl}/api/v1/accounts/verify_credentials`, r = fetch(t, e), a = this.REQUEST_TIMEOUT;
    let i = null;
    try {
      if (i = await M(a, r), i.status !== 200)
        throw new Error(f.ERROR_AUTH);
      const n = await i.json(), h = n ? n.fqn : "";
      return { sessionID: this.userToken, sessionName: h };
    } catch {
      throw this.debugLog("Error while sending request", "error"), new Error(f.ERROR_AUTH);
    }
  }
  /** @override */
  isReadyForGrantAccess() {
    return Promise.resolve(!1);
  }
  /** @override */
  sendNowPlaying() {
    return Promise.resolve(f.RESULT_OK);
  }
  /** @override */
  async sendResumedPlaying() {
    return Promise.resolve(f.RESULT_OK);
  }
  /** @override */
  async sendPaused() {
    return Promise.resolve(f.RESULT_OK);
  }
  /** @override */
  async scrobble(e) {
    const t = [];
    for (const r of e.slice(0, 50)) {
      const a = this.makeTrackMetadata(r);
      t.push(this.sendRequest(a, this.userToken));
    }
    return Promise.all(t);
  }
  /** Private methods */
  async sendRequest(e, t) {
    const r = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${t}`
      },
      body: JSON.stringify(e)
    }, a = `https://${this.userApiUrl}/api/v1/pleroma/scrobble`, i = fetch(a, r), n = this.REQUEST_TIMEOUT;
    let h = null;
    try {
      if (h = await M(n, i), h.status !== 200)
        return f.ERROR_OTHER;
    } catch {
      return this.debugLog("Error while sending request", "error"), f.ERROR_OTHER;
    }
    return f.RESULT_OK;
  }
  makeTrackMetadata(e) {
    const t = {
      artist: e.getArtist() ?? "",
      title: e.getTrack() ?? "",
      length: e.getDuration(),
      url: e.parsed.originUrl ?? ""
    }, r = e.getAlbum();
    return r && (t.album = r), t;
  }
}
const se = [
  new Xa(),
  new Za(),
  new si(),
  new ri(),
  new ai(),
  new ii()
];
function gt(s, e) {
  return e.some((t) => t.getLabel() === s.getLabel());
}
class oi {
  /**
   * Scrobblers that are bound, meaning they have valid session IDs.
   */
  boundScrobblers = [];
  /**
   * Bind all registered scrobblers.
   * @returns Array of bound scrobblers
   */
  async bindAllScrobblers() {
    for (const e of se)
      try {
        await e.getSession(), this.bindScrobbler(e);
      } catch {
        y(`Unable to bind ${e.getLabel()}`, "warn");
      }
    return this.boundScrobblers;
  }
  /**
   * Bind given scrobbler.
   * @param scrobbler - Scrobbler instance
   */
  bindScrobbler(e) {
    gt(e, this.boundScrobblers) || (this.boundScrobblers.push(e), y(`Bind ${e.getLabel()} scrobbler`));
  }
  /**
   * Unbind given scrobbler.
   * @param scrobbler - Scrobbler instance
   */
  unbindScrobbler(e) {
    if (gt(e, this.boundScrobblers)) {
      const t = this.boundScrobblers.indexOf(e);
      this.boundScrobblers.splice(t, 1), y(`Unbind ${e.getLabel()} scrobbler`);
    } else
      y(`${e.getLabel()} is not bound`, "error");
  }
  /**
   * Retrieve song info using scrobbler APIs.
   * @param song - Song instance
   * @returns Promise resolved with array of song info objects
   */
  getSongInfo(e) {
    const t = se.filter((r) => r.canLoadSongInfo());
    return y(`Send "get info" request: ${t.length}`), Promise.all(
      t.map(async (r) => {
        try {
          return await r.getSongInfo(e);
        } catch {
          return y(
            `Unable to get song info from ${r.getLabel()}`,
            "warn"
          ), null;
        }
      })
    );
  }
  /**
   * Send now playing notification to each bound scrobbler.
   * @param song - Song instance
   * @returns Promise that will be resolved then the task will complete
   */
  sendNowPlaying(e) {
    return y(`Send "now playing" request: ${this.boundScrobblers.length}`), Promise.all(
      this.boundScrobblers.map(async (t) => {
        try {
          return await t.sendNowPlaying(
            t.applyFilter(e)
          );
        } catch (r) {
          return this.processErrorResult(
            t,
            r
          );
        }
      })
    );
  }
  /**
   * Send now playing notification to each bound scrobbler.
   * @param song - Song instance
   * @returns Promise that will be resolved then the task will complete
   */
  sendPaused(e) {
    const t = this.boundScrobblers.filter(
      (r) => typeof r.sendPaused == "function"
    );
    return t.length === 0 ? Promise.resolve([f.RESULT_OK]) : (y(`Send "paused" request: ${t.length}`), Promise.all(
      t.map(async (r) => {
        try {
          return await r.sendPaused(
            r.applyFilter(e)
          );
        } catch (a) {
          return this.processErrorResult(
            r,
            a
          );
        }
      })
    ));
  }
  /**
   * Send now playing notification to each bound scrobbler.
   * @param song - Song instance
   * @returns Promise that will be resolved then the task will complete
   */
  sendResumedPlaying(e) {
    const t = this.boundScrobblers.filter(
      (r) => typeof r.sendResumedPlaying == "function"
    );
    return t.length === 0 ? Promise.resolve([f.RESULT_OK]) : (y(`Send "paused" request: ${t.length}`), Promise.all(
      t.map(async (r) => {
        try {
          return await r.sendResumedPlaying(
            r.applyFilter(e)
          );
        } catch (a) {
          return this.processErrorResult(
            r,
            a
          );
        }
      })
    ));
  }
  /**
   * Scrobble song to each bound scrobbler.
   * @param song - Song instance
   * @returns Promise that will be resolved then the task will complete
   */
  async scrobble(e, t) {
    y(`Send "scrobble" request: ${this.boundScrobblers.length}`);
    const r = await Promise.all(
      this.boundScrobblers.map(async (a) => {
        try {
          return await a.scrobble(
            e.map(a.applyFilter),
            t
          );
        } catch (i) {
          return this.processScrobbleErrorResult(
            a,
            i
          );
        }
      })
    );
    for (let a = 0; a < r[0].length; a++)
      await Se.pushScrobble({
        song: e[a].getCloneableData(),
        status: Ns(r, a)
      });
    return r;
  }
  /**
   * Toggle song love status.
   * @param song - Song instance
   * @param flag - Flag indicates song is loved
   * @returns Promise that will be resolved then the task will complete
   */
  async toggleLove(e, t) {
    const r = se.filter((i) => i.canLoveSong());
    return y(`Send "${t ? "love" : "unlove"}" request: ${r.length}`), Promise.all(
      r.map(async (i) => {
        try {
          return await i.toggleLove(e, t);
        } catch (n) {
          return this.processErrorResult(
            i,
            n
          );
        }
      })
    );
  }
  /**
   * Get all registered scrobblers.
   * @returns Array of bound scrobblers
   */
  getRegisteredScrobblers() {
    return se;
  }
  /**
   * Get scrobbler by label.
   * @param label - Scrobbler label
   * @returns Found scrobbler object
   */
  getScrobblerByLabel(e) {
    for (const t of se)
      if (t.getLabel() === e)
        return t;
    return null;
  }
  /**
   * Process result received from scrobbler.
   * @param scrobbler - Scrobbler instance
   * @param result - API call result
   * @returns Promise resolved with result object
   */
  async processErrorResult(e, t) {
    const r = t === f.ERROR_OTHER, a = t === f.ERROR_AUTH;
    if (!(r || a))
      throw new Error(`Invalid result: ${t}`);
    return a && (await e.isReadyForGrantAccess() || this.unbindScrobbler(e)), t;
  }
  /**
   * Process result received from scrobbler when scrobbling.
   * Scrobbling has array result so logic is slightly different
   * @param scrobbler - Scrobbler instance
   * @param result - API call result
   * @returns Promise resolved with result object
   */
  async processScrobbleErrorResult(e, t) {
    const r = t[0] === f.ERROR_OTHER, a = t[0] === f.ERROR_AUTH;
    if (!(r || a))
      throw new Error(`Invalid result: ${t[0]}`);
    return a && (await e.isReadyForGrantAccess() || this.unbindScrobbler(e)), t;
  }
}
const ni = new oi();
function li() {
  const s = T.runtime.getURL(
    "connectors/webhook-auth-dom-inject.js"
  ), e = document.createElement("script");
  e.src = s, e.onload = function() {
    const t = this;
    t.parentNode?.removeChild(t);
  }, (document.head || document.documentElement).appendChild(e), window.addEventListener("message", (t) => {
    typeof t.data == "object" && t.data && "sender" in t.data && t.data.sender === "web-scrobbler" && "type" in t.data && t.data.type === "confirmLogin" && "applicationName" in t.data && typeof t.data.applicationName == "string" && "userApiUrl" in t.data && typeof t.data.userApiUrl == "string" && ni.getScrobblerByLabel("Webhook")?.addUserArrayProperties({
      applicationName: t.data.applicationName,
      userApiUrl: t.data.userApiUrl
    }).then(() => {
      v({
        type: "updateScrobblerProperties",
        payload: void 0
      });
    });
  });
}
ci();
async function ci() {
  di();
  try {
    if (window.location.href.startsWith("https://webscrobbler.com/webhook")) {
      li();
      return;
    }
    await ui(), Ga();
  } catch (s) {
    if (s instanceof Error && s.message === "dontlog")
      return;
    y(s, "error");
  }
}
async function ui() {
  const s = await Js(window.location.href);
  if (!s)
    throw new Error("dontlog");
  if (window !== top && !s.allFrames)
    throw new Error("dontlog");
  window.Connector = new as(s), window.Util = Yr, window.MetadataFilter = jr, window.webScrobblerScripts = {}, je.init(), ps.init();
  try {
    await import(T.runtime.getURL(`connectors/${s?.js}`)), y(`Successfully loaded ${s.label} connector`);
  } catch (e) {
    throw y(
      `An error occurred while loading ${s.label} connector`,
      "error"
    ), e;
  }
}
function di() {
  const s = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  v({
    type: "updateTheme",
    payload: s
  });
}
