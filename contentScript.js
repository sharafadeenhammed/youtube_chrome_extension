let youtubeLeftVideoControl,
  youtubePlayer,
  bookmarks = [],
  currentVideoId = "";

function secondsToTimeConverter(timeInSeconds = 0) {
  const miniteInSeconds = 60;
  const hoursInSeconds = 60 * miniteInSeconds;
  // formt time in seconds 0:00
  if (timeInSeconds < miniteInSeconds)
    return `0:${
      timeInSeconds < 10
        ? `0${Math.floor(timeInSeconds)}`
        : Math.floor(timeInSeconds)
    }`;
  else if (timeInSeconds < hoursInSeconds) {
    // format time in minites 12:45
    const minites = Math.floor(timeInSeconds / miniteInSeconds);
    const seconds = Math.floor(timeInSeconds % miniteInSeconds);
    return `${minites < 10 ? `0${minites}` : minites}:${
      seconds < 10 ? `0${seconds}` : seconds
    }`;
  } else {
    // format time in hours 1:30:45
    const hourModulos = timeInSeconds % hoursInSeconds;
    const hours = Math.floor(timeInSeconds / hoursInSeconds);
    const minites = Math.floor(hourModulos / miniteInSeconds);
    const seconds = Math.floor(hourModulos % miniteInSeconds);
    return `${hours < 10 ? `0${hours}` : hours}:${minites}:${
      seconds < 10 ? `0${seconds}` : seconds
    }`;
  }
}

async function newVideoLoaded() {
  console.log("video id from newVideoLoaded: ", currentVideoId);
  if (currentVideoId) bookmarks = await getBookmarks();
  const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];
  if (bookmarkBtnExists) return;
  console.log("initial bookmarks: ", bookmarks);
  const newBookmarkBtn = document.createElement("img");
  const bookmarkImage = chrome.runtime.getURL("assets/bookmark.png");
  newBookmarkBtn.classList.add("bookmark-btn");
  newBookmarkBtn.classList.add("ytp-button");
  newBookmarkBtn.src = bookmarkImage;
  newBookmarkBtn.title = "Click to bookmark current timestamp";
  const youtubeLeftControlsButtons =
    document.getElementsByClassName("ytp-left-controls")[0];
  youtubeLeftControlsButtons.prepend(newBookmarkBtn);
  youtubeLeftVideoControl = youtubeLeftControlsButtons;
  const youtubeMediaPlayer = document.getElementsByClassName("video-stream")[0];
  youtubePlayer = youtubeMediaPlayer;
  newBookmarkBtn.addEventListener("click", addBookmarkEventHandeler);
}

function getBookmarks() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get([currentVideoId], function (result) {
      resolve(result[currentVideoId] ? JSON.parse(result[currentVideoId]) : []);
    });
  });
}
async function requestStoragePermission() {
  try {
    await document.requestStorageAccessFor(window.location.origin);
    // await document.requestStorageAccess();
    console.log("Storage access granted!");
    // Now you can access your first-party storage
  } catch (error) {
    console.error("Storage access denied:", error);
  }
}

async function addBookmarkEventHandeler(event) {
  event.preventDefault();
  await requestStoragePermission();
  const currentTime = youtubePlayer.currentTime;
  const newBookmark = {
    time: currentTime,
    desc: `Bookmarked at ${secondsToTimeConverter(currentTime)}`,
  };
  // bookmarks = await getBookmarks();
  console.log("recents bookmarks: ", bookmarks);
  const stringifiedBookmarksData = JSON.stringify(
    [...bookmarks, newBookmark].sort((a, b) => a.time - b.time)
  );
  console.log("new video bookmark: ", newBookmark);
  // update video bookmarked list on chrome storage
  chrome.storage.sync.set({ [currentVideoId]: stringifiedBookmarksData });
}

function contentScript() {
  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, videoId, value, time } = obj;
    if (type === "NEW") {
      currentVideoId = videoId;
      newVideoLoaded();
    } else if (type === "PLAY") {
      console.log("video id from content script: ", time, videoId);
      youtubePlayer.currentTime = time;
      // youtubePlayer.play();
    }
  });
}

contentScript();
newVideoLoaded();
