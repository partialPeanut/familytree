function drawTree() {
    console.log("Main: Slap Em Down ver. 1")

    // Loop through the rows
    $.each(siblings, function(key, val) {
        i = parseInt(key)
        row = document.createElement('div')
        row.id = 'row-' + i
        row.className = 'row'
        if (i == 0 || i == siblings.length-1) {
            row.className = 'row end'
        }
        
        tree = document.querySelector('#tree')
        tree.append(row)

        $.each(val, function(sibName, sib) {
            space = document.createElement('div')
            space.className = 'space'
            // space.style.width = '200px'
            row.append(space)

            block = document.createElement('div')
            block.className = 'block'
            row.append(block)

            if (sib.bigName) {
                topLine = document.createElement('div')
                topLine.className = 'line vert'
                block.append(topLine)
            }

            nas = document.createElement('div')
            nas.className = 'nameAndSymbols'
            block.append(nas)

            nameButton = document.createElement("BUTTON")
            nameButton.className = 'name'
            nas.append(nameButton)

            nameName = document.createTextNode(sib.name + ' ' + nameButton.offsetLeft)
            nameButton.appendChild(nameName)

            if (sib.littleNames.length > 0) {
                botLine = document.createElement('div')
                botLine.className = 'line vert'
                block.append(botLine)
            }
        })

        if (i != siblings.length-1) {
            across = document.createElement('div')
            across.id = 'across-' + i
            across.className = 'across'
            tree.append(across)

            space = document.createElement('div')
            space.className = 'space'
            // space.style.width = '200px'
            across.append(space)

            line = document.createElement('div')
            line.className = 'line horiz'
            // line.style.width = '200px'
            across.append(line)
        }
    })
}