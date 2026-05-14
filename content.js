const bookmarkImgURL = chrome.runtime.getURL("assets/bookmark.png");
const AZ_PROBLEM_KEY = "AZ_PROBLEM_KEY";

const observer = new MutationObserver(() => {
    addBookmarkButton();
});

observer.observe(document.body, { childList: true, subtree: true });

addBookmarkButton();

function onProblemsPage() {
    return window.location.pathname.startsWith("/problems/");
}

function addBookmarkButton() {
    console.log("Triggering");

    if (!onProblemsPage() || document.getElementById("add-bookmark-button")) {
        return;
    }

    const bookmarkButton = document.createElement("img");
    bookmarkButton.id = "add-bookmark-button";
    bookmarkButton.src = bookmarkImgURL;
    bookmarkButton.style.height = "30px";
    bookmarkButton.style.width = "30px";
    bookmarkButton.style.cursor = "pointer";

    const askDoubtButton = document.getElementsByClassName(
        "coding_ask_doubt_button__FjwXJ"
    )[0];

    if (!askDoubtButton || !askDoubtButton.parentNode) {
        return;
    }

    askDoubtButton.parentNode.insertAdjacentElement(
        "afterend",
        bookmarkButton
    );

    bookmarkButton.addEventListener("click", addNewBookmarkHandler);
}

async function addNewBookmarkHandler() {
    const currentBookmarks = await getCurrentBookmarks();

    const azProblemUrl = window.location.href;
    const uniqueId = extractUniqueId(azProblemUrl);

    const headingElement = document.getElementsByClassName(
        "Header_resource_heading__cpRp1"
    )[0];

    const problemName = headingElement
        ? headingElement.innerText
        : "Untitled Problem";

    const alreadyBookmarked = currentBookmarks.some(
        (bookmark) => bookmark.id === uniqueId
    );

    if (alreadyBookmarked) {
        return;
    }

    const bookmarkObj = {
        id: uniqueId,
        name: problemName,
        url: azProblemUrl,
    };

    const updatedBookmarks = [...currentBookmarks, bookmarkObj];

    chrome.storage.sync.set(
        { [AZ_PROBLEM_KEY]: updatedBookmarks },
        () => {
            console.log(
                "Bookmarks updated successfully:",
                updatedBookmarks
            );
        }
    );
}

function extractUniqueId(url) {
    const start = url.indexOf("problems/") + "problems/".length;
    const end = url.indexOf("?", start);

    return end === -1
        ? url.substring(start)
        : url.substring(start, end);
}

function getCurrentBookmarks() {
    return new Promise((resolve) => {
        chrome.storage.sync.get([AZ_PROBLEM_KEY], (results) => {
            resolve(results[AZ_PROBLEM_KEY] || []);
        });
    });
}