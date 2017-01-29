$(document).ready(() => {
    if (sessionStorage.location) {
        search(sessionStorage.location)
    }
    
    $("#search-button").click(() => {
        search($("#search-input").val())
    })
    $("#search-input").keypress(e => {
        if (e.key==="Enter") {
            search($("#search-input").val())
        }
    })
    
    function search(searchInput) {
        sessionStorage.setItem("location", searchInput)
        console.log(sessionStorage.location)
        $.ajax({
            type: "GET",
            url: "https://nightlife-yogaboll.herokuapp.com/yelp?location=" + searchInput, //Change this to the other way
            dataType: 'json',
            success: function(data) { //Should be arrow function
                console.log("Your request succeeded!");
                console.log(data)
                $("#list").empty()
                data.forEach(val => {
                    let thumbnail = val.image_url.replace("/o.jpg", "/ms.jpg")
                    $("#list").append(
                        `<div id="${val.id}" class="list-item"><img src="${thumbnail}" alt=""><a href="${val.url}" target="_blank">${val.name}</a><span class="rsvp btn btn-default btn-xs">${val.isGoing.length} going</span></div>`
                    )
                })
                $(".rsvp").click((e) => { //Maybe spin this off into a function some place else
                    console.log(e.target.parentElement.id)
                    let id = e.target.parentElement.id
                    $.ajax({
                        type: "GET",
                        url: "https://nightlife-yogaboll.herokuapp.com/yelp/write",
                        dataType: "json",
                        data: {id: id},
                        success: data => {
                            if (!data) {
                                return window.location.replace("/auth/twitter") //This is so hacky really bad
                            }
                            $(e.target).html(data.isGoing.length + " going")
                        },
                        error: function(data) {
                            console.log("!!dEV: Your Request ended in an error");
                            console.log(data)
                        }
                    })
                    
                })
                
            },
            error: function(data) {
                console.log("Your Request ended in an error");
                console.log(data)
            }
        })
    }

    function rsvp() {
        console.log(this)
        console.log("knappen funkar")
    }
})
