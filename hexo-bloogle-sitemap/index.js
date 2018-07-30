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
let cfg = hexo.config.jsonContent || { meta: true };
let ignore = [];

/**
 * 页面属性
 */
let letsblog_pages = {
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
let letsblog_posts = {
    id: true,
    raw: true,
    title: true,
    createdDate: true,
    updatedDate: true,
    path: true,
    link: true,
    permalink: true,
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
            let _date = "letsblog_" + ref.date;
            log.info(_date)
            obj.id = md5(_date);
            break
        case "title":
            obj.title = ref.title;
            break
        case "raw":
            obj.raw = ref.raw;
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
hexo.extend.generator.register('letsblog-sitemap', site => {   
    // // if there have any pages
    let pageProps = getProps(letsblog_pages);
    log.info(site.pages);
    let pagesFiltered = site.pages.filter(page=>{
        let path = page.path.toLowerCase();
        return !ignore.find(item => path.includes(item));
    });
    let pagesContent = pagesFiltered.map(page => pageProps.reduce((obj, item) => setContent(obj, item, page), {}));

    let postProps = getProps(letsblog_posts);
    let postsFiltered = site.posts.sort('-date').filter(post => {
        let path = post.path.toLowerCase()
        return post.published && !ignore.find(item => path.includes(item))
    });
    postsContent = postsFiltered.map(post => postProps.reduce((obj, item) => {
        return setContent(obj, item, post);
    }, {}))

    log.info("hello world");

    return {
        path: 'bloogle.json',
        data: JSON.stringify({
            description: "bloogle sitemap",
            type: "hexo",
            meta: {
                title: hexo.config.title,
                subtitle: hexo.config.subtitle,
                description: hexo.config.description,
                author: hexo.config.author,
                url: hexo.config.url,
                root: hexo.config.root
            },
            pages: pagesContent,
            posts: postsContent,
        })
    }
});