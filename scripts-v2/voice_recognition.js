const levenshtein_distance = (str1 = '', str2 = '') => {
    const track = Array(str2.length + 1).fill(null).map(() =>
    Array(str1.length + 1).fill(null));
    for (let i = 0; i <= str1.length; i += 1) {
       track[0][i] = i;
    }
    for (let j = 0; j <= str2.length; j += 1) {
       track[j][0] = j;
    }
    for (let j = 1; j <= str2.length; j += 1) {
       for (let i = 1; i <= str1.length; i += 1) {
          const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
          track[j][i] = Math.min(
             track[j][i - 1] + 1,
             track[j - 1][i] + 1,
             track[j - 1][i - 1] + indicator,
          );
       }
    }
    return track[str2.length][str1.length];
 };

 let running_log = []

 $.fn.isInViewport = function () {
    let elementTop = $(this).offset().top;
    let elementBottom = elementTop + $(this).outerHeight();
  
    let viewportTop = $(window).scrollTop();
    let viewportBottom = viewportTop + window.innerHeight;
  
    return elementBottom > viewportTop && elementTop < viewportBottom;
}

function reset_voice_status(){
    setTimeout(function(){
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic.png)";
        document.getElementById("voice_recognition_status").className = "pulse_animation"
    },1000)
}

function domovoi_show_last(){
    $("#domovoi-text").show()
    $("#domovoi-img").attr("src","imgs/domovoi-heard.png")
}

function domovoi_hide_last(){
    $("#domovoi-text").hide()
    $("#domovoi-img").attr("src","imgs/domovoi.png")
}


function domovoi_heard(message){
    $("#domovoi-text").text(message.toLowerCase())
    $("#domovoi-text").show()
    $("#domovoi-img").attr("src","imgs/domovoi-heard.png")
    setTimeout(function() {
        $("#domovoi-text").hide()
        $("#domovoi-img").attr("src",markedDead ? "imgs/domovoi-died.png" : "imgs/domovoi.png")
    },2000)
}

function domovoi_not_heard(){
    $("#domovoi-img").attr("src",user_settings['domo_side'] == 1 ? "imgs/domovoi-guess-flip.png" : "imgs/domovoi-guess.png")
    setTimeout(function() {
        $("#domovoi-img").attr("src",markedDead ? "imgs/domovoi-died.png" : "imgs/domovoi.png")
    },3000)
}

function domovoi_print_logs(){
    console.log("----------------------------------------------------------------")
    console.log("Domo memory:")
    running_log.forEach(function (item,idx){
        console.log(`--${idx}--`)
        for (const [key, value] of Object.entries(item)) {
            console.log(`${key}: ${value}`)
        }
    })
    console.log("----------------------------------------------------------------")
}

