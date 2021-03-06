let news=require("../../model").news;
let moment=require("moment");
let timeLog=require("../../helpers/utils").timeLog;

/**
 * 策略：从三个平台中分别选取pcount数量新闻，合并后按时间选取pcount个最近的新闻
 * @param type   ["news","tech","sports".....]
 * @param page   page number
 * @param pcount   number of items in per page
 * @return Promise instance
 */
function getNews(type,page,pcount){
    let numPerFind=pcount>600?pcount:600,
        realSkip=parseInt(((page-1)*pcount/numPerFind))*numPerFind;
    return new Promise((resolve,reject)=>{
        // timeLog.begin();
        news.find({category:{$regex:type}}).sort({time:-1}).skip(realSkip).
        limit(numPerFind).exec((err,data)=>{
            if(err) reject(err);
            let begin=(page-1)*pcount%numPerFind;
            // timeLog.log('Fetch news:');
            // 提供效率，先做时间戳转换再排序
            data=data||[];
            data.forEach((item)=>{
                item.tms=moment(item.time).valueOf();
            });
            data=data.sort((a,b)=>{
                return b.tms-a.tms
            }).slice(begin,begin+pcount);
            // timeLog.log('News sorted:');
            data.forEach((item) => {
                if(!item.img) {
                    item.img='/images/noimg'+Math.floor(Math.random()*18+1)+'.jpg';
                }
                item.img=item.img.replace('http:','https:');
                //节省数据字节
                item.content="";
            });
            resolve(data);
        });
    });
}

/**
 * 获取单条新闻内容
 * @param {String} docId
 * @return {Promise} Promise instance
 */
function getNewsDetail(docId){
    return new Promise((resolve,reject)=>{
        news.findOne({_id:docId}).exec((err,data)=>{
            if(err) reject(err);
            resolve(data);
        })
    })
}

module.exports={
    getNews,
    getNewsDetail
};