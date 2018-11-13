'use strict'
const fs = require('fs')
const path = require('path')
const gulp = require('gulp')
const gutil = require('gulp-util')
const glob = require("glob")

const browserSync = require('browser-sync')

const clean = require('gulp-clean')

const rollup = require('rollup-stream')
const source = require('vinyl-source-stream')
const replace = require('rollup-plugin-replace')
const babel = require('rollup-plugin-babel')
const buffer = require('gulp-buffer')
const rev = require('gulp-rev')
const sourcemaps = require('gulp-sourcemaps')
const uglify = require('gulp-uglify')
const merge = require('merge-stream')

const less = require('gulp-less')
const stylelint = require('gulp-stylelint')
const autoprefixer = require('autoprefixer')
const postcss = require('gulp-postcss')
const rename = require('gulp-rename')
const cleanCSS = require('gulp-clean-css')
const base64 = require('gulp-base64')

const imagemin = require('gulp-imagemin')

const data = require('gulp-data')
const ejs = require('gulp-ejs')
const htmlmin = require('gulp-htmlmin')

const zip = require('gulp-zip')

const modules = glob.sync('./src/js/*.js').map(entry => path.basename(entry, '.js'))
console.log(' *** modules *** ', modules)
const config = {
  src: './src',                 // 源码目录
  template: './src/templates',  // 模版目录
  js: './src/js',               // js 目录
  less: './src/less',           // less 目录
  images: './src/images',       // image 目录
  dist: './dist',               // 生成目录
  rev: 'rev/',                // rev 目录
  name: {
    revjssuffix: '.rev-manifest-js.json',
    revcss: 'rev-manifest-css.json',
    jsbundlesuffix: '.bundle.js',
    cssbundle: 'styles.css'
  },
  modules,
}

const isDev = !!process.env.BUILD_ENV
const NODE_ENV = process.env.BUILD_ENV ? 'production' : 'development'
const BuildEnv = process.env.BUILD_ENV || 'TEST'

// 清理工作
gulp.task('clean', function () {
	return gulp.src(config.dist, { read: false })
		.pipe(clean())
})

gulp.task('clean:trial', function () {
	return gulp.src([
    config.dist + '/rev',
    config.dist + '/*.{map,json}',
    config.dist + '/' + config.name.cssbundle,
  ].concat(config.modules.map(name => config.dist + '/' + name + '.bundle.js')), { read: false })
		.pipe(clean())
})

// 编译 js 文件
gulp.task('compile:js', function() {
  return merge(config.modules.map(name => {
    console.log('** compile:js **', name)
    return rollup({
      input: config.js + '/' + name + '.js',
      sourcemap: !isDev,
      format: 'umd',
      plugins: [
        replace({
          'process.env.NODE_ENV': JSON.stringify( NODE_ENV ),
          'process.env.BUILD_ENV': JSON.stringify( BuildEnv )
        }),
        babel({
          presets: [
            [
              'es2015', {
                'modules': false
              }
            ]
          ],
          babelrc: false,
          exclude: 'node_modules/**' // 只编译我们的源代码
        }),
      ],
      globals: {
        jquery: '$',
      }
    })
      .pipe(source(name + '.bundle.js'))
      .pipe(buffer())
      .pipe(isDev ? gutil.noop() : sourcemaps.init({ loadMaps: true }))
      .pipe(isDev ? gutil.noop() : uglify())
      .pipe(isDev ? gutil.noop() : sourcemaps.write('.'))
      // .pipe(isDev ? gutil.noop() : gulp.dest(config.dist))
      .pipe(isDev ? gutil.noop() : rev())
      .pipe(isDev ? gutil.noop() : gulp.dest(config.dist))
      .pipe(isDev ? gutil.noop() : rev.manifest(config.rev + name + config.name.revjssuffix))
      .pipe(gulp.dest(config.dist))
  }))
})

