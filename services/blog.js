const blogMaster = require('../models/blog_master').blogMaster;
const sequelize = require('../db');

const addBlog = data => blogMaster.create({
    ...data
}).then((result) => {
    var response = { status: true, message: "Success! Blog added successfully!" }
    return response;
}).catch((error) => {
    var response = { status: false, message: "Error! Invalid data found", error }
    return response;
});


const getBlogs = (pageNo, dataLimit) => {
    var offset = (pageNo - 1) * dataLimit;

    var query = {
        where: {
            is_delete: 0
        },
        attributes: ['blog_id', 'blog_title', 'blog_type', 'blog_image', 'blog_video_url', 'blog_description', 'total_views', 'createdAt'],
        offset: offset,
        limit: dataLimit,
        order: [['blog_id', 'DESC']]
    };

    return blogMaster.findAll(query).then(sequelize.getValues)
}


const getBlogById = (id) => {
    var query = {
        where: {
            blog_id: id
        },
        attributes: ['blog_id', 'blog_title', 'blog_type', 'blog_image', 'blog_video_url', 'blog_description', 'total_views', 'createdAt'],
    };
    return blogMaster.findOne(query).then(sequelize.getValues)
}


const updateBlogById = (data, query) => {
    return blogMaster.update(data, query).then(function ([rowsUpdate, [updatedBlog]]) {
        return updatedBlog;
    })
}


module.exports = {
    addBlog,
    getBlogs,
    getBlogById,
    updateBlogById,
}