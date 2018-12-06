import * as uuid from 'uuid'
import * as fs from 'fs'
import * as charset from 'superagent-charset'     //解决乱码的问题
import * as superagent from 'superagent'
charset(superagent)

export default class GlobUtils {
    uuid() {
        return uuid.v1().split('-')[0]
    }
    async spiderData(path: string, encoding?: string) {
        return await superagent
        .get(path)
        .buffer(true)
        .charset(encoding)
    }
    spiderDown(path: string, filename: string) {
        superagent(path).pipe(fs.createWriteStream(filename))
    }
    isDev() {
        return G.NODE_ENV !== 'prod'
    }
    isLogin() {
        return true
    }
    arryParse(arr): Array<any>|null {
        try {
            if (Array.isArray(arr) || G.L.isNull(arr))
                return arr
            else if (typeof arr === 'string') {
                if (arr.startsWith('['))
                    arr = JSON.parse(arr)
                else
                    arr = arr.split(',')
            } else 
                return null
        } catch (err) {
            arr = null
        }
        return arr
    }
}