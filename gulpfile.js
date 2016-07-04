'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var minifycss = require('gulp-minify-css');
var util = require('gulp-util');
var makeumd = require('./makeumd.js');
/**
 * 公共错误处理函数
 * 使用示例：
 *  .pipe(uglify().on('error', errHandle))
    .pipe(rename('u.min.js'))
 * @param  {[type]} err [description]
 * @return {[type]}     [description]
 */
var errHandle = function ( err ) {
    // 报错文件名
    var fileName = err.fileName;
    // 报错类型
    var name = err.name;
    // 报错信息
    var message = err.message;
    // 出错代码位置
    var loc = err.loc;

    var logInfo = '报错文件：' + fileName + '报错类型：' + name + '出错代码位置：' + loc.line + ',' + loc.column;

    util.log( logInfo );

    this.end();
}


var globs={
	js :[
        'js/datetimepicker.js',
        'js/time.js',
        'js/yearmonth.js',
        'js/year.js',
        'js/month.js',
        'js/clockpicker.js'
	],
	sass : 'css/date.scss'
}

gulp.task('js-init', function() {
	
    return gulp.src(globs.js)
        .pipe(concat('u-date.js'))
        .pipe(gulp.dest('dist/js'))
        .pipe(uglify().on('error',errHandle))
        .pipe(rename('u-date.min.js'))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('js', ['js-init'], function(){
     makeumd.init([
            'dist/js/u-date.js',
            'dist/js/u-date.min.js',
        ]);
})

gulp.task('css-init', function() {
    return gulp.src(globs.sass)
        .pipe(sass().on('error',errHandle))
        .pipe(rename('u-date.css'))
        .pipe(gulp.dest('dist/css'))
        .pipe(minifycss())
        .pipe(rename('u-date.min.css'))
        .pipe(gulp.dest('dist/css'));
});

gulp.task('css', ['css-init'], function(){
     makeumd.init([
            'dist/css/u-date.css',
            'dist/css/u-date.min.css',
        ]);
})

gulp.task('distWatch', function(){
    gulp.watch(globs.js,['js']);
    gulp.watch(globs.css,['css'])
})


gulp.task('dev', ['js','css'],function(){
    gulp.run('distWatch');
})

gulp.task('dist', ['js','css'], function() {
});