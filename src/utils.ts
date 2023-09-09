require('dotenv').config()
const fs = require('fs');
const path = require('path');
const loadingCli = require('loading-cli');

export function sleep(ms: number) {
    return new Promise(r => setTimeout(r, ms))
}

const args = process.argv.slice(2);
export function argsExist(key: string) {
    const result = args.find(k => k === key) 
    return !(result === undefined)
}

export function saveToFile(filename: string, object: object): Promise<boolean> {
    return new Promise((resolve, reject) => {
        try {
            const rootPath = 'data/'
            const json  = JSON.stringify(object, null, 4)
            // create folder if not exist
            const folder = rootPath + path.dirname(filename)
            if (!fs.existsSync(folder)) {
                fs.mkdirSync(folder, {
                    recursive: true,
                })
            }   
            fs.writeFileSync(rootPath + filename + '.json', json)
            return resolve(true)
        } catch (error) {
            reject(error)
        }
    })
}

export function scrapeLoading(text: string, target: number|false = false) {
    return new Loading(text, target)
}

export function loading(text: string) {
    const load = loadingCli({
        text,
        interval: 180,
        frames: "|/-\\".split('')
    })
    load.start()
    return load
}

export function makeArray(length: number, start: number = 0) {
    return Array.from({length}, (_, i) => i + start)
}

export function random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min)
}

class Loading {
    private name: string
    private load: any
    private count: number = 0
    private target: number|false = false

    constructor(name: string, target: number|false = false) {
        this.name = name
        this.target = target
        this.load = loading(`Scraping ${this.name} ...`)
    }

    private renderCouter() {
        if (this.target) return `(${this.count}/${this.target})`
        return `(${this.count})`
    }

    counter(number: number) {
        this.count = number
        this.load.text = `Scraping ${this.name} ... ${this.renderCouter()}`
    }

    add(number: number) {
        this.count += number
        this.counter(this.count)
    }

    success() {
        this.load.succeed(`Scraped ${this.name} Succesed ... ${this.renderCouter()}`)
    }
}

export function env(name: string, defaultValue: string|boolean|number|null = null) {
    const val = process.env[name]
    if (val === undefined) return defaultValue
    if (val === 'true') return true
    if (val === 'false') return false
    if (isNaN(Number(val))) return val
    return Number(val)
}

export function slugable(text: string) {
    return text.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-');
}