function parse_speech(vtext){
    vtext = vtext.toLowerCase().trim()
    running_log.push({
        "Time":new Date().toJSON().replace('T', ' ').split('.')[0],
        "Raw":vtext
    })
    if(running_log.length > 5){
        running_log.shift()
    }
    let cur_idx = running_log.length - 1

    domovoi_msg = ""

    for (const [key, value] of Object.entries(ZNLANG['overall'])) {
        for (var i = 0; i < value.length; i++) {
            vtext = vtext.replace(value[i], key);
        }
    }

    running_log[cur_idx]["Cleaned"] = vtext

    if(vtext.startsWith('hayalet hızı')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized hayalet hızı command")
        running_log[cur_idx]["Type"] = "hayalet hızı"
        console.log(`Heard '${vtext}'`)
        vtext = vtext.replace('hayalet hızı', "").trim()
        domovoi_msg += "İşaretlenen Hayalet Hızı "

        vtext = vtext.replace('üç','3')
        vtext = vtext.replace('iki','2')
        vtext = vtext.replace('bir','1')
        vtext = vtext.replace('sıfır','0')

        var smallest_num = '150'
        var smallest_val = 100
        var prev_value = document.getElementById("ghost_modifier_speed").value
        var all_ghost_speed = ['50','75','100','125','150']
        var all_ghost_speed_convert = {'50':0,'75':1,'100':2,'125':3,'150':4}

        for(var i = 0; i < all_ghost_speed.length; i++){
            var leven_val = levenshtein_distance(all_ghost_speed[i],vtext)
            if(leven_val < smallest_val){
                smallest_val = leven_val 
                smallest_num = all_ghost_speed[i]
            }
        }
        domovoi_msg += smallest_num

        document.getElementById("ghost_modifier_speed").value = all_ghost_speed_convert[smallest_num] ?? 2

        if(prev_value != all_ghost_speed_convert[smallest_num]){
            setTempo();
            bpm_calc(true);
            saveSettings();
            send_state()
        }

        domovoi_heard(domovoi_msg)
        running_log[cur_idx]["Domo"] = domovoi_msg
        reset_voice_status()
    }
    else if(vtext.startsWith('bilgi göster')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized ghost command")
        running_log[cur_idx]["Type"] = "ghost"
        console.log(`Heard '${vtext}'`)
        vtext = vtext.replace('bilgi göster', "").trim()

        var smallest_ghost = "Spirit"
        var smallest_val = 100

         // Common fixes to ghosts
         var prevtext = vtext;
         for (const [key, value] of Object.entries(ZNLANG['ghosts'])) {
             for (var i = 0; i < value.length; i++) {
                 if(vtext.startsWith(value[i])){vtext = key}
             }
         }
 
         for(var i = 0; i < Object.keys(all_ghosts).length; i++){
             var leven_val = levenshtein_distance(Object.values(all_ghosts)[i].toLowerCase(),vtext)
             if(leven_val < smallest_val){
                 smallest_val = leven_val 
                 smallest_ghost = Object.values(all_ghosts)[i]
             }
         }
         console.log(`${prevtext} >> ${vtext} >> ${smallest_ghost}`)
         running_log[cur_idx]["Debug"] = `${prevtext} >> ${vtext} >> ${smallest_ghost}`
         domovoi_msg += `${smallest_ghost} bilgisi gösteriliyor`

        if(!$(document.getElementById(rev(all_ghosts,smallest_ghost))).isInViewport())
            document.getElementById(rev(all_ghosts,smallest_ghost)).scrollIntoView({alignToTop:true,behavior:"smooth"})

        resetResetButton()
        domovoi_heard(domovoi_msg)
        running_log[cur_idx]["Domo"] = domovoi_msg
        reset_voice_status()

    }
    else if(vtext.startsWith('hayalet')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized ghost command")
        running_log[cur_idx]["Type"] = "ghost"
        console.log(`Heard '${vtext}'`)
        vtext = vtext.replace('hayalet', "").trim()
        domovoi_msg += "İşaretlenen Hayalet "

        var smallest_ghost = "Spirit"
        var smallest_val = 100
        var vvalue = 0
        if(vtext.startsWith('değil ')){
            vtext = vtext.replace('değil ', "").trim()
            vvalue = 0
            domovoi_msg = "İşaretlenen İhtimal Dışı Hayalet "
        }
        else if(vtext.startsWith("temizle")){
            vtext = vtext.replace("temizle ", "").trim()
            vvalue = 0
            domovoi_msg = "Seçimi Kaldırılan Hayalet "
        }
        else if(vtext.startsWith("guess ")){
            vtext = vtext.replace('guess ', "").trim()
            vvalue = 3
            domovoi_msg = "Tahmin Edilen "
        }
        else if(vtext.startsWith("seç ") || vtext.startsWith("saç ")){
            vtext = vtext.replace('seç ', "").replace('saç ', "").trim()
            vvalue = 2
            domovoi_msg = "Seçilen Hayalet "
        }
        else if(vtext.startsWith("kaldır ")){
            vtext = vtext.replace('kaldır ', "").trim()
            vvalue = -1
            domovoi_msg = "İhtimal Dışı Hayalet "
        }
        else if(vtext.endsWith(" tarafından öldürüldü")){
            vtext = vtext.replace(' tarafından öldürüldü', "").trim()
            vvalue = -2
        }
        else if(vtext.startsWith("göster ")){
            vtext = vtext.replace('göster ', "").trim()
            vvalue = -10
        }

        // Common fixes to ghosts
        var prevtext = vtext;
        for (const [key, value] of Object.entries(ZNLANG['ghosts'])) {
            for (var i = 0; i < value.length; i++) {
                if(vtext.startsWith(value[i])){vtext = key}
            }
        }

        for(var i = 0; i < Object.keys(all_ghosts).length; i++){
            var leven_val = levenshtein_distance(Object.values(all_ghosts)[i].toLowerCase(),vtext)
            if(leven_val < smallest_val){
                smallest_val = leven_val 
                smallest_ghost = Object.values(all_ghosts)[i]
            }
        }
        console.log(`${prevtext} >> ${vtext} >> ${smallest_ghost}`)
        running_log[cur_idx]["Debug"] = `${prevtext} >> ${vtext} >> ${smallest_ghost}`
        domovoi_msg += smallest_ghost

        if(vvalue == -2){
            domovoi_msg += " tarafından öldürüldü"
        }
        else if(vvalue == -10){
            domovoi_msg += " bilgisi gösteriliyor"
        }

        if (vvalue == 0){
            fade(document.getElementById(rev(all_ghosts,smallest_ghost)));
        }
        else if (vvalue == 3){
            guess(document.getElementById(rev(all_ghosts,smallest_ghost)));
            if(!$(document.getElementById(rev(all_ghosts,smallest_ghost))).isInViewport())
                document.getElementById(rev(all_ghosts,smallest_ghost)).scrollIntoView({alignToTop:true,behavior:"smooth"})
        }
        else if (vvalue == 2){
            select(document.getElementById(rev(all_ghosts,smallest_ghost)));
            if(!$(document.getElementById(rev(all_ghosts,smallest_ghost))).isInViewport())
                document.getElementById(rev(all_ghosts,smallest_ghost)).scrollIntoView({alignToTop:true,behavior:"smooth"})
        }
        else if (vvalue == -1){
            remove(document.getElementById(rev(all_ghosts,smallest_ghost)));
        }
        else if (vvalue == -2){
            died(document.getElementById(rev(all_ghosts,smallest_ghost)));
            if(!$(document.getElementById(rev(all_ghosts,smallest_ghost))).isInViewport())
                document.getElementById(rev(all_ghosts,smallest_ghost)).scrollIntoView({alignToTop:true,behavior:"smooth"})
        }
        else if(vvalue == -10){
            if(!$(document.getElementById(rev(all_ghosts,smallest_ghost))).isInViewport())
                document.getElementById(rev(all_ghosts,smallest_ghost)).scrollIntoView({alignToTop:true,behavior:"smooth"})
        }

        resetResetButton()
        domovoi_heard(domovoi_msg)
        running_log[cur_idx]["Domo"] = domovoi_msg
        reset_voice_status()
    }
    else if(vtext.startsWith('kanıt')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized kanıt command")
        running_log[cur_idx]["Type"] = "kanıt"
        console.log(`Heard '${vtext}'`)
        vtext = vtext.replace('kanıt', "").trim()
        domovoi_msg += "İşareletnen Kanıt "

        var smallest_evidence = "emf 5"
        var smallest_val = 100
        var vvalue = 1
        if(vtext.startsWith("yok ") || vtext.startsWith("eksik ")){
            vtext = vtext.replace('yok ', "").replace('eksik ', "").trim()
            vvalue = -1
            domovoi_msg = "İhtimal Dışı Kanıt "
        }
        else if(vtext.startsWith("kaldır")){
            vtext = vtext.replace("kaldır ","").trim()
            vvalue = 0
            domovoi_msg = "Seçimi Kaldırılan Kanıt "
        }

        //replacements for Turkish
        var prevtext = vtext;
        for (const [key, value] of Object.entries(ZNLANG['evidence'])) {
            for (var i = 0; i < value.length; i++) {
                if(vtext.startsWith(value[i])){vtext = key}
            }
        }


        for(var i = 0; i < Object.keys(all_evidence).length; i++){
            var leven_val = levenshtein_distance(Object.values(all_evidence)[i].toLowerCase(),vtext)
            if(leven_val < smallest_val){
                smallest_val = leven_val 
                smallest_evidence = Object.values(all_evidence)[i]
            }
        }
        console.log(`${prevtext} >> ${vtext} >> ${smallest_evidence}`)
        running_log[cur_idx]["Debug"] = `${prevtext} >> ${vtext} >> ${smallest_evidence}`
        domovoi_msg += smallest_evidence

        if(!$(document.getElementById(rev(all_evidence,smallest_evidence)).querySelector("#checkbox")).hasClass("block")){
            while (vvalue != {"good":1,"bad":-1,"neutral":0}[document.getElementById(rev(all_evidence,smallest_evidence)).querySelector("#checkbox").classList[0]]){
                tristate(document.getElementById(rev(all_evidence,smallest_evidence)));
            }
        }
        else{
            domovoi_msg = `${smallest_evidence} kanıtı ihtimal dışı!`
        }
        

        resetResetButton()
        domovoi_heard(domovoi_msg)
        running_log[cur_idx]["Domo"] = domovoi_msg
        reset_voice_status()

    }
    else if(vtext.startsWith('maymun pençesi')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized maymun pençesi command")
        running_log[cur_idx]["Type"] = "maymun pençesi"
        console.log(`Heard '${vtext}'`)
        vtext = vtext.replace('maymun pençesi', "").trim()
        var smallest_evidence = "emf 5"
        var smallest_val = 100
        var vvalue = 1

        // Replacements for Turkish
        var prevtext = vtext;
        for (const [key, value] of Object.entries(ZNLANG['evidence'])) {
            for (var i = 0; i < value.length; i++) {
                if(vtext.startsWith(value[i])){vtext = key}
            }
        }

        for(var i = 0; i < Object.keys(all_evidence).length; i++){
            var leven_val = levenshtein_distance(Object.values(all_evidence)[i].toLowerCase(),vtext)
            if(leven_val < smallest_val){
                smallest_val = leven_val 
                smallest_evidence = Object.values(all_evidence)[i]
            }
        }
        console.log(`${prevtext} >> ${vtext} >> ${smallest_evidence}`)
        running_log[cur_idx]["Debug"] = `${prevtext} >> ${vtext} >> ${smallest_evidence}`
        domovoi_msg += `${smallest_evidence} maymun pençesi kanıtı olarak işaretlendi`

        monkeyPawFilter($(document.getElementById(rev(all_evidence,smallest_evidence))).parent().find(".monkey-paw-select"))

        resetResetButton()
        domovoi_heard(domovoi_msg)
        running_log[cur_idx]["Domo"] = domovoi_msg
        reset_voice_status()

    }
    else if(vtext.startsWith('standart görüş mesafesi hız artışını') || vtext.startsWith('görüş mesafesi hız filterisini resetle')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized LOS command")
        running_log[cur_idx]["Type"] = "LOS"
        console.log(`Heard '${vtext}'`)

        var vvalue = 0

        if(!vtext.startsWith('görüş mesafesi hız filterisini resetle')){
            vtext = vtext.replace('standart görüş mesafesi hız artışını',"")
            vvalue = 1
            if(vtext.startsWith("kaldır")){
                vtext = vtext.replace("kaldır ","").trim()
                vvalue = -1
                domovoi_msg = "Seçimi Kaldırılan Hayalet Hızı "
            }
        }

        if((vvalue==0 && all_los()) || (vvalue==1 && all_not_los())){
            domovoi_msg = `${vvalue == 0 ? 'Mevcut tüm hayaletlerin görüş mesafesi var' : 'Şu anki hayaletin görüş mesafesi yok'}!`
        }
        else{
            while (!$(document.getElementById("LOS").querySelector("#checkbox")).hasClass(["neutral","bad","good"][vvalue+1])){
                tristate(document.getElementById("LOS"));
            }
            domovoi_msg = `${vvalue == -1 ? 'Görüş Mesafesi Hız Artışı Seçimi Kaldırıldı' : vvalue == 0 ? 'Görüş Mesafesi Hız Artışı İhtimal Dışı Olarak Seçildi' : 'Görüş Mesafesi Hız Artışı Seçimi Seçildi'}`
        }

        resetResetButton()
        domovoi_heard(domovoi_msg)
        running_log[cur_idx]["Domo"] = domovoi_msg
        reset_voice_status()

    }
    else if(vtext.startsWith('hız')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized speed command")
        running_log[cur_idx]["Type"] = "speed"
        console.log(`Heard '${vtext}'`)
        vtext = vtext.replace('hız', "").trim()
        domovoi_msg += "Seçilen Hayalet Hızı "

        var smallest_speed = "normal"
        var smallest_val = 100
        var vvalue = 1

        if(vtext.startsWith('değil')){
            vtext = vtext.replace('değil ', "").trim()
            vvalue = 0
            domovoi_msg = "Seçilen İhtimal Dışı Hayalet Hızı "
        }
        else if(vtext.startsWith("kaldır")){
            vtext = vtext.replace("kaldır ","").trim()
            vvalue = -1
            domovoi_msg = "Seçimi Kaldırılan Hayalet Hızı "
        }

        if (vtext.startsWith("görüş alanı") || vtext.startsWith("görüş mesafesi")){
            console.log(`${vtext} >> Görüş mesafesi`)
            running_log[cur_idx]["Debug"] = `${vtext} >> Görüş mesafesi`

            if((vvalue==0 && all_los()) || (vvalue==1 && all_not_los())){
                domovoi_msg = `${vvalue == 0 ? 'All' : 'No'} current ghosts have LOS!`
            }
            else{
                while (!$(document.getElementById("LOS").querySelector("#checkbox")).hasClass(["neutral","bad","good"][vvalue+1])){
                    tristate(document.getElementById("LOS"));
                }
                domovoi_msg = `${vvalue == -1 ? 'Görüş Mesafesi Hız Artışı Seçimi Kaldırıldı' : vvalue == 0 ? 'Görüş Mesafesi Hız Artışı İhtimal Dışı Olarak Seçildi' : 'Görüş Mesafesi Hız Artışı Seçimi Seçildi'}`
            }
        }
        else{

            if (vvalue == -1){
                vvalue = 0
            }

            // Common replacements for speed
            var prevtext = vtext;
            for (const [key, value] of Object.entries(ZNLANG['speed'])) {
                for (var i = 0; i < value.length; i++) {
                    if(vtext.startsWith(value[i])){vtext = key}
                }
            }

            for(var i = 0; i < Object.keys(all_speed).length; i++){
                var leven_val = levenshtein_distance(Object.values(all_speed)[i].toLowerCase(),vtext)
                if(leven_val < smallest_val){
                    smallest_val = leven_val 
                    smallest_speed = Object.values(all_speed)[i]
                }
            }
            console.log(`${prevtext} >> ${vtext} >> ${smallest_speed}`)
            running_log[cur_idx]["Debug"] = `${prevtext} >> ${vtext} >> ${smallest_speed}`
            domovoi_msg += smallest_speed

            if(!$(document.getElementById(rev(all_speed,smallest_speed)).querySelector("#checkbox")).hasClass("block")){
                while (vvalue != {"good":1,"neutral":0}[document.getElementById(rev(all_speed,smallest_speed)).querySelector("#checkbox").classList[0]]){
                    dualstate(document.getElementById(rev(all_speed,smallest_speed)));
                }
            }
            else{
                domovoi_msg = `Hayalet Hızı ${smallest_speed} ihtimal dışı!`
            }
        }
        
        resetResetButton()
        domovoi_heard(domovoi_msg)
        running_log[cur_idx]["Domo"] = domovoi_msg
        reset_voice_status()

    }
    else if(vtext.startsWith('akıl sağlığı')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized sanity command")
        running_log[cur_idx]["Type"] = "sanity"
        console.log(`Heard '${vtext}'`)
        vtext = vtext.replace('akıl sağlığı', "").trim()
        domovoi_msg += "Seçilen Av Akıl Sağlığı "

        var smallest_sanity = "Geç"
        var smallest_val = 100
        var vvalue = 1
        
        if(vtext.startsWith('değil')){
            vtext = vtext.replace('değil', "").trim()
            vvalue = 0
            domovoi_msg = "İhtimal Dışı Olarak Seçilen Akıl Sağlığı "
        }
        else if(vtext.startsWith("kaldır")){
            vtext = vtext.replace("kaldır","").trim()
            vvalue = 0
            domovoi_msg = "Seçimi Kaldırılan Av Akıl Sağlığı "
        }

        // Common replacements for sanity
        var prevtext = vtext;
        for (const [key, value] of Object.entries(ZNLANG['sanity'])) {
            for (var i = 0; i < value.length; i++) {
                if(vtext.startsWith(value[i])){vtext = key}
            }
        }

        for(var i = 0; i < Object.keys(all_sanity).length; i++){
            var leven_val = levenshtein_distance(Object.values(all_sanity)[i].toLowerCase(),vtext)
            if(leven_val < smallest_val){
                smallest_val = leven_val 
                smallest_sanity = Object.values(all_sanity)[i]
            }
        }
        console.log(`${prevtext} >> ${vtext} >> ${smallest_sanity}`)
        running_log[cur_idx]["Debug"] = `${prevtext} >> ${vtext} >> ${smallest_sanity}`
        domovoi_msg += smallest_sanity.replace("Average","Normal")

        if(!$(document.getElementById(rev(all_sanity,smallest_sanity)).querySelector("#checkbox")).hasClass("block")){
            while (vvalue != {"good":1,"neutral":0}[document.getElementById(rev(all_sanity,smallest_sanity)).querySelector("#checkbox").classList[0]]){
                dualstate(document.getElementById(rev(all_sanity,smallest_sanity)),false,true);
            }
        }
        else{
            domovoi_msg = `Av Akıl Sağlığı ${smallest_sanity} ihtimal dışı!`
        }

        resetResetButton()
        domovoi_heard(domovoi_msg)
        running_log[cur_idx]["Domo"] = domovoi_msg
        reset_voice_status()

    }
    else if(vtext.endsWith('sayaç') || vtext.startsWith('tütsü sayacı')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized timer command")
        running_log[cur_idx]["Type"] = "sayaç"
        console.log(`Heard '${vtext}'`)
        vtext = vtext.replace('tütsü sayac', "").replace('sayaç', "").trim()
        
        if(vtext == "başla" || vtext == "başlat"){
            domovoi_msg += "tütsü sayacı başladı"
            toggle_timer(true,false)
            send_timer(true,false)
        } 
        else{
            domovoi_msg += "tütsü sayacı durdu"
            toggle_timer(false,true)
            send_timer(false,true)
        }
        
        domovoi_heard(domovoi_msg)
        running_log[cur_idx]["Domo"] = domovoi_msg

        reset_voice_status()
    }
    else if(vtext.startsWith('bekleme süresi') || vtext.startsWith('av sayacı')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized cooldown command")
        running_log[cur_idx]["Type"] = "cooldown"
        console.log(`Heard '${vtext}'`)
        vtext = vtext.replace('bekleme süresi', "").replace('av sayacı', "").trim()

        if(vtext == "başla" || vtext == "başlat"){
            domovoi_msg += "Bekleme Sayacı Başlatıldı"
            toggle_cooldown_timer(true,false)
            send_cooldown_timer(true,false)
        } 
        else{
            domovoi_msg += "Bekleme Sayacı Durduruldu"
            toggle_cooldown_timer(false,true)
            send_cooldown_timer(false,true)
        }

        domovoi_heard(domovoi_msg)
        running_log[cur_idx]["Domo"] = domovoi_msg
        reset_voice_status()
    }
    else if(vtext.startsWith('hunt')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized hunt command")
        running_log[cur_idx]["Type"] = "hunt"
        console.log(`Heard '${vtext}'`)
        vtext = vtext.replace('hunt', "").trim()

        if(vtext == "başla" || vtext == "başlat"){
            domovoi_msg += "Av Sayacı Başladı"
            toggle_cooldown_timer(true,false)
            send_cooldown_timer(true,false)
        } 
        else{
            domovoi_msg += "Av Sayacı Durdu"
            toggle_cooldown_timer(false,true)
            send_cooldown_timer(false,true)
        }

        domovoi_heard(domovoi_msg)
        running_log[cur_idx]["Domo"] = domovoi_msg
        reset_voice_status()
    }
    else if(vtext.startsWith('avlanma süresi ')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized avlanma süresi command")
        running_log[cur_idx]["Type"] = "avlanma süresi"
        console.log(`Heard '${vtext}'`)
        vtext = vtext.replace('avlanma süresi ', "").trim()
        domovoi_msg += "avlanma süresini "

        if(document.getElementById("num_evidence").value == "-1"){

            var smallest_num = "3"
            var smallest_val = 100
            var prev_value = document.getElementById("cust_hunt_length").value
            var all_hunt_length = ["kısa","düşük","orta","uzun","yüksek"]

            for(var i = 0; i < all_hunt_length.length; i++){
                var leven_val = levenshtein_distance(all_hunt_length[i],vtext)
                if(leven_val < smallest_val){
                    smallest_val = leven_val 
                    smallest_num = all_hunt_length[i]
                }
            }
            domovoi_msg += (smallest_num + " olarak ayarlayın")

            smallest_num = {"kısa":"3A","düşük":"3A","orta":"3I","uzun":"3","yüksek":"3"}[smallest_num]
            document.getElementById("cust_hunt_length").value = smallest_num
            if(prev_value != smallest_num){
                filter()
                updateMapDifficulty(smallest_num)
                saveSettings()
            }
        }
        else{
            domovoi_msg = "özel zorluk seçili değil"
        }

        domovoi_heard(domovoi_msg)
        running_log[cur_idx]["Domo"] = domovoi_msg
        reset_voice_status()
    }
    else if(vtext.startsWith('zorluk')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized evidence set command")
        running_log[cur_idx]["Type"] = "evidence set"
        console.log(`Heard '${vtext}'`)
        vtext = vtext.replace('zorluk', "").trim()
        domovoi_msg += "etkin olan kanıt sayısı "

        vtext = vtext.replace('üç','3')
        vtext = vtext.replace('iki','2')
        vtext = vtext.replace('bir','1')
        vtext = vtext.replace('sıfır','0')

        if(document.getElementById("num_evidence").value == "-1"){
            var smallest_num = '3'
            var smallest_val = 100
            var prev_value = document.getElementById("cust_num_evidence").value
            var all_difficulty = ['0','1','2','3']

            for(var i = 0; i < all_difficulty.length; i++){
                var leven_val = levenshtein_distance(all_difficulty[i],vtext)
                if(leven_val < smallest_val){
                    smallest_val = leven_val 
                    smallest_num = all_difficulty[i]
                }
            }
            domovoi_msg += smallest_num

            document.getElementById("cust_num_evidence").value = smallest_num ?? 3
            if(prev_value != smallest_num){
                filter()
                flashMode()
                saveSettings()
            }
        }
        else{
            domovoi_msg = "özel zorluk seçili değil"
        }

        domovoi_heard(domovoi_msg)
        running_log[cur_idx]["Domo"] = domovoi_msg
        reset_voice_status()
    }
    else if(vtext.startsWith('sayı')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized evidence set command")
        running_log[cur_idx]["Type"] = "evidence set"
        console.log(`Heard '${vtext}'`)
        vtext = vtext.replace('sayı', "").trim()
        domovoi_msg += "etkin olan kanıt sayısı "

        var smallest_num = '3'
        var smallest_val = 100
        var prev_value = document.getElementById("num_evidence").value
        var all_difficulty = ["özel","kıyamet","cinnet","karabasan","profesyonel","orta","amatör"]

        for(var i = 0; i < all_difficulty.length; i++){
            var leven_val = levenshtein_distance(all_difficulty[i],vtext)
            if(leven_val < smallest_val){
                smallest_val = leven_val 
                smallest_num = all_difficulty[i]
            }
        }
        domovoi_msg += smallest_num

        smallest_num = {"özel":"-1","kıyamet":"0","cinnet":"1","karabasan":"2","profesyonel":"3","orta":"3I","amatör":"3A"}[smallest_num]
        document.getElementById("num_evidence").value = smallest_num
        if(prev_value != smallest_num){
            filter()
            updateMapDifficulty(smallest_num)
            showCustom()
            flashMode()
            saveSettings()
        }

        domovoi_heard(domovoi_msg)
        running_log[cur_idx]["Domo"] = domovoi_msg
        reset_voice_status()
    }
    else if(vtext.startsWith('menü değiş') || vtext.startsWith("menü deyiş")){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized filter/tool command")
        running_log[cur_idx]["Type"] = "değiş/deyiş"
        console.log(`Heard '${vtext}'`)
        domovoi_msg += "menüler arasında geçiş yapıldı"

        toggleFilterTools()

        domovoi_heard(domovoi_msg)
        running_log[cur_idx]["Domo"] = domovoi_msg
        reset_voice_status()
    }
    else if(vtext.endsWith('haritasını göster')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized Haritasını command")
        running_log[cur_idx]["Type"] = "Haritasını"
        console.log(`Heard '${vtext}'`)
        vtext = vtext.replace('haritasını göster', "").trim()

        var smallest_map = "tanglewood"
        var smallest_val = 100

        if(vtext != ""){

            // Common replacements for maps
            var prevtext = vtext;
            for (const [key, value] of Object.entries(ZNLANG['maps'])) {
                for (var i = 0; i < value.length; i++) {
                    if(vtext.includes(value[i])){vtext = vtext.replace(value[i],key)}
                }
            }

            var maps = document.getElementsByClassName("maps_button")

            for(var i = 0; i < maps.length; i++){
                var leven_val = levenshtein_distance(maps[i].id.toLowerCase(),vtext)
                if(leven_val < smallest_val){
                    smallest_val = leven_val 
                    smallest_map = maps[i].id
                }
            }
            console.log(`${prevtext} >> ${vtext} >> ${smallest_map}`)
            running_log[cur_idx]["Debug"] = `${prevtext} >> ${vtext} >> ${smallest_map}`
            domovoi_msg = `${smallest_map} haritasını göster`

            changeMap(document.getElementById(smallest_map),all_maps[smallest_map])
        }

        showMaps(true,false)

        domovoi_heard(domovoi_msg)
        running_log[cur_idx]["Domo"] = domovoi_msg
        reset_voice_status()
    }
    else if(vtext.endsWith('haritasını seçin')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized Haritasını command")
        running_log[cur_idx]["Type"] = "Haritasını"
        console.log(`Heard '${vtext}'`)
        vtext = vtext.replace('haritasını seçin', "").trim()

        var smallest_map = "tanglewood"
        var smallest_val = 100

        if(vtext != ""){

            // Common replacements for maps
            var prevtext = vtext;
            for (const [key, value] of Object.entries(ZNLANG['maps'])) {
                for (var i = 0; i < value.length; i++) {
                    if(vtext.includes(value[i])){vtext = vtext.replace(value[i],key)}
                }
            }

            var maps = document.getElementsByClassName("maps_button")

            for(var i = 0; i < maps.length; i++){
                var leven_val = levenshtein_distance(maps[i].id.toLowerCase(),vtext)
                if(leven_val < smallest_val){
                    smallest_val = leven_val 
                    smallest_map = maps[i].id
                }
            }
            console.log(`${prevtext} >> ${vtext} >> ${smallest_map}`)
            running_log[cur_idx]["Debug"] = `${prevtext} >> ${vtext} >> ${smallest_map}`
            domovoi_msg = `${smallest_map} haritasını seçin`
        }

        changeMap(document.getElementById(smallest_map),all_maps[smallest_map])

        domovoi_heard(domovoi_msg)
        running_log[cur_idx]["Domo"] = domovoi_msg
        reset_voice_status()
    }
    else if(vtext.startsWith('haritayı kapat') || vtext.startsWith('haritayı gizle')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized map command")
        running_log[cur_idx]["Type"] = "maps"
        console.log(`Heard '${vtext}'`)
        domovoi_msg = "harita kapatılıyor"

        showMaps(false, true)

        domovoi_heard(domovoi_msg)
        running_log[cur_idx]["Domo"] = domovoi_msg
        reset_voice_status()
    }
    else if(vtext.startsWith('rehberi sıfırla') || vtext.startsWith('sıfırlama günlüğü')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized reset command")
        console.log(`Heard '${vtext}'`)
        reset()
    }
    else if(vtext.startsWith('dinlemeyi bırak')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized stop listening command")
        console.log(`Heard '${vtext}'`)
        stop_voice()
    }
    else if(
        vtext.startsWith("merhaba domo") || vtext.startsWith("merhaba domovoi")
    ){

        domovoi_heard("merhaba!")
        reset_voice_status()
    }
    else if(
        vtext.startsWith("move domo") || vtext.startsWith("move domovoi")|| vtext.startsWith("move zero") ||
        vtext.startsWith("domo move") || vtext.startsWith("domovoi move")|| vtext.startsWith("zero move")
    ){
        if (user_settings['domo_side'] == 0){
            $("#domovoi").addClass("domovoi-flip")
            $("#domovoi-img").addClass("domovoi-img-flip")
        }
        else{
            $("#domovoi").removeClass("domovoi-flip")
            $("#domovoi-img").removeClass("domovoi-img-flip")
        }
        saveSettings()
        
        reset_voice_status()
    }
    else{
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-not-recognized.png)"
        domovoi_not_heard()
        reset_voice_status()
    }


}

