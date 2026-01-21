// Looking at your code, I can see several issues causing songs not to play properly:

// ## Main Problems:

// 1. **Incorrect path in `playmusic` function** - You're setting `currentsong.src = track` but `track` already contains the full path. You don't need to add `currfolder` again.

// 2. **Path mismatch** - In `getsongs()`, you're storing URLs directly from JSON, but in `playmusic()`, you're not constructing the correct path.

// 3. **`updateEventListener()` path issue** - You're using `./songs/` which creates a wrong path.

// Here's the corrected JavaScript code:

// ```javascript
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
    let a = await fetch(`${folder}/info.json`)
    let response = await a.text()
    let _songs = JSON.parse(response).songs;

    songs = []

    _songs.forEach((e) => {
        // Store complete path with folder
        songs.push({ 
            "name": e.name, 
            "url": `${folder}/${decodeURIComponent(e.url)}` 
        });

        console.log(`Song: ${e.name} - ${folder}/${e.url}`);
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
                console.log(`Playing: ${songs[index].name}`);
                playmusic(songs[index].url, songs[index].name);
            })
        })
    
    return songs;
}

const playmusic = (track, song_name = "", pause = false) => {
    console.log(`Playing track: ${track}`)
    currentsong.src = track;  // track already has full path
    if (!pause) {
        currentsong.play()
            .catch(err => console.error("Playback error:", err));
    }
    updatePlayIcon();
    document.querySelector(".songinfo").innerHTML = song_name
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayalbubs() {
    let a = await fetch(`./songs/PlaylistInfo.json`)
    let response = await a.text()

    let playlists = JSON.parse(response).Playlists;

    console.log(`Playlists found: ${playlists.length}`)

    let cardcontainer = document.querySelector(".cardcontainer")
    
    for(const e of playlists) {
        try {
            console.log(`Loading playlist: ${e}`)
            let a = await fetch(`./songs/${e}/info.json`)
            let response = await a.text();
            let info = JSON.parse(response);
            let title = info.title;
            let description = info.description;

            cardcontainer.innerHTML += `
                <div data-folder="${e}" class="card" style="padding: 0px 5px;">
                    <div class="play">
                        <svg width="48" height="48" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="60" cy="60" r="58" fill="#2ecc71" />
                            <polygon points="50,42 50,78 82,60" fill="black" />
                        </svg>
                    </div>
                    <img src="./songs/${e}/cover.jpg" height="195" alt="">
                    <h3 style="padding-left: 35px">${title}</h3>
                    <p style="padding-left: 20px">${description}</p>
                </div>`;

        } catch (error) {
            console.log(`Error loading playlist ${e}:`, error)
        }
    }
    
    // Update event listeners after all cards are added
    updateEventListener();
}

async function main() {
    // get the list of all songs
    await getsongs("songs/Gazals")
    
    await displayalbubs()
}

function updatePlayIcon() {
    let play = document.getElementById("play");
    play.src = currentsong.paused ? "play.svg" : "pause.svg";
}

// Initialize play button
document.addEventListener("DOMContentLoaded", () => {
    updatePlayIcon();
});

document.getElementById("play").addEventListener("click", () => {
    if (currentsong.paused) {
        currentsong.play()
            .catch(err => console.error("Play error:", err));
    }
    else {
        currentsong.pause()
    }
    updatePlayIcon();
})

currentsong.onended = () => {
    console.log("Song has ended");

    let index = getCurrentSongIndex();
    if (index !== -1 && index < songs.length - 1) {
        playmusic(songs[index + 1].url, songs[index + 1].name);
    }
}

currentsong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${formatTime(currentsong.currentTime)} / ${formatTime(currentsong.duration)}`
    
    if (currentsong.duration) {
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    }
})

document.querySelector(".seekbar").addEventListener("click", e => {
    const percent = e.offsetX / e.target.getBoundingClientRect().width;
    document.querySelector(".circle").style.left = percent * 100 + "%";
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
    if (!currentsong.src) return -1;
    
    let currentSrc = decodeURIComponent(currentsong.src);
    return songs.findIndex(song => currentSrc.includes(song.url) || song.url.includes(currentSrc.split('/').slice(-2).join('/')));
}

document.getElementById("previous").addEventListener("click", () => {
    let index = getCurrentSongIndex();
    if (index > 0) {
        playmusic(songs[index - 1].url, songs[index - 1].name);
    }
});

document.getElementById("next").addEventListener("click", () => {
    let index = getCurrentSongIndex();
    if (index !== -1 && index < songs.length - 1) {
        playmusic(songs[index + 1].url, songs[index + 1].name);
    }
});

function updateEventListener() {
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log("Card clicked:", item.currentTarget.dataset.folder)
            await getsongs(`songs/${item.currentTarget.dataset.folder}`)

            //Show Drawer
            document.querySelector(".left").style.left = "0"
            document.querySelector(".library").style.left = "0"
        })
    })
}

updateEventListener()
main()

// ## Key Changes Made:

// 1. **Fixed path construction** - Now songs store complete path: `${folder}/${url}`
// 2. **Removed double path** in `playmusic()` - Just use the track parameter directly
// 3. **Fixed `updateEventListener()`** - Removed `./` from path
// 4. **Added error handling** for audio playback
// 5. **Fixed `getCurrentSongIndex()`** - Better matching logic
// 6. **Used `getElementById`** for play/previous/next buttons for reliability
// 7. **Added checks** for index validity before playing next/previous

// Make sure your folder structure looks like this:
// ```
// songs/
//   ├── Gazals/
//   │   ├── info.json
//   │   ├── cover.jpg
//   │   └── song1.mp3
//   └── PlaylistInfo.json
// ```