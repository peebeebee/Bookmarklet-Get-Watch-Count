var gulp    = require('gulp');
var uglify  = require('gulp-uglify');
var jshint  = require('gulp-jshint');
var through = require('through2');
var gutil   = require("gulp-util");
var rename  = require("gulp-rename");

function pluginError(msg) {
	return new gutil.PluginError("Bookmarklet", msg);
}

gulp.task('bookmarklet', ['compress'], function(cb) {
	var bookmarklet;
	gulp.src('./dist/watch-count.js')
	.pipe(through.obj(function(file, enc, callback){
		if(file.isNull()) {
			this.push(file);
			return callback();
		}
		if(file.isStream()) {
			this.emit("error", pluginError("Stream content is not supported"));
			return callback();
		}
		if(file.isBuffer()) {
			try {
				bookmarklet = file.contents.toString() + "()";
				bookmarklet = "alert('Watch Count:' + " + bookmarklet + ");";
				bookmarklet = encodeURIComponent(bookmarklet);
				bookmarklet = "javascript:" + bookmarklet;
				file.contents = new Buffer(bookmarklet);
				this.push(file);
			}
			catch(error) {
				this.emit("error", pluginError(error.toString()));
			}
			return callback();
		}
	}))
	.pipe(rename("bookmarklet.txt"))
	.pipe(gulp.dest('dist'));
});
 
gulp.task('compress', ['lint'], function() {
  return gulp.src('src/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('lint', function() {
  return gulp.src('./src/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('watch', function(){
	gulp.watch('src/*.js', ['bookmarklet']);
});

gulp.task('default', ['bookmarklet', 'watch']);