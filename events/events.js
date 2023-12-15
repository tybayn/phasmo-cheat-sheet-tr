function uncover(elem){
    var e = $(elem).find(".curtain")[0]
    $(e).fadeToggle(500)
}

$(window).on('load', function() {
    fetch("data/event_0930.json", {signal: AbortSignal.timeout(6000)})
    .then(data => data.json())
    .then(data => {
        if(data['version'] != false){
            document.getElementById("event_title").innerText = data['title']
            document.getElementById("event_details").innerHTML = data['content']
        }
    })
    .catch(error => {
        // Om nom nom
    })
})