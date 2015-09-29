var _ = require("underscore");
var url = require('url')
var fs = require('fs-extra');
var i18n = require('i18n');

module.exports = function(app,io,m){

  /**
  * routing event
  */
  app.get("/", getIndex);
  app.get("/:session", getSelect);
  app.get("/:session/:projet", getProject);
  app.get("/:session/capture", getCapture);
  app.get("/:session/flux", getFlux);
  app.get("/:session/publi", getPubli);

  // set a cookie to requested locale
  app.get('/:locale', function (req, res) {
    res.cookie('locale', req.params.locale);
  });

  /**
  * routing functions
  */

  // GET
  function getIndex(req, res) {
    res.render("index", {title : "Do.Doc"});
  };
  function getSelect(req, res) {
    var session = req.param('session');
    var sessionPath = 'sessions/'+session;

    fs.ensureDirSync(sessionPath);

    res.render("select", {
      title : "Bibliotheque de media",
      session : session,
    });
  };

  function getProject(req, res) {
    var session = req.param('session');
    var projet = req.param('projet');
    var projetPath = 'sessions/'+session+"/"+projet;

    fs.ensureDirSync(projetPath);

    res.render("projet", {
      title : "Projet",
      session : session,
      projet : projet
    });
  };
  function getCapture(req, res) {
    var session = req.param('session');

    res.render("capture", {
      title : "Prise de vue",
      session : session,
    });
  };

  function getFlux(req, res) {
    var session = req.param('session');
    var sessionPath = 'sessions/'+session;

    fs.ensureDirSync(sessionPath);

    res.render("flux", {
      title : "Futur en Seine",
      session : session,
    });
  };


  function getPubli(req, res) {
    var session = req.param('session');
    var sessionPath = 'sessions/'+session;

    res.render("publication", {
      title : "Publication",
      session : session,
    });
  };


};