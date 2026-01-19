console.log("Lets start javascript")
let songs;
let currentsong = new Audio();
let currfolder;

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

async function getsongs(folder) {
    currfolder = folder;
    let a = await fetch(`/${currfolder}/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    let isFirst = true;
    for (let index = 0; index < as.length; index++) {
        if (isFirst) {
            isFirst = false;
            continue;
        }
        const element = as[index];
        
        // Extract filename from href instead of innerText to avoid timestamp
        let filename = element.href.split("/").slice(-1)[0];

        if (filename == "cover.jpg" || filename == "info.json") {
            continue;
        }

        songs.push(decodeURIComponent(filename));
    }
    let songsul = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songsul.innerHTML = ""
    for (const song of songs) {
        songsul.innerHTML = songsul.innerHTML +
            `<li><img class="invert" src="music.svg" alt="">
            <div class="info">
                <div> ${song.replaceAll("%20", " ")}</div>
                <div>songartist</div>
            </div>
            <div class="playnow">
                <span>Play now</span>
                <img src="play.svg" alt="">
            </div>
   </li>`;
    }
    // attach an event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach
        (e => {
            e.addEventListener("click", element => {
                console.log(e.querySelector(".info").firstElementChild.innerHTML);
                playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
            })

        })

}
const playmusic = (track, pause = false) => {
    currentsong.src = `/${currfolder}/` + track
    if (!pause) {
        currentsong.play()
    }
    updatePlayIcon();
    document.querySelector(".songinfo").innerHTML = track
    document.querySelector(".songtime").innerHTML = "00:00"


}
async function displayalbubs() {
    let a = await fetch(`/songs/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardcontainer = document.querySelector(".cardcontainer")
    Array.from(anchors).forEach(async e => {
        try {
            if (e.href.includes("/songs/")) {
                let folder = e.href.split("/").slice(-2)[1]

                let a = await fetch(`/songs/${folder}/info.json`)
                let response = await a.json();
                console.log(`Response: ${response}`);
                cardcontainer.innerHTML += `
                <div data-folder="${folder}" class="card" style="padding: 10px 5px;">
                        <div  class="play"><svg width="48" height="48" viewBox="0 0 120 120"
                                xmlns="http://www.w3.org/2000/svg">
                                <!-- Green circle -->
                                <circle cx="60" cy="60" r="58" fill="#2ecc71" />

                                <!-- Play button -->
                                <polygon points="50,42 50,78 82,60" fill="black" />
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" height="195" alt="">
                        <h3 style="padding-left: 35px">${response.title}</h3>
                        <p style="padding-left: 20px">${response.description}</p>
                    </div>
                    `;
                    updateEventListener();
            }
        } catch (error) {
            console.log(error)
        }
    })
}
async function main() {

    // get the list of all songs
    await getsongs("songs/Gazals")
    // playmusic(songs[0],true)

    await displayalbubs()
    //show all the songs in the playlist

}
function updatePlayIcon() {
    play.src = currentsong.paused ? "play.svg" : "pause.svg";
}
updatePlayIcon();

play.addEventListener("click", () => {
    if (currentsong.paused) {
        currentsong.play()
    }
    else {
        currentsong.pause()
    }
    updatePlayIcon();
})

currentsong.addEventListener("timeupdate", () => {
    console.log(currentsong.currentTime, currentsong.duration)
    document.querySelector(".songtime").innerHTML = `${formatTime(currentsong.currentTime)}
    /${formatTime(currentsong.duration)}`
    document.querySelector(".circle").style.left = (currentsong.currentTime /
        currentsong.duration)
        * 100 + "%";
})
document.querySelector(".seekbar").addEventListener("click", e => {
    const percent = e.offsetX / e.target.getBoundingClientRect().width;

    // move circle
    document.querySelector(".circle").style.left = percent * 100 + "%";

    // change song time
    currentsong.currentTime = percent * currentsong.duration;
});
document.querySelector(".hambeg").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0"
    document.querySelector(".library").style.left = "0"
})
document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%"
    document.querySelector(".library").style.left = "-120%"
})
previous.addEventListener("click", () => {
    let currentSongName = decodeURIComponent(
        currentsong.src.split("/").slice(-1)[0]
    );

    let index = songs.indexOf(currentSongName);

    if (index > 0) {
        playmusic(songs[index - 1]);
    }
});

next.addEventListener("click", () => {
    let currentSongName = decodeURIComponent(
        currentsong.src.split("/").slice(-1)[0]
    );

    let index = songs.indexOf(currentSongName);

    if (index < songs.length - 1) {
        playmusic(songs[index + 1]);
    }
});

function updateEventListener() {
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log(item.target, item.currentTarget.dataset)
            await getsongs(`songs/${item.currentTarget.dataset.folder}`)
    
        })
    })
}

updateEventListener()
main()