import BaseDao from '../db/baseDao'

export default class Books extends BaseDao {
    constructor(table: string) {
        super(table)
    }
    async retrieve(params = Object.create(null), fields = [], session = { userid: '' }): Promise<any> {
        let isbn = params.isbn || ''
        if (isbn.length > 0) {
            return G.jsResponse(G.STCODES.SUCCESS, 'spider is success.', {isbn})
        } else {
            return G.jsResponse(G.STCODES.PRAMAERR, 'isbn is missing.')
        }
    }
}