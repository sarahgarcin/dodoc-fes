var i18n = require('i18n');
var siofu = require("socketio-file-upload");

i18n.configure({
	locales: ['fr', 'en'],
	defaultLocale: 'en',
	cookie: 'locale',
	directory: __dirname + '/locales'
});

module.exports = function(app,express){

  // app.set("ipaddr", "127.0.0.1"); //Server's IP address
  app.set("port", 8080); //Server's port number
  app.set("views", __dirname + "/views"); //Specify the views folder
  app.set("view engine", "jade"); //View engine is Jade
  app.use(express.static(__dirname + "/public")); //Specify where the static content is
  app.use(express.static(__dirname + "/sessions"));
  app.use('/static', express.static("sessions"));
  app.use(express.bodyParser()); //Tells server to support JSON, urlencoded, and multipart requests
  app.use(i18n.init); // module de translation
}