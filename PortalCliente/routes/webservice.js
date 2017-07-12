var express = require('express');
var router = express.Router();
var sql = require('mssql');
var CryptoJS = require("crypto-js");
//var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');


var connection = new sql.Connection({
  user: 'SA',
  password: 'tia#7via',
  database: 'CustomerPortal',
  server: 'localhost'
});

connection.connect(function (err) {
  if (err) throw err;
});




/*
Função Enviar email
*/

function enviaEmail(nomeutilizador, idutilizador, email) {
  var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'tiago.viana7@gmail.com', // Your email id
      pass: 'Tiago#7viana' // Your password
    }
  });

  var text = 'Caro(a) ' + nomeutilizador + ',\n\nPara definir uma nova password, aceda ao site através do seguinte link:\n\nhttp://localhost:4200/utilizador/novapassword/' + idutilizador + '\n\nMelhores Cumprimentos,\n\nIten Solutions.';

  var mailOptions = {
    from: 'tiago.viana7@gmail.com', // sender address
    to: email, // list of receivers
    subject: 'Definir password de utilizador Iten', // Subject line
    text: text //, // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log("erro");
      res.json({ yo: 'error' });
    } else {
      console.log('Message sent: ' + info.response);
      res.json({ yo: info.response });
    };
  });

}

router.post('/password/recuperarPassword', function (req, res, next) {
  //console.log(req.body.Email);
  var request = new sql.Request(connection);
  request.query("select IdUtilizador, nome from utilizador where email='" + req.body.Email + "'", function (err, user) {
    if (err) {
      return next(err);
    } else {
      console.log(Object.keys(user).length);
      if (Object.keys(user).length != 0) {
        console.log(user[0].nome);
        console.log(user[0].IdUtilizador);
        enviaEmail(user[0].nome, user[0].IdUtilizador, req.body.Email);
      } else {
        return res.json({
          sucesso: false,
          message: "Email inválido!"
        });

      }
    }

  });
});






/* GET home page. */
router.get('/', function (req, res, next) {

  res.send("vazio");
});


/*
  Retorna toda a informação consoante a tabela inserida
*/
router.get('/:tablename', function (req, res, next) {
  var table = req.params.tablename;
  var request = new sql.Request(connection);
  request.query('SELECT * FROM ' + table, function (err, recordset) {
    if (err) {
      return next(err);
    }
    res.send(recordset);
  });

});


module.exports = router;

/*
  Inserir Perfis
*/

router.post('/inserirPerfil', function (req, res, next) {

  var email = req.body.email;
  var password = req.body.password;
  console.log("entrada:" + email, password);

  request.query("INSERT Into utilizador where email= '" + email + "' and password= '" + password + "'", function (err, user) {
    if (err) {
      return next(err);
    } else {

    }


  });
});

/*Retorna os UrlsNovo*/
router.get('/mapeamento/getURL', function (req, res, next) {
  var array = [];
  var request = new sql.Request(connection);
  request.query("select idurl, nome, url  from url", function (err, urlmaster) {
    if (err) {
      return next(err);
    } else {
      urlmaster.forEach(function (u, index) {
        request.query("select urlChild.IdUrlChild, urlChild.NomeUrlChild from urlChild, url where url.IdUrl = urlChild.URL and url.IdUrl='" + u.idurl + "'", function (err, urlchild) {
          var item = { "IdUrl": u.idurl, "Nome": u.nome, "urlChild": urlchild };
          array.push(item);
          if (index == urlmaster.length - 1) {
            res.send(array);
          }
        });
      }, this);

    }





  });
});







/*
  Retorna URL por categoria
*/

