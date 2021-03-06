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

// Changes column size to make resizing possible.
function linkElementToColumnSize(ele, container) {
    $(ele).resizable({
      handles: 'e',
      maxWidth: 450,
      minWidth: 120,
      resize: function(event, ui){
          currentWidth = ui.size.width;
          containerWidth = $(container).width()
          padding = 0;

          $(this).width(currentWidth);
          $(".col.right").width(containerWidth - currentWidth - padding);
      }
    })
}

// Allows a name to be clicked on
function addNameClicker(ele, sib) {
    const clickedNameHandler = function(e) {
        appElement.displayTab = "nameTab"
        appElement.nameTabData = {
            name: sib.name,
            pledgeClass: sib.pledgeClass,
            house: sib.house,
            tags: sib.tags,
            bigName: sib.bigName,
            littleNames: sib.littleNames
        }

        ele.scrollIntoView({behavior: "smooth", block: "center", inline: "center"})
    }

    ele.addEventListener('click', clickedNameHandler)
}