module.exports = function(app, swig, gestorBD) {

    app.get("/canciones", function(req, res) {
        let canciones = [ {
            "nombre" : "Blank space",
            "precio" : "1.2"
        }, {
            "nombre" : "See you again",
            "precio" : "1.3"
        }, {
            "nombre": "Uptown Funk",
            "precio": "1.1"
        } ];

        let respuesta = swig.renderFile('views/btienda.html', {
            vendedor : 'Tienda de canciones',
            canciones : canciones
        });

        res.send(respuesta);
    });

    app.get('/canciones/agregar', function (req, res) {
        let respuesta = swig.renderFile('views/bagregar.html', {});
        res.send(respuesta);
    })

    app.get('/suma', function(req, res) {
        let respuesta = parseInt(req.query.num1) + parseInt(req.query.num2);
        res.send(String(respuesta))
    });

    app.get('/cancion/:id', function (req, res) {
        let criterioCancion = { "_id" : gestorBD.mongo.ObjectID(req.params.id) };
        let criterioComentario = { "cancion_id" : gestorBD.mongo.ObjectID(req.params.id) };
        gestorBD.obtenerCanciones(criterioCancion,function(canciones){
            if ( canciones == null ){
                res.redirect("/tienda?mensaje=Error en la recuperar la cancion");
            } else {
                gestorBD.obtenerComentarios(criterioComentario, function(comentarios){
                    if(comentarios == null){
                        res.redirect("/tienda?mensaje=Error al recuperar los comentarios");
                    }else{
                        let respuesta = swig.renderFile('views/bcancion.html',
                            {
                                cancion : canciones[0],
                                comentarios : comentarios
                            });
                        res.send(respuesta);
                    }
                })
            }
        });
    });

    app.get('/canciones/:id', function(req, res) {
        let respuesta = 'id: ' + req.params.id;
        res.send(respuesta);
    });

    app.get('/canciones/:genero/:id', function(req, res) {
        let respuesta = 'id: ' + req.params.id + '<br>'
            + 'Género: ' + req.params.genero;
        res.send(respuesta);
    });

    app.post('/cancion', function(req, res) {
        let cancion = {
            nombre :req.body.nombre,
            genero : req.body.genero,
            precio :req.body.precio,
            autor : req.session.usuario
        }
        // Conectarse
        gestorBD.insertarCancion(cancion, function(id){
            if (id == null) {
                res.redirect("/cancion?mensaje=Error al insertar la canción");
            } else {
                if (req.files.portada != null) {
                    var imagen = req.files.portada;
                    imagen.mv('public/portadas/' + id + '.png', function(err) {
                        if (err) {
                            res.redirect("/cancion?mensaje=Error al subir la portada");
                        } else {
                            if (req.files.audio != null) {
                                let audio = req.files.audio;
                                audio.mv('public/audios/'+id+'.mp3', function(err) {
                                    if (err) {
                                        res.redirect("/cancion?mensaje=Error al subir el audio");
                                    } else {
                                        res.redirect("/publicaciones");
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    });

    app.get('/promo*', function (req, res) {
        res.send('Respuesta patrón promo* ');
    })

    app.get("/tienda", function(req, res) {
        let criterio = {};
        if( req.query.busqueda != null ){
            criterio = { "nombre" : {$regex : ".*"+req.query.busqueda+".*"} };
        }
        gestorBD.obtenerCanciones(criterio,  function(canciones) {
            if (canciones == null) {
                res.send("Error al listar ");
            } else {
                let respuesta = swig.renderFile('views/btienda.html',
                {
                    canciones : canciones
                });
            res.send(respuesta);
            }
        });
    });

    app.get("/publicaciones", function(req, res) {
        let criterio = { autor : req.session.usuario };
        gestorBD.obtenerCanciones(criterio, function(canciones) {
            if (canciones == null) {
                res.send("Error al listar ");
            } else {
                let respuesta = swig.renderFile('views/bpublicaciones.html',
                    {
                        canciones : canciones
                    });
                res.send(respuesta);
            }
        });
    });

    app.get('/cancion/modificar/:id', function (req, res) {
        let criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id) };
        let respuesta = swig.renderFile('views/bcancionModificar.html',
            {
                cancion : canciones[0]
            });
        gestorBD.obtenerCanciones(criterio,function(canciones){
            if ( canciones == null ){
                res.send(respuesta);
            } else {
                res.redirect("/publicaciones");
            }
        });
    })

    app.post('/cancion/modificar/:id', function (req, res) {
        let id = req.params.id;
        let criterio = { "_id" : gestorBD.mongo.ObjectID(id) };
        let cancion = {
            nombre : req.body.nombre,
            genero : req.body.genero,
            precio : req.body.precio
        }
        gestorBD.modificarCancion(criterio, cancion, function(result) {
            if (result == null) {
                res.send("Error al modificar ");
            } else {
                paso1ModificarPortada(req.files, id, function (result) {
                    if( result == null){
                        res.redirect("/publicaciones?mensaje=Error en la modificacion");
                    } else {
                        res.redirect("/publicaciones?mensaje=Modificado");
                    }
                });
            }
        });
    })

    function paso1ModificarPortada(files, id, callback) {
        if (files && files.portada != null) {
            let imagen = files.portada;
            imagen.mv('public/portadas/' + id + '.png', function (err) {
                if (err) {
                    callback(null); // ERROR
                } else {
                    paso2ModificarAudio(files, id, callback); // SIGUIENTE
                }
            });
        } else {
            paso2ModificarAudio(files, id, callback); // SIGUIENTE
        }
    };

    function paso2ModificarAudio(files, id, callback){
        if (files && files.audio != null) {
            let audio = files.audio;
            audio.mv('public/audios/'+id+'.mp3', function(err) {
                if (err) {
                    callback(null); // ERROR
                } else {
                    callback(true); // FIN
                }
            });
        } else {
            callback(true); // FIN
        }
    };

    app.get('/cancion/eliminar/:id', function (req, res) {
        let criterio = {"_id" : gestorBD.mongo.ObjectID(req.params.id) };
        gestorBD.eliminarCancion(criterio,function(canciones){
            if ( canciones == null ){
                res.send(respuesta);
            } else {
                res.redirect("/publicaciones");
            }
        });
    })

    app.get('/cancion/comprar/:id', function (req, res) {
        let cancionId = gestorBD.mongo.ObjectID(req.params.id);
        let compra = {
            usuario : req.session.usuario,
            cancionId : cancionId
        }
        gestorBD.insertarCompra(compra ,function(idCompra){
            if ( idCompra == null ){
                res.send(respuesta);
            } else {
                res.redirect("/compras");
            }
        });
    });

    app.get('/compras', function(req, res){
        let criterio = { "usuario" : req.session.usuario};

        gestorBD.obtenerCompras(criterio, function (compras){
            if(compras ==null) {
                res.send("Error al listar");
            } else {

                let cancionesCompradasIds = [];
                for(i = 0; i< compras.length; i++){
                    cancionesCompradasIds.push(compras[i].cancionId)
                }

                let criterio = {"_id":{$in: cancionesCompradasIds}}
                gestorBD.obtenerCanciones(criterio, function(canciones){
                    let respuesta = swig.renderFile('views/bcompras.html',
                        {
                            canciones : canciones
                        });
                    res.send(respuesta);
                });
            }
        });
    })

}