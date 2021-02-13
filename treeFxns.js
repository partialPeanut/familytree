// Converts a single sibling into a JSON format
function rowToJSON(row) {
    sibJSON = {}
    sibJSON.name = row[0]
    sibJSON.pledgeClass = row[1]
    sibJSON.gradYear = row[2]
    sibJSON.bigName = row[3] == 'XXX' ?  null : row[3]
    sibJSON.littleNames = []
    sibJSON.house = row[4] == 'XXX' ? null : row[4]
    sibJSON.tags = row[5] == 'XXX' ? [] : row[5].split(';')

    return sibJSON
}