if (("webkitSpeechRecognition" in window || "speechRecognition" in window) && !navigator.userAgent.toLowerCase().match(/firefox|fxios|opr/) && !('brave' in navigator)) {
    var grammar = `#JSGF V1.0; grammar words; public <word> =  ${all_ghosts.join(" | ")};`
    let speechRecognition = new webkitSpeechRecognition() || new speechRecognition()
    var speechRecognitionList = new webkitSpeechGrammarList()
    speechRecognitionList.addFromString(grammar, 1)
    console.log(speechRecognition.grammars)
    speechRecognition.grammars = speechRecognitionList
    let stop_listen = true
  
    speechRecognition.continuous = false;
    speechRecognition.interimResults = false;
    speechRecognition.lang = 'tr-TR';
  
    speechRecognition.onend = () => {
        if(!stop_listen){
            speechRecognition.start(auto=true);
        }
    }

    speechRecognition.onspeechstart = () =>{
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-listening.png)"
    }

    speechRecognition.onerror = (error) =>{
        if(error.error != "no-speech")
            console.log(error)
    }
  
    speechRecognition.onresult = (event) => {
        let final_transcript = "";
  
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final_transcript = event.results[i][0].transcript;
            }
        }

        final_transcript = final_transcript.replace(/[.,;:-]/g, '')
        parse_speech(final_transcript);
    };
    
    function start_voice(auto=false){
        stop_listen = false
        if(!auto){
            document.getElementById("start_voice").disabled = true
            document.getElementById("stop_voice").disabled = false
            document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic.png)";
            document.getElementById("voice_recognition_status").className = "pulse_animation"
            document.getElementById("voice_recognition_status").style.display = "block"
            $("#domovoi").show()
            setCookie("voice_recognition_on",true,0.0833)
        }
        speechRecognition.start();
    }

    function stop_voice(){
        stop_listen = true
        document.getElementById("start_voice").disabled = false
        document.getElementById("stop_voice").disabled = true
        document.getElementById("voice_recognition_status").style.display = "none"
        setCookie("voice_recognition_on",false,-1)
        $("#domovoi").hide()
        speechRecognition.stop();
    }

  } else {
    document.getElementById("start_voice").disabled = true
    document.getElementById("stop_voice").disabled = true
    document.getElementById("start_voice").style.display = "none"
    document.getElementById("stop_voice").style.display = "none"
    document.getElementById("voice_recognition_note").innerHTML = "Tarayıcı desteklenmiyor"
    console.log("Speech Recognition Not Available");
  }