router.get('/mapeamento/getURL/teste', function (req, res, next) {
  var array = [];
  var arrayGlobal = [];
  var arrayCopy = [];

  //console.log(req.headers.authorization);
  //var token = req.headers.authorization;
  var request = new sql.Request(connection);
  request.query("select descricao, idurl, nome from categoria, url where categoria.IdCategoria = url.categoria order by url", function (err, recordset) {
    if (err) {
      return next(err);
    } else {

      //console.log(recordset);
      arrayCopy = recordset;

      arrayCopy.forEach(function (element, index) {
        var aux = element.descricao;
        arrayCopy.forEach(function (element, index) {
          if (String(element.descricao) === String(aux)) {
            var item = { "idurl": element.idurl, "nome": element.nome };
            array.push(item);
          }

        }, this);
        arrayCopy.forEach(function (element, index) {
          if (String(element.descricao) === String(aux)) {
            arrayCopy.splice(index, 1);
          }

        }, this);

        var item1 = { "Descricao": aux, "infos": array };
        arrayGlobal.push(item1);
        array = [];

      }, this);
      //console.log(arrayGlobal);
      res.send(arrayGlobal);

    }

  });
});

/*

Inserir perfis

*/

router.post('/perfis/inserirPerfil/novoPerfil', function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  var request = new sql.Request(connection);
  request.query("select NomePerfil from perfil where NomePerfil='" + req.body.nome + "'", function (err, resposta) {
    if (err) {
      return next(err);
    }
    if (Object.keys(resposta).length == 0) {
      request.query("insert into perfil (NomePerfil, Descricao, Cliente) values ('" + req.body.nome + "', '" + req.body.descricao + "','" + req.body.cliente + "')", function (err) {
        if (err) {
          return next(err);
        }
        else {
          request.query("SELECT IdPerfil FROM perfil where NomePerfil='" + req.body.nome + "'", function (err, idPerfil) {
            if (err) {
              return next(err);
            } else {
              var idPerfil = idPerfil[0].IdPerfil;
              for (var index = 0; index < req.body.url.length; index++) {
                request.query("insert into Mapa (Perfil, Url) values ('" + idPerfil + "','" + req.body.url[index] + "')");
              }
              return res.json({
                sucesso: true,
                message: "Perfil adicionado com sucesso!"
              })
            }
          });
        }
      });
    } else {
      return res.json({
        sucesso: false,
        message: "Este perfil já existe!"
      })
    }

  });

});




/*

Update perfis

*/

router.post('/perfis/inserirPerfil/update', function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  var request = new sql.Request(connection);
  request.query("select NomePerfil from perfil where NomePerfil='" + req.body.nome + "'", function (err, resposta) {
    if (err) {
      return next(err);
    }
    if (Object.keys(resposta).length == 0) {
      console.log("passa");
      request.query("DELETE FROM mapa where mapa.Perfil='" + req.body.idperfil + "'", function (err) {
        if (err) {
          return next(err);
        } else {
          request.query("update perfil set nomePerfil='" + req.body.nome + "', descricao='" + req.body.descricao + "' where IdPerfil='" + req.body.idperfil + "'", function (err) {
            if (err) {
              return next(err);
            }
            else {
              request.query("SELECT IdPerfil FROM perfil where NomePerfil='" + req.body.nome + "'", function (err, idPerfil) {
                if (err) {
                  return next(err);
                } else {
                  var idPerfil = idPerfil[0].IdPerfil;
                  for (var index = 0; index < req.body.url.length; index++) {
                    request.query("insert into Mapa (Perfil, Url) values ('" + idPerfil + "','" + req.body.url[index] + "')");
                  }
                  return res.json({
                    sucesso: true,
                    message: "Perfil adicionado com sucesso!"
                  })
                }
              });
            }
          });
        }
      });
    }
    request.query("select descricao from perfil where descricao='" + req.body.descricao + "'", function (err, resposta) {
      if (err) {
        return next(err);
      }
      if (Object.keys(resposta).length == 0) {
        console.log("passa");
        request.query("DELETE FROM mapa where mapa.Perfil='" + req.body.idperfil + "'", function (err) {
          if (err) {
            return next(err);
          } else {
            request.query("update perfil set nomePerfil='" + req.body.nome + "', descricao='" + req.body.descricao + "' where IdPerfil='" + req.body.idperfil + "'", function (err) {
              if (err) {
                return next(err);
              }
              else {
                request.query("SELECT IdPerfil FROM perfil where NomePerfil='" + req.body.nome + "'", function (err, idPerfil) {
                  if (err) {
                    return next(err);
                  } else {
                    var idPerfil = idPerfil[0].IdPerfil;
                    for (var index = 0; index < req.body.url.length; index++) {
                      request.query("insert into Mapa (Perfil, Url) values ('" + idPerfil + "','" + req.body.url[index] + "')");
                    }
                    return res.json({
                      sucesso: true,
                      message: "Perfil adicionado com sucesso!"
                    })
                  }
                });
              }
            });
          }
        });
      }
      else {
        request.query("DELETE FROM mapa where mapa.Perfil='" + req.body.idperfil + "'", function (err) {
          if (err) {
            return next(err);
          } else {
            request.query("SELECT IdPerfil FROM perfil where NomePerfil='" + req.body.nome + "'", function (err, idPerfil) {
              if (err) {
                return next(err);
              } else {
                var idPerfil = idPerfil[0].IdPerfil;
                for (var index = 0; index < req.body.url.length; index++) {
                  request.query("insert into Mapa (Perfil, Url) values ('" + idPerfil + "','" + req.body.url[index] + "')");
                }
                return res.json({
                  sucesso: true,
                  message: "Perfil adicionado com sucesso!"
                })
              }
            });
          }
        });
      }
    });
  });
});



