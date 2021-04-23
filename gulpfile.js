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
  return src("resource/scss/style.scss")
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
    .pipe(dest("resource/css"))
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(dest("resource/css"))
    .pipe(browserSync.stream());
}

//Htmlmin

function minhtml() {
  return src("resource/*.html")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest('dist'));
}

//Server

function server(done) {
  browserSync.init({
    server: {
      baseDir: "resource"
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

//Imagemin

function optimization() {
  return src("resource/img/*.{jpg,jpeg,png,svg}")
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
    .pipe(dest("dist/img"));
}

//Webp

function imagewebp() {
  return src("resource/img/*.{jpg,jpeg,png}")
    .pipe(webp({quality: 100}))
    .pipe(dest("dist/img"));
}

//Scripts

function scripts() {
  return src("resource/js/main.js")
    .pipe(rename("main.min.js"))
    .pipe(uglify())
    .pipe(dest("resource/js"))
    .pipe(browserSync.stream());
}

//Copy

function dist() {
  return src ([
    "resource/css/**/*.css",
    "resource/fonts/**/*",
    "resource/js/main.min.js",
    "resource/slick/**/*",
  ], {base: "resource"})
    .pipe(dest("dist"));
}

//Github

function deploy(cb) {
  ghPages.publish(path.join(process.cwd(), "./dist"), cb);
}

//Del

function cleanBuild() {
  return del("dist");
}

//Watcher

function watcher() {
  watch("resource/scss/**/*.scss", series("styles"));
  watch("resource/js/*.js", series("scripts"));
  watch("resource/*.html").on("change",browserSync.reload);
}

//Exports

exports.styles       = styles;
exports.server       = server;
exports.optimization = optimization;
exports.imagewebp    = imagewebp;
exports.scripts      = scripts;
exports.watcher      = watcher;
exports.dist         = dist;
exports.cleanBuild   = cleanBuild;
exports.deploy       = deploy;
exports.minhtml      = minhtml;

exports.build   = series(cleanBuild, minhtml, styles, scripts, optimization, imagewebp, dist);
exports.default = series(styles, scripts, server, watcher);