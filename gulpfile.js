'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var minifycss = require('gulp-minify-css');
var util = require('gulp-util');

/**
 * 公共错误处理函数
 * 使用示例：
 *  .pipe(uglify())
 .on('error', errHandle)
 .pipe(rename('u.min.js'))
 * @param  {[type]} err [description]
 * @return {[type]}     [description]
 */
function errHandle(err) {
    util.log(err.fileName + '文件编译出错，出错行数为' + err.lineNumber + '，具体错误信息为：' + err.message);
    this.end();
};


var globs={
	js : {
		uiJs : [
      'js/time.js',
      'js/clockpicker.js',
			'js/datetimepicker.js',
			'js/year.js',
      'js/month.js',
			'js/yearmonth.js'
		]
	},
	sass : 'css/date.scss'
}

gulp.task('Js', function() {
	
    return gulp.src(globs.js.uiJs)
      .pipe(concat('u-date.js'))
      .pipe(gulp.dest('dist/js'))
      .pipe(uglify())
      .on('error',errHandle)
      .pipe(rename('u-date.min.js'))
      .pipe(gulp.dest('dist/js'));
});


gulp.task('css', function() {
    return gulp.src(globs.sass)
      .pipe(sass().on('error',errHandle))
      .pipe(gulp.dest('dist/css'))
      .pipe(minifycss())
      .pipe(rename('date.min.css'))
      .pipe(gulp.dest('dist/css'));
});


gulp.task('default',['Js','css'], function() {

});