/*

Listagem de perfis

*/

router.get('/perfis/todosperfis/getperfis', function (req, res, next) {
  var array = [];
  var request = new sql.Request(connection);
  request.query("select IdPerfil, NomePerfil, Descricao from perfil order by NomePerfil", function (err, perfis) {
    if (err) {
      return next(err);
    } else {
      perfis.forEach(function (perfil, index) {
        request.query("select Nome from url, mapa where mapa.Perfil='" + perfil.IdPerfil + "' and mapa.Url = url.IdUrl order by Nome", function (err, url) {
          var item = { "IdPerfil": perfil.IdPerfil, "NomePerfil": perfil.NomePerfil, "Descricao": perfil.Descricao, "Url": url };
          array.push(item);
          if (index == perfis.length - 1) {
            setTimeout(() => {
              res.send(array);
            }, 200)
          }
        });
      });

    }
  });




});


/*
  Delete Perfis
*/

router.post('/perfis/deletePerfis', function (req, res, next) {

  var idper = req.body.idperfil;
  console.log("entrada:" + idper);
  var request = new sql.Request(connection);
  request.query("SELECT perfil from PerfilUtilizador where perfilUtilizador.perfil='" + idper + "'", function (err, perfiluser) {
    if (err) {
      return next(err);
    }
    if (perfiluser.length == 0) {
      console.log(perfiluser.length);
      request.query("delete from mapa where perfil='" + idper + "'", function (err, recordset) {
        if (err) {
          return next(err);
        } else {
          request.query("delete from perfil where IdPerfil='" + idper + "'", function (err, recordset1) {
            if (err) {
              return next(err);
            } else {
              res.json({
                sucesso: true,
                message: "Perfil elimnado com sucesso"
              })
            }
          });
        }
      });
    } else {
      res.json({
        sucesso: false,
        message: "Utiliador associado a este perfil!"
      })
    }
  });

});


/*
  retorna Url pra editar perfil
*/

router.post('/perfis/editarPerfis/getUrl', function (req, res, next) {
  var idPerfil = req.body.idperfil;
  var request = new sql.Request(connection);
  request.query("select url from mapa where mapa.Perfil='" + idPerfil + "'", function (err, recordset) {
    if (err) {
      return next(err);
    }
    console.log(recordset);
    res.send(recordset);
  });
});





