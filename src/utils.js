require('dotenv').config()
const fs = require('fs');
const path = require('path');
const loadingCli =  require('loading-cli');

function sleep(ms) {
    return new Promise(r => setTimeout(() => r(), ms))
}

const args = process.argv.slice(2);
function argsExist(key) {
    const result = args.find(k => k === key) 
    return !(result === undefined)
}

function saveToFile(filename, object) {
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
            return resolve()
        } catch (error) {
            reject(error)
        }
    })
}

/** 
 * @param {string} text
 * @param {number} target
 */
function scrapeLoading(text, target = false) {
    return new Loading(text, target)
}

function loading(text) {
    const load = loadingCli({
        text,
        interval: 180,
    })
    load.frame("|/-\\".split(''))
    load.start()
    return load
}

function makeArray(length, start) {
    return Array.from({length}, (_, i) => i + start)
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min) + min)
}

class Loading {
    #name
    #load
    #count = 0
    #target = false

    constructor(name, target = false) {
        this.#name = name
        this.#target = target
        this.#load = loading(`Scraping ${this.#name} ...`)
    }

    #renderCouter() {
        if (this.#target) return `(${this.#count}/${this.#target})`
        return `(${this.#count})`
    }

    /** @param {number} number  */
    counter(number) {
        this.#count = number
        this.#load.text = `Scraping ${this.#name} ... ${this.#renderCouter()}`
    }

    /** @param {number} number  */
    add(number) {
        this.#count += number
        this.counter(this.#count)
    }

    success() {
        this.#load.succeed(`Scraped ${this.#name} Succesed ... ${this.#renderCouter()}`)
    }
}

/**
 * 
 * @param {string} name
 * @param {any} defaultValue 
 */
function env(name, defaultValue = null) {
    const val = process.env[name] || defaultValue
    if (val === 'true') return true
    if (val === 'false') return false
    if (isNaN(val)) return val
    return Number(val)
}

module.exports = {
    sleep,
    argsExist,
    saveToFile,
    loading,
    scrapeLoading,
    makeArray,
    random,
    env
}