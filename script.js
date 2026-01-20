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
    let a = await fetch(`/${folder}/info.json`)
    let response = await a.text()
    let _songs = JSON.parse(response).songs;

    let div = document.createElement("div")
    div.innerHTML = response;
    songs = []

    _songs.forEach((e) => {
        songs.push({
    name: e.name,
    url: encodeURI(e.url)
});


        console.log(`Song: ${e.url}`);
    });

    let songsul = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songsul.innerHTML = ""
    for (const song of songs) {
        songsul.innerHTML = songsul.innerHTML +
            `<li><img class="invert" src="music.svg" alt="">
            <div class="info">
                <div>${song.name}</div>
                <div>songartist</div>
            </div>
            <div class="playnow">
                <span>Play now</span>
                <img src="play.svg" alt="">
            </div>
   </li>`;
    }

    // attach an event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li"))
        .forEach((e, index) => {
            e.addEventListener("click", element => {
                console.log(element.innerHTML)
                console.log(`Name: ${songs[index].name}, URL: ${songs[index].url}`);
                playmusic(songs[index].url, songs[index].name);
            })
        })
}

const playmusic = (track, song_name = "", pause = false) => {
    const safeTrack = encodeURI(track);
    currentsong.src = `/${safeTrack}`;

    if (!pause) {
        currentsong.play().catch(err => console.log(err));
    }

    updatePlayIcon();
    document.querySelector(".songinfo").innerHTML = song_name;
    document.querySelector(".songtime").innerHTML = "00:00";
};


    if (!pause) {
        currentsong.play()
    }
    updatePlayIcon();
    document.querySelector(".songinfo").innerHTML = song_name
    document.querySelector(".songtime").innerHTML = "00:00"


async function displayalbubs() {
    let a = await fetch(`/songs/PlaylistInfo.json`)
    let response = await a.text()

    let playlists = JSON.parse(response).Playlists;

    console.log(`Info: ${playlists}`)

    // let div = document.createElement("div")
    // div.innerHTML = response;
    // let anchors = div.getElementsByTagName("a")
    let cardcontainer = document.querySelector(".cardcontainer")
    Array.from(playlists).forEach(async e => {
        try {
            console.log(e)
            let a = await fetch(`/songs/${e}/info.json`)
            let response = await a.text();
            let title = JSON.parse(response).title;
            let description = JSON.parse(response).description;
            console.log(`Response: ${JSON.parse(response).songs[0].url}`);

            cardcontainer.innerHTML += `
                <div data-folder="${e}" class="card" style="padding: 0px 5px;">
                        <div  class="play"><svg width="48" height="48" viewBox="0 0 120 120"
                                xmlns="http://www.w3.org/2000/svg">
                                <!-- Green circle -->
                                <circle cx="60" cy="60" r="58" fill="#2ecc71" />

                                <!-- Play button -->
                                <polygon points="50,42 50,78 82,60" fill="black" />
                            </svg>
                        </div>
                        <img src="/songs/${e}/cover.jpg" height="195" alt="">
                        <h3 style="padding-left: 35px">${title}</h3>
                        <p style="padding-left: 20px">${description}</p>
                    </div>
                    `;
            updateEventListener();

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

currentsong.onended = () => {
    console.log("THis song has eneded");

    function getCurrentSongIndex() {
    let currentFile = decodeURIComponent(currentsong.src.split("/").pop());
    return songs.findIndex(song =>
        decodeURIComponent(song.url).includes(currentFile)
    );
}

}

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
});

function getCurrentSongIndex() {
    let currentFile = decodeURIComponent(currentsong.src.split("/").pop());
    return songs.findIndex(song => song.url.includes(currentFile));
}

previous.addEventListener("click", () => {
    let index = getCurrentSongIndex();
    if (index > 0) {
        playmusic(songs[index - 1].url, songs[index - 1].name);
    }
});

next.addEventListener("click", () => {
    let index = getCurrentSongIndex();
    if (index < songs.length - 1) {
        playmusic(songs[index + 1].url, songs[index + 1].name);
    }
});

function updateEventListener() {
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log(item.target, item.currentTarget.dataset)
            await getsongs(`songs/${item.currentTarget.dataset.folder}`)

            //Show Drawer
            document.querySelector(".left").style.left = "0"
            document.querySelector(".library").style.left = "0"
        })
    })
}

updateEventListener()
main()