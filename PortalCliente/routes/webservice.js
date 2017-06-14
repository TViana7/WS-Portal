var express = require('express');
var router = express.Router();
var sql = require('mssql');
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

/*
  Retorna URL por categoria
*/

router.get('/mapeamento/getURL/teste', function(req, res, next){
  var array=[];
  var arrayGlobal=[];
  var arrayCopy=[];

  var request = new sql.Request(connection);
  request.query("select descricao, idurl, nome from categoria, url where categoria.IdCategoria = url.categoria", function(err, recordset){
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
          console.log(arrayGlobal);
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
  var arrayGlobal=[];
  var arrayCopy=[];

  var request = new sql.Request(connection);
  request.query("select IdPerfil, NomePerfil, Descricao, Nome from perfil, mapa, url where perfil.IdPerfil = mapa.Perfil and mapa.Url = url.IdUrl", function(err, recordset){
      if(err){
        return next(err);
      }else{

        console.log(recordset);
        arrayCopy=recordset;
    
          arrayCopy.forEach(function(element,index){
                var aux=element.Descricao;
                var aux1=element.IdPerfil;
                var aux2=element.NomePerfil;
                console.log("perfil"+element.NomePerfil);
                arrayCopy.forEach(function(element, index) {
                  if(String(element.IdPerfil)===String(aux1)){
                    var item = {"Nome":element.Nome};
                    array.push(item);
                    //console.log(array);                   
                  }
                
                }, this);
                //console.log(array);
                arrayCopy.forEach(function(element, index1) {
                  console.log(arrayCopy);
                  if(String(element.IdPerfil)===String(aux1)){
                      arrayCopy.splice(index1,1);
                      console.log(arrayCopy);
                  }
                
                }, this);

                var item1 = {"IdPerfil":aux1,"NomePerfil":aux2,"Descricao":aux,"MapaUrl":array};
                    arrayGlobal.push(item1);
                    array=[];

          }, this);

          //console.log(arrayGlobal);

          res.send(arrayGlobal);

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
  request.query("delete from mapa where perfil='"+ idper +"'", function(err, recordset){
      if(err){
        return next(err);
      }else{
        request.query("delete from perfil where IdPerfil='"+ idper +"'",function(err, recordset1){
          if(err){
            return next(err);
          }else{
            res.json({
              sucesso: false,
              message:"Perfil elimnado com sucesso"
            })
          }
        });
      }


    });
});



module.exports = router; 




