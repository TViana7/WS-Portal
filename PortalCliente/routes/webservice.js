var express = require('express');
var router = express.Router();
var sql = require('mssql');
var CryptoJS = require("crypto-js");
//var jwt = require('jsonwebtoken');

var connection = new sql.Connection({
    user:'SA',
    password:'tia#7via',
    database:'CustomerPortal',
    server:'localhost'
  });

connection.connect(function(err){
    if(err) throw err;
});


/* GET home page. */
router.get('/', function(req, res, next) {
 
    res.send("vazio");
});


/*
  Retorna toda a informação consoante a tabela inserida
*/
router.get('/:tablename', function(req, res, next) {
  var table = req.params.tablename;
  var request = new sql.Request(connection);
    request.query('SELECT * FROM '+ table , function(err, recordset){
      if(err){
        return next(err);
      }
      res.send(recordset);
    });

});


module.exports = router;

/*
  Inserir Perfis
*/

router.post('/inserirPerfil', function(req, res, next){

  var email = req.body.email;  
  var password = req.body.password; 
  console.log("entrada:"+email, password);

  request.query("INSERT Into utilizador where email= '"+email+"' and password= '"+password+"'", function(err, user){
      if(err){
        return next(err);
      }else{
        
      }


    });
});

/*Retorna os UrlsNovo*/
router.get('/mapeamento/getURL', function(req, res, next){
  var array=[];
  var request = new sql.Request(connection);
  request.query("select idurl, nome, url  from url", function(err, urlmaster){
      if(err){
        return next(err);
      }else{
        urlmaster.forEach(function(u, index){
          request.query("select urlChild.IdUrlChild, urlChild.NomeUrlChild from urlChild, url where url.IdUrl = urlChild.URL and url.IdUrl='"+u.idurl+"'", function(err, urlchild){
            var item={"IdUrl":u.idurl, "Nome":u.nome, "urlChild":urlchild};
            array.push(item);
            if(index==urlmaster.length-1){
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

router.get('/mapeamento/getURL/teste', function(req, res, next){
  var array=[];
  var arrayGlobal=[];
  var arrayCopy=[];

  //console.log(req.headers.authorization);
  //var token = req.headers.authorization;
        var request = new sql.Request(connection);
        request.query("select descricao, idurl, nome from categoria, url where categoria.IdCategoria = url.categoria order by url", function(err, recordset){
            if(err){
              return next(err);
            }else{

              //console.log(recordset);
              arrayCopy=recordset;
          
                arrayCopy.forEach(function(element,index){
                      var aux=element.descricao;
                      arrayCopy.forEach(function(element, index) {
                        if(String(element.descricao)===String(aux)){
                          var item = {"idurl":element.idurl,"nome":element.nome};
                          array.push(item);                    
                        }
                      
                      }, this);
                      arrayCopy.forEach(function(element, index) {
                        if(String(element.descricao)===String(aux)){
                          arrayCopy.splice(index,1);
                        }
                      
                      }, this);

                      var item1 = {"Descricao":aux,"infos":array};
                          arrayGlobal.push(item1);
                          array=[];

                }, this);
                //console.log(arrayGlobal);
                res.send(arrayGlobal);

              } 

          });
});

/*

Inserir perfis

*/

router.post('/perfis/inserirPerfil/novoPerfil', function(req, res, next){
  res.setHeader('Access-Control-Allow-Origin', '*');
  var request = new sql.Request(connection);
  request.query("select NomePerfil from perfil where NomePerfil='"+req.body.nome+"'", function(err, resposta){
    if(err){
        return next(err);
    }
    if(Object.keys(resposta).length==0){
        request.query("insert into perfil (NomePerfil, Descricao, Cliente) values ('"+req.body.nome+"', '"+req.body.descricao+"','"+req.body.cliente+"')", function(err){
          if(err){
            return next(err);
          }
          else{  
              request.query("SELECT IdPerfil FROM perfil where NomePerfil='"+req.body.nome+"'", function(err, idPerfil){
                if(err){
                  return next(err);
                }else{
                  var idPerfil=idPerfil[0].IdPerfil;
                  for (var index = 0; index < req.body.url.length; index++) {
                    request.query("insert into Mapa (Perfil, Url) values ('"+idPerfil+"','"+req.body.url[index]+"')");  
                  }
                  return res.json({
                      sucesso: true,
                      message:"Perfil adicionado com sucesso!"
                  })
                } 
              });
          }
        });
    }else{
      return res.json({
                sucesso: false,
                message:"Este perfil já existe!"
      })
    }
    
  });

});

/*

Listagem de perfis

*/

router.get('/perfis/todosperfis/getperfis', function(req, res, next){
  var array=[];
  var request = new sql.Request(connection);
  request.query("select IdPerfil, NomePerfil, Descricao from perfil", function(err, perfis){
      if(err){
        return next(err);
      }else{
        perfis.forEach(function(perfil, index){
          request.query("select Nome from url, mapa where mapa.Perfil='"+perfil.IdPerfil+"' and mapa.Url = url.IdUrl", function(err, url){
            var item={"IdPerfil":perfil.IdPerfil,"NomePerfil":perfil.NomePerfil,"Descricao":perfil.Descricao, "Url":url};
            array.push(item);
            if(index==perfis.length-1){
              res.send(array);
            }
          });
        });

      }




      
    });

    


});


/*
  Delete Perfis
*/

router.post('/perfis/deletePerfis', function(req, res, next){

  var idper = req.body.idperfil;   
  console.log("entrada:"+idper);
  var request = new sql.Request(connection);
  request.query("SELECT perfil from PerfilUtilizador where perfilUtilizador.perfil='"+idper+"'", function(err, perfiluser){
    if(err){
      return next(err);
    }
    if(perfiluser.length==0){
            console.log(perfiluser.length);
            request.query("delete from mapa where perfil='"+ idper +"'", function(err, recordset){
            if(err){
              return next(err);
            }else{
              request.query("delete from perfil where IdPerfil='"+ idper +"'",function(err, recordset1){
                if(err){
                  return next(err);
                }else{
                  res.json({
                    sucesso: true,
                    message:"Perfil elimnado com sucesso"
                  })
                }
              });
            }
          });
      }else{
        res.json({
            sucesso: false,
            message:"Utiliador associado a este perfil!"
        })
      }
  } );
  
});

/*
  Retorna o cliente para para o formario inserir utilizador
*/
router.post('/cliente/outrosUtilizadores', function(req, res, next) {
  var idUser = req.body.idUser;
  console.log(idUser);   
  var request = new sql.Request(connection);
    request.query("select Cliente.Idcliente, Cliente.ClienteNome from Cliente, Utilizador where Utilizador.IdUtilizador='"+idUser+"' and Utilizador.Cliente = Cliente.Idcliente" , function(err, recordset){
      if(err){
        return next(err);
      }
      res.send(recordset);
    });

});

/*
  Retorna perfis de um dado cliente
*/
router.post('/perfis/perfisCliente', function(req, res, next) {
  var cliente = req.body.idCliente;
  console.log(cliente);   
  var request = new sql.Request(connection);
    request.query("Select * from perfil where cliente='"+cliente+"'" , function(err, recordset){
      if(err){
        return next(err);
      }
      res.send(recordset);
    });

});

/*

Inserir Utilizadores

*/

router.post('/utilizador/inserirUtilizador/novoUtilizador', function(req, res, next){
  res.setHeader('Access-Control-Allow-Origin', '*');
  var request = new sql.Request(connection);
  request.query("select Email from utilizador where Email='"+req.body.Email+"'", function(err, resposta){
    if(err){
        return next(err);
    }
    if(Object.keys(resposta).length==0){
        var password = Math.random().toString(36).slice(-8);
        console.log(password);
        var passwordEncript="123456789";//CryptoJS.SHA256(password);
        request.query("insert into Utilizador (Email, Password, Nome, Cliente) values ('"+req.body.Email+"', '"+passwordEncript+"','"+req.body.Nome+"','"+req.body.Cliente+"')", function(err){
          if(err){
            return next(err);
          }
          else{  
              request.query("SELECT IdUtilizador FROM utilizador where Email='"+req.body.Email+"'", function(err, idUtilizador){
                if(err){
                  return next(err);
                }else{
                  var idusr=idUtilizador[0].IdUtilizador;
                  console.log(idusr)
                  for (var index = 0; index < req.body.url.length; index++) {
                    request.query("insert into perfilUtilizador (Perfil, Utilizador) values ('"+req.body.url[index]+"','"+idusr+"')");  
                  }
                  return res.json({
                      sucesso: true,
                      message:"Utilizador adicionado com sucesso!"
                  })
                } 
              });
          }
        });
    }else{
      return res.json({
                sucesso: false,
                message:"Este Utilizador já existe!"
      })
    }
    
  });

});


//retorna todos os utlizadores
router.get('/utilizadores/todosutilizadores/getutilizadores', function(req, res, next){
  var array=[];
  var request = new sql.Request(connection);
  request.query("select utilizador.IdUtilizador, utilizador.Nome, utilizador.email, cliente.ClienteNome from utilizador, cliente where utilizador.cliente = cliente.Idcliente", function(err, utilizadores){
      if(err){
        return next(err);
      }else{
        utilizadores.forEach(function(utilizador, index){
          request.query("select perfil.NomePerfil from perfil, perfilUtilizador, utilizador where utilizador.idUtilizador='"+utilizador.IdUtilizador+"' and utilizador.idUtilizador = perfilUtilizador.Utilizador and perfilUtilizador.Perfil = perfil.IdPerfil", function(err, perfis){
            var item={"IdUtilizador":utilizador.IdUtilizador,"NomeUtilizador":utilizador.Nome,"Email":utilizador.email,"Cliente":utilizador.ClienteNome, "perfis":perfis};
            array.push(item);
            console.dir(array);
            if(index==utilizadores.length-1){
              res.send(array);
              
            }
          });
        });

      }




      
    });

    


});






module.exports = router; 




