const {src, dest, watch, series, parallel} = require("gulp");

const scss         = require("gulp-sass");
const plumber      = require("gulp-plumber");
const sourcemap    = require("gulp-sourcemaps");
const postcss      = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const csso         = require("gulp-csso");
const browserSync  = require("browser-sync").create();
const imagemin     = require("gulp-imagemin");
const uglify       = require("gulp-uglify-es").default;
const rename       = require("gulp-rename");
const webp         = require("gulp-webp");
const del          = require("del");
const ghPages      = require('gh-pages');
const path         = require('path');
const htmlmin      = require('gulp-htmlmin');

//Styles

function styles() {
  return src("source/scss/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(scss())
    .pipe(postcss([
      autoprefixer(
        {
          overrideBrowserslist: ["last 10 version"]
        }
      )
    ]))
    .pipe(csso())
    .pipe(dest("source/css"))
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(dest("source/css"))
    .pipe(browserSync.stream());
}

//Htmlmin

function minhtml() {
  return src("source/*.html")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest('build'));
}

//Server

function server(done) {
  browserSync.init({
    server: {
      baseDir: "source"
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

//Imagemin

function optimization() {
  return src("source/img/*.{jpg,png,svg}")
    .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.mozjpeg({progressive: true}),
      imagemin.svgo({
        plugins: [
            {removeViewBox: false},
            {cleanupIDs: false}
        ]
    })

    ]))
    .pipe(dest("build/img"));
}

//Webp

function imagewebp() {
  return src("source/img/*.{jpg,png}")
    .pipe(webp({quality: 100}))
    .pipe(dest("build/img"));
}

//Scripts

function scripts() {
  return src("source/js/main.js")
    .pipe(rename("main.min.js"))
    .pipe(uglify())
    .pipe(dest("source/js"))
    .pipe(browserSync.stream());
}

//Copy

function build() {
  return src ([
    "source/css/**/*.css",
    "source/fonts/**/*",
    "source/js/main.min.js",
  ], {base: "source"})
    .pipe(dest("build"));
}

//Github

function deploy(cb) {
  ghPages.publish(path.join(process.cwd(), "./build"), cb);
}

//Del

function cleanBuild() {
  return del("build");
}

//Watcher

function watcher() {
  watch("source/scss/**/*.scss", series("styles"));
  watch("source/js/*.js", series("scripts"));
  watch("source/*.html").on("change",browserSync.reload);
}

//Exports

exports.styles       = styles;
exports.server       = server;
exports.optimization = optimization;
exports.imagewebp    = imagewebp;
exports.scripts      = scripts;
exports.watcher      = watcher;
exports.build        = build;
exports.cleanBuild   = cleanBuild;
exports.deploy       = deploy;
exports.minhtml      = minhtml;

exports.build   = series(cleanBuild, minhtml, styles, scripts, optimization, imagewebp, build);
exports.default = series(styles, scripts, server, watcher);