/*
  Retorna o cliente para para o formario inserir utilizador
*/
router.post('/cliente/outrosUtilizadores', function (req, res, next) {
  var idUser = req.body.idUser;
  console.log(idUser);
  var request = new sql.Request(connection);
  request.query("select Cliente.Idcliente, Cliente.ClienteNome from Cliente, Utilizador where Utilizador.IdUtilizador='" + idUser + "' and Utilizador.Cliente = Cliente.Idcliente", function (err, recordset) {
    if (err) {
      return next(err);
    }
    res.send(recordset);
  });

});

/*
  Retorna perfis de um dado cliente
*/
router.post('/perfis/perfisCliente', function (req, res, next) {
  var cliente = req.body.idCliente;
  console.log(cliente);
  var request = new sql.Request(connection);
  request.query("Select * from perfil where cliente='" + cliente + "'", function (err, recordset) {
    if (err) {
      return next(err);
    }
    let perfis = { recordset };
    res.send(recordset);
  });

});

/*

Inserir Utilizadores

*/

router.post('/utilizador/inserirUtilizador/novoUtilizador', function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  var request = new sql.Request(connection);
  request.query("select Email from utilizador where Email='" + req.body.Email + "'", function (err, resposta) {
    if (err) {
      return next(err);
    }
    if (Object.keys(resposta).length == 0) {
      var password = Math.random().toString(36).slice(-8);
      console.log(password);
      var passwordEncript = "123456789";//CryptoJS.SHA256(password);
      request.query("insert into Utilizador (Email, Password, Nome, Cliente) values ('" + req.body.Email + "', '" + passwordEncript + "','" + req.body.Nome + "','" + req.body.Cliente + "')", function (err) {
        if (err) {
          return next(err);
        }
        else {
          request.query("SELECT IdUtilizador FROM utilizador where Email='" + req.body.Email + "'", function (err, idUtilizador) {
            if (err) {
              return next(err);
            } else {
              var idusr = idUtilizador[0].IdUtilizador;
              console.log(idusr)
              for (var index = 0; index < req.body.url.length; index++) {
                request.query("insert into perfilUtilizador (Perfil, Utilizador) values ('" + req.body.url[index] + "','" + idusr + "')");
              }
              enviaEmail(req.body.Nome, idusr, req.body.Email);

              return res.json({
                sucesso: true,
                message: "Utilizador adicionado com sucesso!"
              })
            }
          });
        }
      });
    } else {
      return res.json({
        sucesso: false,
        message: "Este Utilizador já existe!"
      })
    }

  });

});

/*

update Utilizadores

*/

