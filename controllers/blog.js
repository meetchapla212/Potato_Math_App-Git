const blogService = require('../services/blog');
const config = require('../config');
var multer = require('multer');
const mkdirp = require('mkdirp');

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        var path = config.uploadDir + config.blogImagePath;
        mkdirp(path, err => callback(null, path))
    },
    filename: function (req, file, callback) {
        callback(null, 'blog_image_' + Date.now());
    }
});

var upload = multer({ storage: storage }).single('blog_image');

function addBlog(req, res) {

    upload(req, res, function (err) {
        var blogDetails = {};
        blogDetails.blog_type = (req.body.blog_type) ? req.body.blog_type : 0;
        if (blogDetails.blog_type === 1) {
            blogDetails.blog_image = req.file !== undefined ? req.file.filename : 'default';
        }
        blogDetails.blog_video_url = (req.body.blog_video_url) ? req.body.blog_video_url : "";
        blogDetails.blog_title = (req.body.blog_title) ? req.body.blog_title : "";
        blogDetails.blog_description = (req.body.blog_description) ? req.body.blog_description : "";

        return blogService.addBlog(blogDetails).then(data => res.send(data))
    });
}

function getBlogs(req, res) {
    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;
    return blogService.getBlogs(pageNo, dataLimit).then(result => {
        if (result.length > 0) {
            let serverURL = config.getServerUrl(req)
            result.forEach((blog) => {
                blog['blog_image'] = serverURL + config.blogImagePath + blog['blog_image'];
            })
            var response = { status: true, data: result }
        } else {
            var response = { status: false, message: config.no_data_message }
        }
        res.send(response)
    });
}

function getBlogById(req, res) {
    const { blogId } = req.params;
    return blogService.getBlogById(blogId).then(result => {
        if (result) {
            let serverURL = config.getServerUrl(req)
            result['blog_image'] = serverURL + config.blogImagePath + result['blog_image'];
            var blogDetails = {};
            blogDetails.total_views = result['total_views'] + 1;
            return blogService.updateBlogById(blogDetails, {
                returning: true, where: { blog_id: blogId }
            }).then(update => {
                if (update) {
                    var response = { status: true, data: result }
                    res.send(response)
                }
            })
        } else {
            var response = { status: false, message: config.no_data_message }
            res.send(response)
        }
    })
}


function getBlogByIdForAdmin(req, res) {
    const { blogId } = req.params;
    return blogService.getBlogById(blogId).then(result => {
        if (result) {
            let serverURL = config.getServerUrl(req)
            result['blog_image'] = serverURL + config.blogImagePath + result['blog_image'];
            var response = { status: true, data: result }
        } else {
            var response = { status: false, message: config.no_data_message }
        }
        res.send(response)
    })
}

function updateBlogById(req, res) {
    upload(req, res, function (err) {
        const body = req.body;
        var blogId = body.id;
        return blogService.getBlogById(body.id).then(result => {
            if (result) {
                var blogDetails = {};
                if (body.is_delete) {
                    blogDetails.is_delete = 1;
                }
                else {
                    blogDetails.blog_type = (req.body.blog_type) ? req.body.blog_type : 0;
                    if (blogDetails.blog_type === 1) {
                        blogDetails.blog_image = req.file !== undefined ? req.file.filename : result.blog_image;
                    }
                    blogDetails.blog_video_url = (req.body.blog_video_url) ? req.body.blog_video_url : "";
                    blogDetails.blog_title = (req.body.blog_title) ? req.body.blog_title : "";
                    blogDetails.blog_description = (req.body.blog_description) ? req.body.blog_description : "";

                }
                return blogService.updateBlogById(blogDetails, {
                    returning: true, where: { blog_id: blogId }
                }).then(result => {
                    if (result) {
                        var response = { status: true, data: result }
                    } else {
                        var response = { status: false, message: "Blog not updated!" }
                    }
                    res.send(response)
                })
            } else {
                var response = { status: false, message: "No Blog found for update detail!" }
                res.send(response);
            }
        })
    })
}

module.exports = {
    addBlog,
    getBlogs,
    getBlogById,
    getBlogByIdForAdmin,
    updateBlogById,
}