//使用fis-parser-jade插件编译jade文件 
fis.config.set('modules.parser.jade', 'jade');
//jade文件经过编译后输出为html文件 
fis.config.set('roadmap.ext.jade', 'html');

fis.config.set('modules.parser.styl', 'stylus2');
fis.config.set('settings.parser.stylus2.define', {enable: true, color: '#000'});//you can add your settings 
fis.config.set('settings.parser.stylus2.sourcemap', false);//use sourcemap or not, there are some bugs in stylus modules when it is opened 
fis.config.set('roadmap.ext.styl', 'css');

fis.match('*', {
  useHash: false
});

fis.match('::packager', {
  postpackager: fis.plugin('loader', {
    //allInOne: true
  })
});

fis.match('*.{css,less}', {
  packTo: '/static/aio.css'
});

fis.match('*.styl', {
  // fis-parser-stylus2 插件进行解析
  parser: fis.plugin('stylus2'),
  // .styl 文件后缀构建后被改成 .css 文件
  rExt: '.css'
})

fis.match('*.jade',{
  // fis-parser-jade 插件进行解析
  parser: fis.plugin('jade'),
  // .jade 文件后缀构建后被改成 .html 文件
  rExt: '.HTML'
});