router.post('/utilizador/updateUtilizadores', function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  var request = new sql.Request(connection);
  console.log(req.body);

  request.query("select Email from utilizador where Email='" + req.body.Email + "'", function (err, resposta) {
    if (err) {
      return next(err);
    }
    if (Object.keys(resposta).length == 0) {
      request.query("update utilizador set nome ='" + req.body.Nome + "', email ='" + req.body.Email + "', cliente ='" + req.body.Cliente + "' where IdUtilizador='" + req.body.id + "'", function (err) {
        if (err) {
          return next(err);
        }
        else {
          console.log("passa aqui0");
          request.query("delete from perfilUtilizador where utilizador ='" + req.body.id + "'", function (err) {
            if (err) {
              return next(err);
            }
            else {
              console.log("passa aqui123");
              for (var index = 0; index < req.body.perfis.length; index++) {
                request.query("insert into perfilUtilizador (Perfil, Utilizador) values ('" + req.body.perfis[index] + "','" + req.body.id + "')");
              }
            }
            return res.json({
              sucesso: true,
              message: "Utilizador Editado com sucesso!"
            });
          });
        }
      });
    }
    request.query("select nome from utilizador where nome='" + req.body.Nome + "'", function (err, resposta) {
      if (err) {
        return next(err);
      }
      if (Object.keys(resposta).length == 0) {
        request.query("update utilizador set nome ='" + req.body.Nome + "', email ='" + req.body.Email + "', cliente ='" + req.body.Cliente + "' where IdUtilizador='" + req.body.id + "'", function (err) {
          if (err) {
            return next(err);
          }
          else {
            console.log("passa aqui0");
            request.query("delete from perfilUtilizador where utilizador ='" + req.body.id + "'", function (err) {
              if (err) {
                return next(err);
              }
              else {
                console.log("passa aqui123");
                for (var index = 0; index < req.body.perfis.length; index++) {
                  request.query("insert into perfilUtilizador (Perfil, Utilizador) values ('" + req.body.perfis[index] + "','" + req.body.id + "')");
                }
              }
              return res.json({
                sucesso: true,
                message: "Utilizador Editado com sucesso!"
              });
            });
          }
        });
      }
      request.query("select cliente from utilizador where nome='" + req.body.Cliente + "'", function (err, resposta) {
        if (err) {
          return next(err);
        }
        if (Object.keys(resposta).length == 0) {
          request.query("update utilizador set nome ='" + req.body.Nome + "', email ='" + req.body.Email + "', cliente ='" + req.body.Cliente + "' where IdUtilizador='" + req.body.id + "'", function (err) {
            if (err) {
              return next(err);
            }
            else {
              console.log("passa aqui0");
              request.query("delete from perfilUtilizador where utilizador ='" + req.body.id + "'", function (err) {
                if (err) {
                  return next(err);
                }
                else {
                  console.log("passa aqui123");
                  for (var index = 0; index < req.body.perfis.length; index++) {
                    request.query("insert into perfilUtilizador (Perfil, Utilizador) values ('" + req.body.perfis[index] + "','" + req.body.id + "')");
                  }
                }
                return res.json({
                  sucesso: true,
                  message: "Utilizador Editado com sucesso!"
                });
              });
            }
          });
        }
        else {
          request.query("delete from perfilUtilizador where utilizador ='" + req.body.id + "'", function (err) {
            if (err) {
              return next(err);
            }
            else {
              console.log("passa aqui123");
              for (var index = 0; index < req.body.perfis.length; index++) {
                request.query("insert into perfilUtilizador (Perfil, Utilizador) values ('" + req.body.perfis[index] + "','" + req.body.id + "')");
              }
            }
            return res.json({
              sucesso: true,
              message: "Utilizador Editado com sucesso!"
            });
          });


        }


      });
    });

  });
});


/*
 
update perfil User
 
*/

router.post('/utilizador/updateuser', function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  var request = new sql.Request(connection);
  console.log(req);
  request.query("select Email from utilizador where Email='" + req.body.Email + "'", function (err, resposta) {
    if (err) {
      return next(err);
    }
    if (Object.keys(resposta).length == 0) {
      request.query("update utilizador set nome ='" + req.body.nome + "', email ='" + req.body.Email + "' where IdUtilizador='" + req.body.idperfil + "'", function (err) {
        if (err) {
          return next(err);
        }
        else {
          return res.json({
            sucesso: true,
            message: "Utilizador Editado com sucesso!"
          });
        }
      });
    } else {
      console.log("entra");
      request.query("update utilizador set nome ='" + req.body.nome + "'where IdUtilizador='" + req.body.idperfil + "'", function (err) {
        if (err) {
          return next(err);
        }
        else {
          return res.json({
            sucesso: true,
            message: "Utilizador Editado com sucesso!"
          });
        }
      });

    }

  });

});
/*
 
update password User
 
*/

