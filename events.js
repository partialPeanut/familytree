// Allows a tab to be clicked, displaying link (DEPRECATED: Now use jQueryUI)
/*
function makeTabbable(ele, link) {
    const clickedTabHandler = function() {
        containerTabs = document.getElementsByClassName("containerTab")
        for (i = 0; i < containerTabs.length; i++) {
            containerTabs[i].style.height = "0%"
        }
        link.style.height = "100%"

        tabs = document.getElementsByClassName("tabForContainer")
        for (i = 0; i < tabs.length; i++) {
            tabs[i].classList.remove('active')
        }
        ele.classList.add('active')
    }

    ele.addEventListener('click', clickedTabHandler)
}
*/

// Handles scroll locking on resize
atResizeStart = true
var atResizeEnd
function onResizeEvent() {
    if (atResizeStart) {
        containers.forEach(container => setScrollLock(container))
        atResizeStart = false
    }
    
    containers.forEach(container => goToScrollLock(container))

    clearTimeout(atResizeEnd)
    atResizeEnd = setTimeout(function() {
        atResizeStart = true
    }, 100)
}

// Allows an element to be grabbed and dragged to scroll
function makeDraggable(ele) {
    pos = { top: 0, left: 0, x: 0, y: 0 }

    const mouseDownHandler = function(e) {
        pos = {
            // The current scroll
            left: ele.scrollLeft,
            top: ele.scrollTop,
            // Get the current mouse position
            x: e.clientX,
            y: e.clientY,
        }

        ele.style.cursor = 'grabbing'
        ele.style.userSelect = 'none'
        document.addEventListener('mousemove', mouseMoveHandler)
        document.addEventListener('mouseup', mouseUpHandler)
    }

    const mouseMoveHandler = function(e) {
        const dx = e.clientX - pos.x
        const dy = e.clientY - pos.y

        ele.scrollTop = pos.top - dy
        ele.scrollLeft = pos.left - dx
    }

    const mouseUpHandler = function() {
        ele.style.cursor = 'grab'
        ele.style.removeProperty('user-select')

        document.removeEventListener('mousemove', mouseMoveHandler)
        document.removeEventListener('mouseup', mouseUpHandler)
    }

    ele.addEventListener('mousedown', mouseDownHandler)
}

// Allows a name to be clicked on
function addNameClicker(ele, sib) {
    const clickedNameHandler = function(e) {
        tabData = {
            tabType: "nameTab",
            name: sib.name,
            pledgeClass: sib.pledgeClass,
            house: sib.house,
            tags: sib.tags,
            bigName: sib.bigName,
            littleNames: sib.littleNames,
            div: ele
        }
        showTab(tabData)
    }

    ele.addEventListener('click', clickedNameHandler)
}

// Allows a tag to be clicked on
function addTagClicker(ele, tag) {
    const clickedTagHandler = function(e) {
        tabData = {
            tabType: "tagTab",
            name: tag.name,
            imgSrc: tag.imageAddress ? "https://drive.google.com/thumbnail?id=" + tag.imageAddress : undefined,
            description: tag.description,
            taggedSibs: tag.taggedSibs,
            relatedTags: tag.relatedTags,
            div: ele
        }
        showTab(tabData)
    }

    ele.addEventListener('click', clickedTagHandler)
}