const bookmarkImgURL = chrome.runtime.getURL("assets/bookmark.png");
const AZ_PROBLEM_KEY = "AZ_PROBLEM_KEY";

const observer = new MutationObserver(() => {
    addBookmarkButton();
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

addBookmarkButton();

function onProblemsPage() {
    return window.location.pathname.includes("/problems/");
}

function addBookmarkButton() {
    if (!onProblemsPage()) {
        return;
    }

    if (document.getElementById("add-bookmark-button")) {
        return;
    }

    const heading = document.querySelector("h1");

    if (!heading || !heading.parentElement) {
        return;
    }

    const bookmarkButton = document.createElement("img");

    bookmarkButton.id = "add-bookmark-button";
    bookmarkButton.src = bookmarkImgURL;

    bookmarkButton.style.height = "32px";
    bookmarkButton.style.width = "32px";
    bookmarkButton.style.cursor = "pointer";
    bookmarkButton.style.marginLeft = "12px";
    bookmarkButton.style.verticalAlign = "middle";

    heading.parentElement.appendChild(bookmarkButton);

    bookmarkButton.addEventListener("click", addNewBookmarkHandler);
}

async function addNewBookmarkHandler() {
    const currentBookmarks = await getCurrentBookmarks();

    const azProblemUrl = window.location.href;

    const uniqueId = extractUniqueId(azProblemUrl);

    const problemName =
        document.querySelector("h1")?.innerText || "Problem";

    const alreadyBookmarked = currentBookmarks.some(
        (bookmark) => bookmark.id === uniqueId
    );

    if (alreadyBookmarked) {
        return;
    }

    const bookmarkObj = {
        id: uniqueId,
        name: problemName,
        url: azProblemUrl
    };

    const updatedBookmarks = [
        ...currentBookmarks,
        bookmarkObj
    ];

    chrome.storage.sync.set(
        {
            [AZ_PROBLEM_KEY]: updatedBookmarks
        },
        () => {
            console.log("Bookmarks updated successfully");
        }
    );
}

function extractUniqueId(url) {
    const start =
        url.indexOf("problems/") + "problems/".length;

    const end = url.indexOf("?", start);

    return end === -1
        ? url.substring(start)
        : url.substring(start, end);
}

function getCurrentBookmarks() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(
            [AZ_PROBLEM_KEY],
            (results) => {
                resolve(results[AZ_PROBLEM_KEY] || []);
            }
        );
    });
}