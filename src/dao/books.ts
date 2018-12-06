import BaseDao from '../db/baseDao'
import * as cheer from 'cheerio'
import * as moment from 'moment'

const protocol = 'http://localhost:5000'

export default class Books extends BaseDao {
    constructor(table: string) {
        super(table)
    }
    async retrieve(params = Object.create(null), fields = [], session = { userid: '' }): Promise<any> {
        let isbn = params.isbn || ''
        if (isbn.length > 0) {
            const remoteUrl = `http://search.dangdang.com/?key=${isbn}&act=input&category_path=01.00.00.00.00.00&type=01.00.00.00.00.00`
                let body = await G.tools.spiderData(remoteUrl)
                //<li ddt-pit="1" class="line1" id="p23898620" sku="23898620">
                let reg = /<li ddt-pit="1" class="line1[^>]+>[^<]+<a.*?http:\/\/product.dangdang.com\/(.*?)\.html"[^>]+>/
                // var reg=/<a.*?(http.*?)"([^>]+)>/;
                let result = body.text.match(reg)

                if (result && result.length > 1) {
                    let sku = result[1]
                    let detailUrl = `http://product.dangdang.com/index.php?r=callback%2Fdetail&productId=${sku}&templateType=publish&describeMap=&shopId=0&categoryPath=01.38.19.00.00.00`
                    let book = await G.tools.spiderData(detailUrl, 'gb2312')

                    let bookDetail = JSON.parse(book.text)
                    let $ = cheer.load(bookDetail.data.html)
                    let feature = $('#feature .descrip img').attr('src') || $('#feature').text()
                    if (feature && feature.startsWith('http')) {
                        let fileName = feature.substr(feature.lastIndexOf('/') + 1)
                        let path = `/bookimages/${isbn}_${moment().format('YYYYMMDD')}_${G.tools.uuid()}_${fileName}`
                        G.tools.spiderDown(feature, `./public${path}`)
                        feature = protocol + path
                    }
                    let ab_text = $('#abstract').text()
                    let ab_pic = $('#abstract .descrip img').attr('src')
                    let abstract = ab_text && ab_text.length > 9 ? ab_text : ab_pic
                    if (abstract && abstract.startsWith('http')) {
                        let fileName = abstract.substr(abstract.lastIndexOf('/') + 1)
                        let path = `/bookimages/${isbn}_${moment().format('YYYYMMDD')}_${G.tools.uuid()}_${fileName}`
                        G.tools.spiderDown(abstract, `./public${path}`)
                        abstract = protocol + path
                    }
                    let content = $('#content').text()
                    let author_summary = $('#authorIntroduction').text()
                    let catalog = $('#catalog').text()
                    let feedback = $('#mediaFeedback').text()
                    
                    let details_json = { feature, abstract, content, author_summary, catalog, feedback }

                    //"http://product.dangdang.com/25573217.html"
                    let info = await G.tools.spiderData(`http://product.dangdang.com/${sku}.html`, 'gb2312')
                    $ = cheer.load(info.text)
                    let bookName = $('h1').text()
                    bookName = bookName.replace(/\s/g, '')
                    // let authorName = $('#author').text()
                    //"作者:江南春出版社:中信出版社出版时间:2018年08月 
                    let cbs = $('#product_info .t1').text()

                    let regcbs = /作者:(.*?)出版社:(.*?)出版时间:(.*?)\s/
                    // var reg=/<a.*?(http.*?)"([^>]+)>/;
                    let rscbs = cbs.match(regcbs)
                    if (rscbs && rscbs.length > 1) {
                        Object.assign(details_json, {book_name: bookName, author_name: rscbs[1], cbs: rscbs[2], cb_time: rscbs[3]})
                    }

                    return details_json
                }

            return 'bookDetail'
        } else {
            return G.jsResponse(G.STCODES.PRAMAERR, 'isbn is missing.')
        }
    }
}