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
                let rs = await super.retrieve({isbn})
                if (rs.status === 200) {
                    G.logger.debug(`ISBN: ${isbn} in database.`)
                    book = rs.data[0]
                }
            } else {
                G.logger.debug(`ISBN: ${isbn} in memery.`)
            }
            if (book === undefined) {
                let rs = await new SpiderBooks('books').retrieve({isbn})
                if (rs.status === 200) {
                    G.logger.debug(`ISBN: ${isbn} spider real time.`)
                    book = rs.data[0]
                    let data = G.CircleQueue.push(book)
                    if (data) {
                        let elements = []
                        let keys = Object.keys(data)
                        keys.forEach((isbn) => {
                            elements.push({
                                isbn,
                                book_name: data[isbn].book_name,
                                author_name: data[isbn].author_name,
                                publisher: data[isbn].cbs,
                                publish_day: data[isbn].cb_time,
                                details_json: JSON.stringify(data[isbn])
                            })
                        })
                        super.insertBatch(this.table, elements)
                    }
                }
            }
            return book
        } else {
            return G.jsResponse(G.STCODES.PRAMAERR, 'isbn is missing.')
        }
    }
}