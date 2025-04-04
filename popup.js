import { getCurrentActiveTab } from "./utils.js";
let currentVideoId = "";

function addNewBookmark(bookmarksContainer, bookmark) {
  const newBookmarkContainer = document.createElement("div");
  const newBookmarkControls = document.createElement("div");
  const bookmarkTitle = document.createElement("p");
  bookmarkTitle.className = "bookmark-title";
  bookmarkTitle.textContent = bookmark.desc;
  newBookmarkContainer.id = `bookmark-${bookmark.time}`;
  newBookmarkContainer.className = "bookmark";
  newBookmarkContainer.setAttribute("timestamp", bookmark.time);
  newBookmarkContainer.appendChild(bookmarkTitle);
  newBookmarkControls.className = "bookmark-controls";
  setBookmarkAttributes("play", () => onPlay(bookmark), newBookmarkControls);
  setBookmarkAttributes(
    "delete",
    () => onDelete(bookmark),
    newBookmarkControls
  );
  newBookmarkContainer.appendChild(newBookmarkControls);
  bookmarksContainer.appendChild(newBookmarkContainer);
}

function viewBookmarks(currentBookmarks = [], activeTab) {
  const bookmarksContainer = document.getElementById("bookmarks");
  bookmarksContainer.innerHTML = "";
  bookmarksContainer.textContent = "";
  const header = document.createElement("p");
  // header.className = "title";
  if (currentBookmarks.length === 0) {
    return (header.textContent = "no bookmarks saved for this video");
  }
  currentBookmarks.map((item, index) => {
    addNewBookmark(bookmarksContainer, item);
  });
}

async function onPlay(bookmark) {
  const tab = await getCurrentActiveTab();
  chrome.tabs.sendMessage(tab.id, {
    type: "PLAY",
    time: bookmark.time,
  });
}

function onDelete(bookmark) {
  chrome.storage.sync.get([currentVideoId], (data) => {
    const currentBookmarks = data[currentVideoId]
      ? JSON.parse(data[currentVideoId])
      : [];
    const newBookmarks = Array.from(currentBookmarks).filter(
      (item) => item.time !== bookmark.time
    );
    chrome.storage.sync.set({ [currentVideoId]: JSON.stringify(newBookmarks) });
    viewBookmarks(newBookmarks, currentVideoId);
  });
}

function setBookmarkAttributes(src, eventHandeler, controlsParentContainer) {
  const controlElement = document.createElement("img");
  controlElement.src = `./assets/${src}.png`;
  controlElement.addEventListener("click", eventHandeler);
  controlElement.title = src;
  controlsParentContainer.appendChild(controlElement);
}

document.addEventListener("DOMContentLoaded", async function () {
  const activeTab = await getCurrentActiveTab();
  const queryParameters = String(activeTab.url).split("?")[1];
  const searchParams = new URLSearchParams(queryParameters);
  const videoID = searchParams.get("v");
  currentVideoId = videoID;
  if (activeTab.url.includes("youtube.com/watch") && videoID) {
    chrome.storage.sync.get([videoID], (data) => {
      const currentBookmarks = data[videoID] ? JSON.parse(data[videoID]) : [];
      viewBookmarks(currentBookmarks, activeTab);
    });
  } else {
    document.getElementById(
      "main-container"
    ).innerHTML = `<p class="title" >This is not a youtube video page. </p>`;
  }
});
