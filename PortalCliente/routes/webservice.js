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

/*
  Retorna informção de um dado utilizador
*/
router.get('/:tablename/:email', function(req, res, next) {
  var table = req.params.tablename;
  var email = req.params.email;
  var request = new sql.Request(connection);
    request.query("SELECT * FROM " + table +  " where Email = '" +email + "'" , function(err, recordset){
      if(err){
        return next(err);
      }
      res.send(recordset);
    });

});

/*
  Retorna toda a informação da tabela utilizador
*/
router.get('/:tablename/:id', function(req, res, next) {
  var table = req.params.tablename;
  var id = req.params.id;
  var request = new sql.Request(connection);
    request.query('SELECT * FROM '+ table + ' where IdNav='+ id , function(err, recordset){
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

          res.send(arrayGlobal);

        } 

    });
});


