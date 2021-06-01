// Allows an element to act as a resizer of its two adjacent elements
function makeResizer(ele) {
    const mouseDownHandler = function(e) {
        const x = e.clientX
        const y = e.clientY

        direction = ele.getAttribute('resize-direction')
        leftSide = ele.previousElementSibling
        rightSide = ele.nextElementSibling

        leftRect = leftSide.getBoundingClientRect()
        leftWidth = leftRect.width
        leftHeight = leftRect.height

        rightRect = rightSide.getBoundingClientRect()
        rightWidth = rightRect.width
        rightHeight = rightRect.height

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
                const rightH = (rightHeight - dy) * percentFactor
                leftSide.style.height = `${leftH}%`
                rightSide.style.height = `${rightH}%`
                break
            case 'horizontal':
            default:
                percentFactor = 100 / ele.parentNode.getBoundingClientRect().width
                const leftW = (leftWidth + dx) * percentFactor
                const rightW = (rightWidth - dx) * percentFactor
                leftSide.style.width = `${leftW}%`
                rightSide.style.width = `${rightW}%`
                break
        }
    
        const cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize'
        resizer.style.cursor = cursor
        document.body.style.cursor = cursor
    
        leftSide.style.userSelect = 'none'
        leftSide.style.pointerEvents = 'none'

        rightSide.style.userSelect = 'none'
        rightSide.style.pointerEvents = 'none'
    }

    const mouseUpHandler = function() {
        resizer.style.removeProperty('cursor')
        document.body.style.removeProperty('cursor')
    
        leftSide.style.removeProperty('user-select')
        leftSide.style.removeProperty('pointer-events')
    
        rightSide.style.removeProperty('user-select')
        rightSide.style.removeProperty('pointer-events')
    
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
            littleNames: sib.littleNames
        }
        showTab(tabData)

        setTimeout(function() {
            ele.scrollIntoView({behavior: "smooth", block: "center", inline: "center"})
        }, 0)
    }

    ele.addEventListener('click', clickedNameHandler)
}

// Allows a tag to be clicked on
function addTagClicker(ele, tag) {
    const clickedTagHandler = function(e) {
        displayTagInfo(tag)
        setTimeout(function() {
            ele.scrollIntoView({behavior: "smooth", block: "center", inline: "center"})
        }, 0)
    }

    ele.addEventListener('click', clickedTagHandler)
}