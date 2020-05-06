import fs = require('fs')
import os = require('os')
import { message, warn, markdown } from "danger"
const suggestionsDir = [os.homedir(), ".dts", "suggestions"].join('/')
const lines: string[] = []
const missingProperty = /module exports a property named '(.+?)', which is missing/
if (fs.existsSync(suggestionsDir)) {
    lines.push('Inspecting the Javascript source for this package found some properties that are not in the .d.ts files.')
    lines.push('The check for missing properties isn\'t always right, so take this list as advice, not a requirement.')
    for (const suggestionFile of fs.readdirSync(suggestionsDir)) {
        const path = [suggestionsDir, suggestionFile].join('/')
        const suggestions = fs.readFileSync(path, "utf8").split('\n').map(x => JSON.parse(x)) as Array<{ fileName: string, ruleName: string, message: string }>
        const packageName = suggestionFile.slice(0, suggestionFile.indexOf('.txt'))
        const missingProperties: { [s: string]: string[] } = {}
        for (const s of suggestions) {
            const fileName = s.fileName.slice(s.fileName.indexOf("types/" + packageName + "/") + ("types/" + packageName + "/").length)
            const match = s.message.match(missingProperty)
            const identifier = match ? match[1] : s.message
            if (fileName in missingProperties) {
                missingProperties[fileName].push(identifier)
            }
            else {
                missingProperties[fileName] = [identifier]
            }
        }

        lines.push("## " + packageName)
        for (const fileName in missingProperties) {
            const properties = missingProperties[fileName]
            lines.push("- " + fileName + " was missing the following properties: \n" + properties.join('\n     1.'))
        }
    }
    markdown(lines.join('\n'))
}

