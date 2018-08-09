const util = require("hexo-util");
const md5 = require("js-md5");
const log = require('hexo-log')({
    debug: true,
    silent: false
  });
  
const minify = str => util.stripHTML(str).trim().replace(/\n/g, ' ').replace(/\s+/g, ' ');
const getProps = ref => Object.getOwnPropertyNames(ref).filter(item => ref[item]);
const catags = item => {
    return {
        name: item.name,
        slug: item.slug,
        permalink: item.permalink
    }
}

/**
 * hexo配置文件
 */
let cfg = hexo.config.jsonContent || { meta: true, key: "" };
let ignore = [];

/**
 * raw data
 */
let results = [];

/**
 * 页面属性
 */
let bloogle_pages = {
    id: true,
    title: true,
    raw: true,
    path: true,
    permalink: true,
    excerpt: true,
    createdDate: true,
    updatedDate: true
}
/**
 * 文章属性
 */
let bloogle_posts = {
    id: true,           // 文章id
    rawpath: true,      // 原文件路径
    title: true,        // 文章标题
    createdDate: true,  // 创建时间
    updatedDate: true,  // 更新时间
    path: true,         // 文章路径
    link: true,         // 
    permalink: true,    // 固定路径
    excerpt: true,
    categories: true,
    tags: true
}

/**
 * 设置内容
 */
setContent = (obj, item, ref) => {
    switch (item) {
        case "id":
            let _date = "bloogle_" + ref.date;
            log.info(_date)
            obj.id = md5(_date);
            break
        case "title":
            obj.title = ref.title;
            break
        case "rawpath":
            obj.rawpath = "raw/" + md5("bloogle_" + ref.date) + ".json";
            log.info(obj.rawpath)
            results.push({
                "path": obj.rawpath,
                "data": ref.raw
            })
            break
        case "categories":
            obj.categories = ref.categories.map(catags);
            break
        case "tags":
            obj.tags = ref.tags.map(catags);
            break
        case "createdDate":
            obj.date = parseInt(ref.date + "");
            break
        case 'updatedDate':
            obj.updated = parseInt(ref.updated + "");
            break
        default:
            obj[item] = ref[item];
            break
    }
    return obj;
}

/**
 * 注册插件
 */
hexo.extend.generator.register('bloogle', site => {
    // // if there have any pages
    let postProps = getProps(bloogle_posts);
    let postsFiltered = site.posts.sort('-date').filter(post => {
        let path = post.path.toLowerCase()
        return post.published && !ignore.find(item => path.includes(item))
    });
    postsContent = postsFiltered.map(post => postProps.reduce((obj, item) => {
        return setContent(obj, item, post);
    }, {}))

    results.push({
        path: 'bloogle.json',
        data: JSON.stringify({
            versioncode: 1,
            version: "1.0",
            description: "bloogle sitemap",
            type: "hexo",
            key: cfg.apikey,
            contentType: "markdown",
            meta: {
                title: hexo.config.title,
                subtitle: hexo.config.subtitle,
                description: hexo.config.description,
                author: hexo.config.author,
                url: hexo.config.url,
                root: hexo.config.root
            },
            posts: postsContent,
        })
    });

    return results;
});