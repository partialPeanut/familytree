function setHeightRecursively(siblingName, fullJSON, height) {
    sibling = fullJSON[siblingName]
    sibling.height = height

    sibling.littleNames.forEach(littleName => {
        setHeightRecursively(littleName, fullJSON, height+1)
    })
}