router.post('/utilizador/updatepassword', function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  var request = new sql.Request(connection);
  console.log(req.body);
  request.query("select password from utilizador where password='" + req.body.PasswordAntiga + "' and IdUtilizador='" + req.body.IdUser + "'", function (err, resposta) {
    if (err) {
      return next(err);
    } else {
      console.log("entrou");
      if (Object.keys(resposta).length != 0) {
        console.log("entrou");
        request.query("update utilizador set password ='" + req.body.PasswordNova + "'where IdUtilizador='" + req.body.IdUser + "'", function (err) {
          if (err) {
            return next(err);
          }
          else {
            return res.json({
              sucesso: true,
              message: "Password Editada!"
            });
          }
        });
      } else {
        return res.json({
          sucesso: true,
          message: "Password Antiga incorreta!"
        });

      }
    }

  });

});

/*
Recover Password
*/

router.post('/utilizador/recoverpassword', function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  var request = new sql.Request(connection);
  console.log(req.body);
  request.query("select * from utilizador where IdUtilizador='" + req.body.iduser + "'", function (err, resposta) {
    if (err) {
      return next(err);
    } else {
      console.log("entrou");
      if (Object.keys(resposta).length != 0) {
        console.log("entrou");
        request.query("update utilizador set password ='" + req.body.password + "'where IdUtilizador='" + req.body.iduser + "'", function (err) {
          if (err) {
            return next(err);
          }
          else {
            return res.json({
              sucesso: true,
              message: "Password alterada!"
            });
          }
        });
      } else {
        return res.json({
          sucesso: true,
          message: "utilizador inexistente!"
        });

      }
    }

  });

});


/*
retorna todos os utlizadores
*/

function teste(callback) {
  var request = new sql.Request(connection);
  request.query("select utilizador.IdUtilizador, utilizador.Nome, utilizador.email, cliente.ClienteNome from utilizador, cliente where utilizador.cliente = cliente.Idcliente order by utilizador.Nome ", function (err, utilizadores, next) {
    if (err) {
      return next(err);
    }
    return callback(utilizadores);
  });
}


router.get('/utilizadores/todosutilizadores/getutilizadores', function (req, res, next) {
  var array = [];
  var ut = [];
  var request = new sql.Request(connection);

  teste(function (utilizadores) {

    utilizadores.forEach(function (utilizador, index) {
      //console.log("*****" + utilizador);
      request.query("select perfil.NomePerfil from perfil, perfilUtilizador, utilizador where utilizador.idUtilizador='" +
        utilizador.IdUtilizador + "' and utilizador.idUtilizador = perfilUtilizador.Utilizador and perfilUtilizador.Perfil = perfil.IdPerfil order by perfil.NomePerfil", function (err, perfis, next) {
          if (err) {
            next(err);
          } else {
            //console.log("#####" + perfis);
            var item = { "IdUtilizador": utilizador.IdUtilizador, "NomeUtilizador": utilizador.Nome, "Email": utilizador.email, "Cliente": utilizador.ClienteNome, "perfis": perfis };
            array.push(item);
            if (index == utilizadores.length - 1) {
              setTimeout(() => {
                res.send(array);
              }, 200)
            }
          }

        });

    });

  });


});


/*
 
retorna um utilizador com o email com o id de cliente e os perfis associados
 
*/

router.post('/utilizadores/infoUserEditUser', function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  var request = new sql.Request(connection);
  //console.log("estou aqi"+req.body.idutilizador);
  var array = [];
  request.query("select utilizador.Nome, utilizador.email, utilizador.cliente from utilizador where utilizador.IdUtilizador='" + req.body.idutilizador + "'", function (err, utilizadores, next) {
    if (err) {
      return next(err);
    } else {
      request.query("select perfil from perfilUtilizador where utilizador='" + req.body.idutilizador + "'", function (err, perfis, next) {
        if (err) {
          return next(err);
        } else {
          let item = { "nome": utilizadores[0].Nome, "email": utilizadores[0].email, "cliente": utilizadores[0].cliente, "perfis": perfis };
          array.push(item);
          res.send(array);
        }
      });
    }
  });
});
module.exports = router;