// 编译 css 文件
gulp.task('compile:css', function() {
  return gulp.src(config.less + '/index.less')
    .pipe(stylelint({
      reporters: [
        { formatter: 'verbose', console: true }
      ],
      failAfterError: false
    }))
    .pipe(less())
    .pipe(postcss([
      autoprefixer({
        browsers: [
          '>1%',
          'last 4 versions',
          'Firefox ESR',
        ]
      }),
    ]))
    .pipe(base64({
      baseDir: './src/images',
      extensions: ['svg', 'png', /\.jpg#datauri$/i],
      // exclude:    [/.(com|net)\//, '--live.jpg'],
      maxImageSize: 8 * 1024, // bytes
      debug: isDev
    }))
    // .pipe(source('styles.css'))
    .pipe(rename({ basename: 'styles' }))
    .pipe(isDev ? gutil.noop() : sourcemaps.init({ loadMaps: true }))
    .pipe(isDev ? gutil.noop() : cleanCSS({ compatibility: 'ie8' }))
    .pipe(isDev ? gutil.noop() : sourcemaps.write('.'))
    // .pipe(isDev ? gutil.noop() : gulp.dest(config.dist))
    .pipe(isDev ? gutil.noop() : rev())
    .pipe(isDev ? gutil.noop() : gulp.dest(config.dist))
    .pipe(isDev ? gutil.noop() : rev.manifest(config.rev + config.name.revcss))
    .pipe(gulp.dest(config.dist))
})

// 编译 image 文件
gulp.task('compile:images', function() {
  return gulp.src(config.images + '/**/*.*')
    .pipe(isDev ? gutil.noop() : imagemin({
      optimizationLevel: 5,  //类型：Number  默认：3  取值范围：0-7（优化等级）
      progressive: true,     //类型：Boolean 默认：false 无损压缩jpg图片
      interlaced: true,      //类型：Boolean 默认：false 隔行扫描gif进行渲染
      multipass: true        //类型：Boolean 默认：false 多次优化svg直到完全优化
    }))
    .pipe(gulp.dest(config.dist + '/images'))
})

// html 模版合并
gulp.task('compile:html', function() {
  return gulp.src(config.template + '/**/*.html')
    .pipe(data(function (file) {
      const filePath = file.path
      const module = path.basename(filePath, '.html')

      let styleLink = './' + config.name.cssbundle
      let scriptLink = './' + module + config.name.jsbundlesuffix

      if (!isDev) {
        const revCssPath = path.join(config.dist, config.rev + config.name.revcss)
        const revJsPath = path.join(config.dist, config.rev + module + config.name.revjssuffix)
        if(fs.existsSync(revCssPath)) {
          const revManifestCss = JSON.parse(fs.readFileSync(revCssPath))
          styleLink = './' + revManifestCss[config.name.cssbundle] || ''
        }

        if(fs.existsSync(revJsPath)) {
          const revManifestJs = JSON.parse(fs.readFileSync(revJsPath))
          scriptLink = './' + revManifestJs[module + config.name.jsbundlesuffix] || ''
        }
      }

      if (!config.modules.includes(module)){
        scriptLink = []
      }

      // global.json 全局数据，页面中直接通过属性名调用
      const globalProfilePath = config.template + '/global.json'
      let globalProfile = {}
      if(fs.existsSync(globalProfilePath)){
        globalProfile = JSON.parse(fs.readFileSync(globalProfilePath))
      }

      // filename.json 页面数据，页面中通过local.属性名调用
      const localProfilePath = path.join(path.dirname(filePath), module + '.json')
      let localProfile = {}
      if(fs.existsSync(localProfilePath)){
        localProfile = JSON.parse(fs.readFileSync(localProfilePath))
      }
      const finalProfile = Object.assign(globalProfile, {
        // local: 每个页面对应的数据，页面中通过 local.属性 调用
        local: Object.assign(localProfile, {
          styles: (localProfile.styles || []).concat(styleLink),
          scripts: (localProfile.scripts || []).concat(scriptLink),
        })
      })
      console.log('****** Profile Start ******', module)
      console.log(finalProfile)
      console.log('****** Profile End ******', module)
      return finalProfile
    }))
    .pipe(ejs().on('error', function(err) {
      gutil.log(err)
      this.emit('end')
    }))
    .pipe(isDev ? gutil.noop() : htmlmin({ // Options Quick Reference: https://github.com/kangax/html-minifier
      removeComments: true,
      collapseWhitespace: true,
      removeRedundantAttributes: true,
      useShortDoctype: true,
      removeEmptyAttributes: true,
      removeStyleLinkTypeAttributes: true,
      keepClosingSlash: true,
      minifyJS: true,
      minifyCSS: true,
      minifyURLs: true,
    }))
    .pipe(gulp.dest(config.dist))
})

// 静态资源文件拷贝
gulp.task('compile:static',function(){
  return gulp.src(`src/static/**`).pipe(gulp.dest(`dist/static`))
})

gulp.task('compile', ['compile:js', 'compile:css', 'compile:images', 'compile:static'], function () {
  return gulp.start('compile:html')
})


gulp.task('compile-sync', ['compile'], browserSync.reload)

// 开发服务
gulp.task('dev', ['clean'], function() {
  gulp.start('compile-sync')

  browserSync.init({
    server: {
      baseDir: config.dist
    },
    reloadDebounce: 0
  })

  // 无论是数据文件更改还是模版更改都会触发页面自动重载
  gulp.watch(config.src + '/**/*.*', ['compile-sync'])
})

// 构建
gulp.task('build', ['clean'], function () {
  return gulp.start('compile')
})

// 打包
gulp.task('zip', ['clean:trial'], function () {
  return gulp.src(config.dist + '/**/*.*')
    .pipe(zip('dist.zip'))
    .pipe(gulp.dest('./'))
})
