var express = require('express'), _ = require('lodash'), config = require('config');
var router = express.Router();
var sql = require('mssql');
var jwt = require('jsonwebtoken');
var moment = require('moment');
var app = express();
var jwt = require('jwt-simple');

app.set('jwtTokenSecret', 'YOUR_SECRET_STRING');


//var jwt = require('jsonwebtoken');



var connection = new sql.Connection({
  user: 'SA',
  password: 'tia#7via',
  database: 'CustomerPortal',
  server: 'localhost'
});

connection.connect(function (err) {
  if (err) throw err;
});


/* GET home page. */
router.get('/', function (req, res, next) {

  res.send("vazio");
});


router.post('/autenticacao', function (req, res, next) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  //console.log(req.body);
  var email = req.body.email;
  var password = req.body.password;
  console.log("entrada:" + email, password);

  var request = new sql.Request(connection);
  request.query("SELECT IdUtilizador, Utilizador.Email, Utilizador.Nome, Utilizador.Cliente, IdNav FROM utilizador, cliente where Utilizador.Email= '" + email + "' and Password= '" + password + "' and utilizador.Cliente = cliente.Idcliente", function (err, user) {
    if (err) {
      return next(err);
    } else {
      console.log(Object.keys(user).length);
      if (!Object.keys(user).length == 0) {
        request.query("select distinct categoria.IdCategoria, categoria.descricao from categoria, url, mapa, perfil, perfilUtilizador where perfilUtilizador.Utilizador='" + user[0].IdUtilizador + "' and perfilutilizador.Perfil = perfil.IdPerfil and perfil.IdPerfil = mapa.Perfil and mapa.Url = url.IdUrl and url.Categoria= categoria.IdCategoria", function (err, cat) {
          if (err) {
            return next(err);
          } else {
            var arrayLinks = [];
            cat.forEach(function (c, index) {
              request.query("select distinct url.url from url, categoria, mapa, perfil, perfilUtilizador where perfilUtilizador.Utilizador='" + user[0].IdUtilizador + "' and perfilutilizador.Perfil = perfil.IdPerfil and perfil.IdPerfil = mapa.Perfil and mapa.Url = url.IdUrl and url.Categoria='" + c.IdCategoria + "'", function (err, url) {
                if (err) {
                  return next(err);
                } else {
                  let item = { "categoria": c.descricao, "url": url };
                  arrayLinks.push(item);
                  if (index == cat.length - 1) {
                    var expires = moment().add('days', 1).valueOf();
                    var token = jwt.encode({
                      iss: user.IdUtilizador,
                      exp: expires
                    }, app.get('jwtTokenSecret'));

                    setTimeout(() => {

                      res.json({
                        token: token,
                        expires: expires,
                        sucesso: true,
                        user: { Idutilizador: user[0].IdUtilizador, Email: user[0].Email, Nome: user[0].Nome, Cliente: user[0].Cliente, IdNav: user[0].IdNav },
                        url: arrayLinks
                      });
                    }, 200)

                  }

                }
              });

            }, this);

          }
        });
      } else {
        return res.json({
          sucesso: false,
          message: "Login Inválido"
        })
      }

    }
    //console.log(user[0].Password);
    //res.send(recordset);


  });

});

module.exports = router;
