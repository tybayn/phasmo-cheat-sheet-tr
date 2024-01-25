const themes = {
    "Varsayılan": "theme-default",
    "Berry": "theme-berry",
    "Siyah & Beyaz": "theme-black-white",
    "Alacakaranlık": "theme-dusk",
    "Frost": "theme-frost",
    "Cadılar Bayramı": "theme-halloween",
    "Kuzey Işıkları": "theme-northern-lights",
    "Gurur": "theme-pride",
    "Ladin": "theme-spruce",
    "Çelik": "theme-steel",
    "Gün batımı": "theme-sunset",
    "Alacakaranlık": "theme-twilight",
    "ZN-Elite" : "theme-zn"
}

function loadThemes(){
    let theme_options = ""
    Object.keys(themes).forEach((key) => {
        theme_options += `<option value="${key}">${key}</option>`
    })
    $("#theme").html(theme_options)
}

function changeTheme(name = null){

    let changeObjects = [
        ".ghost_card",".menu","#settings_box","#settings_tab",
        "#event_box","#event_tab","#wiki_box","#wiki_tab",
        "#maps_box","#maps_tab","#language_box","#language_tab",
        "#theme_box","#theme_tab","#info_box","#info_box_voice"
    ]

    let theme_name = name != null ? name : $("#theme").val()

    changeObjects.forEach((item) => {
        $(item).removeClass(Object.values(themes))
        $(item).addClass(themes[theme_name])
    })
}