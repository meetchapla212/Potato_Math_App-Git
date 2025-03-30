
var xlsx = require('node-xlsx').default;
var fs = require('fs')
const courseService = require('../services/course');
const topicService = require('../services/topic');
const workSheetsFromFile = xlsx.parse(`${__dirname}/myfileLatest.xlsx`);

workSheetsFromFile.forEach(async (worksheet) => {
    console.log('===', worksheet.name)
    var gradeLower;
    var gradeUpper;
    var gradeAdditional;
    var preValue = '';
    if (worksheet.name === 'Lower-secondary (6-8 grade)') {
        var courseArray = [];
        var topicArray = [];
        worksheet.data.forEach((ele) => {
            if (ele.length) {

                if (ele[0] !== 'Topic' && ele[0] !== preValue) {
                    for (var gradeId in gradeLower) {
                        var courseDetails = {};
                        courseDetails.course_image = 'default';
                        courseDetails.course_name = ele[0] ? ele[0] : "";
                        courseDetails._grade_id = gradeLower[gradeId] ? gradeLower[gradeId] : 0;
                        courseDetails.sortIndex = 1
                        courseArray.push(courseDetails)
                    }
                    preValue = ele[0]
                } else if (ele[0] === 'Topic') {
                    gradeLower = JSON.parse(ele[2])
                }
            }
        })
        // console.log('course',courseArray)
        await courseService.addBulkCourses(courseArray)

        for (var gradeId in gradeLower) {
            for (var ele in worksheet.data) {
                if (worksheet.data[ele].length) {
                    if (worksheet.data[ele][0] !== 'Topic') {
                        var course = await courseService.getCourseByName(worksheet.data[ele][0], gradeLower[gradeId])

                        var topicDetails = {};
                        topicDetails.topic_image = 'default';
                        topicDetails.topic_name = worksheet.data[ele][1] ? worksheet.data[ele][1] : "";
                        topicDetails._grade_id = gradeLower[gradeId] ? gradeLower[gradeId] : 0;
                        topicDetails._course_id = course ? course.dataValues.course_id : 0;
                        topicDetails.sortIndex = 1
                        topicArray.push(topicDetails)

                    }
                }
            }
        }
        await topicService.addBulkTopics(topicArray)
    } else if (worksheet.name === 'Upper-secondary (9-11 grade)') {
        var courseArray = [];
        var topicArray = [];
        worksheet.data.forEach((ele) => {
            if (ele.length) {

                if (ele[0] !== 'Topic' && ele[0] !== preValue) {
                    for (var gradeId in gradeUpper) {
                        var courseDetails = {};
                        courseDetails.course_image = 'default';
                        courseDetails.course_name = ele[0] ? ele[0] : "";
                        courseDetails._grade_id = gradeUpper[gradeId] ? gradeUpper[gradeId] : 0;
                        courseDetails.sortIndex = 1
                        courseArray.push(courseDetails)
                    }
                    preValue = ele[0]
                } else if (ele[0] === 'Topic') {
                    gradeUpper = JSON.parse(ele[2])
                }
            }
        })
        await courseService.addBulkCourses(courseArray)

        for (var gradeId in gradeUpper) {
            for (var ele in worksheet.data) {
                if (worksheet.data[ele].length) {
                    if (worksheet.data[ele][0] !== 'Topic') {
                        var course = await courseService.getCourseByName(worksheet.data[ele][0], gradeUpper[gradeId])

                        var topicDetails = {};
                        topicDetails.topic_image = 'default';
                        topicDetails.topic_name = worksheet.data[ele][1] ? worksheet.data[ele][1] : "";
                        topicDetails._grade_id = gradeUpper[gradeId] ? gradeUpper[gradeId] : 0;
                        topicDetails._course_id = course ? course.dataValues.course_id : 0;
                        topicDetails.sortIndex = 1
                        topicArray.push(topicDetails)

                    }
                }
            }
        }
        await topicService.addBulkTopics(topicArray)
    } else if (worksheet.name === 'Additional Mathematics (10-11 g') {
        var courseArray = [];
        var topicArray = [];
        worksheet.data.forEach((ele) => {
            if (ele.length) {

                if (ele[0] !== 'Topic' && ele[0] !== preValue) {
                    for (var gradeId in gradeAdditional) {
                        var courseDetails = {};
                        courseDetails.course_image = 'default';
                        courseDetails.course_name = ele[0] ? ele[0] : "";
                        courseDetails._grade_id = gradeAdditional[gradeId] ? gradeAdditional[gradeId] : 0;
                        courseDetails.sortIndex = 1
                        courseArray.push(courseDetails)
                    }
                    preValue = ele[0]
                } else if (ele[0] === 'Topic') {
                    gradeAdditional = JSON.parse(ele[2])
                }
            }
        })
        await courseService.addBulkCourses(courseArray)

        for (var gradeId in gradeAdditional) {
            for (var ele in worksheet.data) {
                if (worksheet.data[ele].length) {
                    if (worksheet.data[ele][0] !== 'Topic') {
                        var course = await courseService.getCourseByName(worksheet.data[ele][0], gradeAdditional[gradeId])

                        var topicDetails = {};
                        topicDetails.topic_image = 'default';
                        topicDetails.topic_name = worksheet.data[ele][1] ? worksheet.data[ele][1] : "";
                        topicDetails._grade_id = gradeAdditional[gradeId] ? gradeAdditional[gradeId] : 0;
                        topicDetails._course_id = course ? course.dataValues.course_id : 0;
                        topicDetails.sortIndex = 1
                        topicArray.push(topicDetails)

                    }
                }
            }
        }
        await topicService.addBulkTopics(topicArray)
    }
})