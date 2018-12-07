import BaseDao from '../db/baseDao'
import SpiderBooks from './spiderBooks'

export default class Books extends BaseDao {
    constructor(table: string) {
        super(table)
    }
    async retrieve(params = Object.create(null), fields = [], session = { userid: '' }): Promise<any> {
        let isbn = params.isbn || ''
        if (isbn.length > 0) {
            let book = G.CircleQueue.find(isbn)
            if (book === undefined) {
                let rs = await new SpiderBooks('books').retrieve({isbn})
                if (rs.status === 200) {
                    book = rs.data[0]
                    G.CircleQueue.push(book)
                }
            }
            return book
        } else {
            return G.jsResponse(G.STCODES.PRAMAERR, 'isbn is missing.')
        }
    }
}