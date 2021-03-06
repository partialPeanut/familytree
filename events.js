// Allows an element to act as a resizer of its two adjacent elements
function makeResizer(ele) {
    var x, y, direction, leftSide, leftWidth, leftHeight

    const mouseDownHandler = function(e) {
        x = e.clientX
        y = e.clientY

        direction = ele.getAttribute('resize-direction')
        leftSide = ele.previousElementSibling

        leftRect = leftSide.getBoundingClientRect()
        leftWidth = leftRect.width
        leftHeight = leftRect.height

        document.addEventListener('mousemove', mouseMoveHandler)
        document.addEventListener('mouseup', mouseUpHandler)
    }

    const mouseMoveHandler = function(e) {
        const dx = e.clientX - x
        const dy = e.clientY - y

        switch (direction) {
            case 'vertical':
                percentFactor = 100 / ele.parentNode.getBoundingClientRect().height
                const leftH = (leftHeight + dy) * percentFactor
                leftSide.style.height = `${leftH}%`
                break
            case 'horizontal':
            default:
                percentFactor = 100 / ele.parentNode.getBoundingClientRect().width
                const leftW = (leftWidth + dx) * percentFactor
                leftSide.style.width = `${leftW}%`
                break
        }
    
        const cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize'
        ele.style.cursor = cursor
        document.body.style.cursor = cursor
    
        document.body.style.userSelect = 'none'
        document.body.style.pointerEvents = 'none'
    }

    const mouseUpHandler = function() {
        ele.style.removeProperty('cursor')
        document.body.style.removeProperty('cursor')
    
        document.body.style.removeProperty('user-select')
        document.body.style.removeProperty('pointer-events')
    
        document.removeEventListener('mousemove', mouseMoveHandler)
        document.removeEventListener('mouseup', mouseUpHandler)
    }

    ele.addEventListener('mousedown', mouseDownHandler)
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
            div: ele
        }
        showTab(tabData)
    }

    ele.addEventListener('click', clickedTagHandler)
}