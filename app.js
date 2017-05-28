/*
 * Author: Onur SEZER
 */
var config = require('./config');
var express = require('express');
var http = require('http');
var path = require('path');
var fs = require('fs');
var multer = require('multer');
var  formidable = require('formidable');
var crypto = require("crypto");



var app = express();


// all environments
app.set('port', process.env.PORT || 5000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use("/public", express.static(path.join(__dirname, 'public')));

// Upload route.
app.post('/upload', function (req, res) {
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    // `file` is the name of the <input> field of type `file`
    var id = crypto.randomBytes(3).toString('hex');
    var old_path = files.file.path,
      file_size = files.file.size,
      file_ext = files.file.name.split('.').pop(),
      index = old_path.lastIndexOf('/') + 1,
      file_name = old_path.substr(index),
      new_path = path.join(process.env.PWD, config.FOLDERNAME, id + '.' + file_ext);

    fs.readFile(old_path, function (err, data) {
      fs.writeFile(new_path, data, function (err) {
        fs.unlink(old_path, function (err) {
          if (err) {
            res.status(500);
            res.json({ 'success': false });
          } else {
            fs.readdir(config.UPLOADDIR, function (err, list) {
              if (err)
                throw err;
              console.log(list);
              res.render('fileUpload', { fileList: list });
            });

          }
        });
      });
    });
  });
});

app.get('/', function (req, res) {

  fs.readdir(config.UPLOADDIR, function (err, list) {
    if (err)
      throw err;
    console.log(list);
    res.render('fileUpload', { fileList: list});
  });


});

app.get('/deleteFile/:file', function (req, res) {
  var targetPath = config.UPLOADDIR + req.param("file");


  fs.unlink(targetPath, function (err) {
    if (err) {
      res.send("Error to delete file: " + err);
    } else {
      res.send("File deleted successfully!");
    }
  })


});

app.get('/filelist', function (req, res) {
  fs.readdir(config.UPLOADDIR, function (err, list) {
    if (err)
      throw err;
    res.render('filelist', { fileList: list, folderName : config.FOLDERNAME });
  });

});


http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});




