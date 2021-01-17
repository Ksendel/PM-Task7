(function () {

    function clickInsideElement(e, className) {
        let el = e.srcElement || e.target;

        if (el.classList.contains(className)) {
            return el;
        } else {
            while (el === el.parentNode) {
                if (el.classList && el.classList.contains(className)) {
                    return el;
                }
            }
        }

        return false;
    }

    function getPosition(e) {
        if (!e) e = window.event;
        return {
            x: e.pageX,
            y: e.pageY
        }
    }

    function init() {
        contextListener();
        clickListener();
        dragNDropListener()
    }

    let driveClassName = "drive-content";
    let driveItemContext;

    let fileClassName = "newFile";
    let fileItemContext;

    function contextListener() {
        document.addEventListener("contextmenu", (e) => {
            driveItemContext = clickInsideElement(e, driveClassName);
            fileItemContext = clickInsideElement(e, fileClassName);

            if (driveItemContext) {
                e.preventDefault();
                toggleMenuOn();
                positionMenuFile(e, menu);
            } else if (fileItemContext) {
                e.preventDefault();
                console.log("fileItemContext.id: " + fileItemContext.id)
                toggleMenuOnFile(fileItemContext.id);
                positionMenuFile(e, menuFile);
                // console.log(`menu item ${fileItemContext.id}`)
            } else {
                driveItemContext = null;
                toggleMenuOff();
                fileItemContext = null;
                toggleMenuOffFile();
            }

        });

    }

    let contextMenuLinkDrive = "context-menu__link";
    let contextMenuActive = "context-menu--active";

    let contextMenuLinkFile = "context-menu__link-2";
    let contextMenuActive2 = "context-menu-2--active";

    function clickListener() {
        document.addEventListener("click", (e) => {
            let clickElIsLink = clickInsideElement(e, contextMenuLinkDrive)
            let clickElIsLink2 = clickInsideElement(e, contextMenuLinkFile)


            if (clickElIsLink) {
                e.preventDefault();
                menuItemListener(clickElIsLink);
            } else if (clickElIsLink2) {
                e.preventDefault();
                menuItemListener(clickElIsLink2);
            } else {
                let button = e.which || e.button;
                if (button === 1) {
                    toggleMenuOff();
                }
            }
        });
    }

    let menu = document.querySelector(".context-menu");
    let menuFile = document.querySelector(".context-menu-2");

    let menuState = 0;
    let menuWidth;
    let menuHeight;
    let selectedFile;

    function toggleMenuOn() {
        console.log("Menu on")
        if (menuState !== 1) {
            menuState = 1;
            menu.classList.add(contextMenuActive);
        }
    }

    function toggleMenuOff() {
        console.log("Menu off")
        if (menuState !== 0) {
            menuState = 0;
            menu.classList.remove(contextMenuActive);
        }
    }

    function toggleMenuOnFile(fileItemId) {
        console.log("Menu on - 2")
        if (menuState !== 1) {
            menuState = 1;
            menuFile.classList.add(contextMenuActive2);
            selectedFile = fileItemId
        }
    }

    function toggleMenuOffFile() {
        console.log("Menu off - 2")
        if (menuState !== 0) {
            menuState = 0;
            menuFile.classList.remove(contextMenuActive2);
            selectedFile = null
        }
    }

    function positionMenuFile(e, menuElement) {
        let clickCoords;
        let clickCoordsX;
        let clickCoordsY;

        let windowWidth;
        let windowHeight;

        clickCoords = getPosition(e);
        clickCoordsX = clickCoords.x;
        clickCoordsY = clickCoords.y;

        menuWidth = menuElement.offsetWidth + 4;
        menuHeight = menuElement.offsetHeight + 4;

        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;

        if ((windowWidth - clickCoordsX) < menuWidth) {
            menuElement.style.left = windowWidth - menuWidth + "px";
        } else {
            menuElement.style.left = clickCoordsX + "px";
        }

        if ((windowHeight - clickCoordsY) < menuHeight) {
            menuElement.style.top = windowHeight - menuHeight + "px";
        } else {
            menuElement.style.top = clickCoordsY + "px";
        }
    }

    const menuItemOptions = {
        AddFile: "ADD_FILE",
        DeleteFile: "DELETE_FILE",
        RenameFile: "RENAME_FILE"
    }

    function menuItemListener(link) {
        if (link.getAttribute("data-action") === menuItemOptions.AddFile) {
            console.log('add')
            driveItemContext.appendChild(addFile())
            toggleMenuOff();
        } else if (link.getAttribute("data-action") === menuItemOptions.DeleteFile) {
            console.log("Deleted file: " + selectedFile)
            deleteFile()
            document.getElementById(selectedFile).remove()
            toggleMenuOffFile();
        } else if (link.getAttribute("data-action") === menuItemOptions.RenameFile) {
            console.log("Rename file: " + selectedFile)
            document.getElementById(selectedFile).innerHTML = prompt('\n' +
                'Enter a new filename:')
            toggleMenuOffFile();
        }
    }

    let fileList = []

    function addFile() {

        let newDiv = document.createElement('div');

        newDiv.className = 'newFile';
        newDiv.draggable = true;
        let fileName = newDiv.innerHTML = prompt('Enter file name', '1.txt')
        newDiv.id = fileName

        if (fileName === '') {
            return alert("Enter file name again.")
        }
        else if (fileList.includes(newDiv.id) === false) {
            fileList.push(newDiv.id)
        } else {
            return alert("Such file already exists")
        }

        return newDiv
    }

    function deleteFile() {
        let fileId = selectedFile
        fileList = fileList.filter((n) => {
            return n !== fileId
        })
    }


    function dragNDropListener() {

        const tasksListElement = document.querySelector(`.drive-content`);
        const taskElements = tasksListElement.querySelectorAll(`.newFile`);


        console.log("taskElements" + Array.of(taskElements.entries()))
        console.log("tasksListElement" + tasksListElement)

        tasksListElement.addEventListener(`dragstart`, (evt) => {
            console.log("tasksListElement event 1" + evt.target)
            evt.target.classList.add(`selected`);
        });

        tasksListElement.addEventListener(`dragend`, (evt) => {
            console.log("tasksListElement event 2" + evt.target)
            evt.target.classList.remove(`selected`);
        });

        const getNextElement = (cursorPosition, currentElement) => {
            const currentElementCoord = currentElement.getBoundingClientRect();
            const currentElementCenter = currentElementCoord.y + currentElementCoord.height / 2;

            const nextElement = (cursorPosition < currentElementCenter) ?
                currentElement :
                currentElement.nextElementSibling;

            return nextElement;
        };

        tasksListElement.addEventListener(`dragover`, (evt) => {
            evt.preventDefault();

            const activeElement = tasksListElement.querySelector(`.selected`);
            const currentElement = evt.target;
            console.log("Current element " + currentElement)
            const isMoveable = activeElement !== currentElement &&
                currentElement.classList.contains(`newFile`);

            if (!isMoveable) {
                return;
            }

            const nextElement = getNextElement(evt.clientY, currentElement);

            if (
                nextElement &&
                activeElement === nextElement.previousElementSibling ||
                activeElement === nextElement
            ) {
                return;
            }

            tasksListElement.insertBefore(activeElement, nextElement);

        });
    }

    init();

})();
