function newVideoLoaded() {
  const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];
  if (bookmarkBtnExists) return;
  const newBookmarkBtn = document.createElement("img");
  const bookmarkImage = chrome.runtime.getURL("assets/bookmark.png");
  newBookmarkBtn.classList.add("bookmark-btn");
  newBookmarkBtn.src = bookmarkImage;
  const youtubeLeftControlsButtons =
    document.getElementsByClassName("ytp-left-controls")[0];
  const youtubePlayer = document.getElementsByClassName("video-stream")[0];
  youtubeLeftControlsButtons.prepend(newBookmarkBtn);
  newBookmarkBtn.addEventListener("click", (event) => {
    console.log("image button clicked...");
  });
}

function contentScript() {
  let youtubeLeftVideoControl,
    currentPage,
    currentVideoId = "";
  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, videoId, value } = obj;
    currentVideoId = videoId;
    newVideoLoaded();
  });
}

contentScript();
