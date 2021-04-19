module.exports = function(app, gestorBD) {

    app.get("/api/cancion", function(req, res) {
        gestorBD.obtenerCanciones( {} , function(canciones) {
            if (canciones == null) {
                res.status(500);
                res.json({
                    error : "se ha producido un error"
                })
            } else {
                res.status(200);
                res.send( JSON.stringify(canciones) );
            }
        });
    });

    app.get("/api/cancion/:id", function(req, res) {
        let criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id)}
        gestorBD.obtenerCanciones(criterio,function(canciones){
            if ( canciones == null ){
                res.status(500);
                res.json({
                    error : "se ha producido un error"
                })
            } else {
                res.status(200);
                res.send( JSON.stringify(canciones[0]) );
            }
        });
    });

    app.delete("/api/cancion/:id", function(req, res) {
        let criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id)}
        let cancionID = gestorBD.mongo.ObjectID(req.params.id);
        let usuario = res.usuario;
        errors = new Array();
        validarUserEsAutor(usuario, cancionID, function(isAutor){
            if (isAutor){
                gestorBD.eliminarCancion(criterio,function(canciones){
                    if ( canciones == null ){
                        res.status(500); res.json({
                            error : "se ha producido un error al intentar eliminar la canción."
                        })
                    } else {
                        res.status(200);
                        res.send( JSON.stringify(canciones) );
                    }
                });
            } else{
                res.status(413);
                errors.push("El usuario no tiene permisos para eliminar esta canción.");
                res.json({
                    errores : errors
                })
            }
        })
    });

    function validarUserEsAutor(usuario, cancionId, functionCallback){
        let criterio = {$and: [{"_id": cancionId}, {"autor": usuario}]};
        let isAutor = true;

        gestorBD.obtenerCanciones(criterio, function (canciones){
            if(canciones == null || canciones.length>0) {
                isAutor = false;
            }
        });

        functionCallback(isAutor);
    }

    app.post("/api/cancion", function(req, res) {
        let cancion = {
            nombre : req.body.nombre,
            genero : req.body.genero,
            precio : req.body.precio,
            autor: res.usuario
        }
        // ¿Validar nombre, genero, precio?
        validarCrearCancion(cancion, function(errors){
            if(errors!== null && errors.length>0){
                res.status(403);
                res.json({
                    errores : errors
                })
            } else{
                gestorBD.insertarCancion(cancion, function(id){
                    if (id == null) {
                        res.status(500);
                        res.json({
                            error : "se ha producido un error"
                        })
                    } else {
                        res.status(201);
                        res.json({
                            mensaje : "canción insertada",
                            _id : id
                        })
                    }
                });
            }
        });

    });

    function validarCrearCancion(cancion, functionCallback){
        let errors = new Array();
        if(cancion.nombre === null || typeof  cancion.nombre ==='undefined' || cancion.nombre.length == 0){
            errors.push("El nombre de la canción no puede estar vacío");
        }
        if(cancion.nombre.length > 50){
            errors.push("El nombre de la canción no puede tener más de 50 caracteres");
        }
        if(cancion.genero === null || typeof  cancion.genero ==='undefined' || cancion.genero.length == 0){
            errors.push("El genero de la canción no puede estar vacío");
        }
        if(cancion.precio === null || typeof  cancion.precio ==='undefined'){
            errors.push("El precio de la canción no puede estár vacío.");
        }
        if(cancion.precio < 0){
            errors.push("El precio de la canción no puede ser negativo.");
        }
        if(errors.length <= 0){
            functionCallback(null);
        } else {
            functionCallback(errors);
        }
    }

    app.put("/api/cancion/:id", function(req, res) {
        let criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id) };
        let cancion = {}; // Solo los atributos a modificar
        if ( req.body.nombre != null)
            cancion.nombre = req.body.nombre;
        if ( req.body.genero != null)
            cancion.genero = req.body.genero;
        if ( req.body.precio != null)
            cancion.precio = req.body.precio;

        validarActualizarCancion(cancion, function (errors){
            if(errors!== null && errors.length>0){
                res.status(403);
                res.json({
                    errores : errors
                })
            } else {
                gestorBD.modificarCancion(criterio, cancion, function(result) {
                    if (result == null) {
                        res.status(500);
                        res.json({
                            error : "se ha producido un error"
                        })
                    } else {
                        res.status(200); res.json({
                            mensaje : "canción modificada", _id : req.params.id
                        })
                    }
                });
            }
        })
    });

    function validarActualizarCancion(cancion, functionCallback){
        let errors = new Array();
        if(cancion.nombre.length >50){
            errors.push("El nombre de la canción no puede tener más de 50 caracteres.")
        }
        if(cancion.precio < 0){
            errors.push("El precio de la canción no puede ser negativo.")
        }
        if(errors.length <= 0){
            functionCallback(null);
        } else {
            functionCallback(errors);
        }
    }

    app.post("/api/autenticar/", function(req, res){
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        let criterio= {
            email : req.body.email,
            password : seguro
        }
        gestorBD.obtenerUsuarios(criterio, function (usuarios){
            if(usuarios == null || usuarios.length == 0) {
                res.status(401); //Unauthorized
                res.json({
                    autenticado : false
                })
            }else{
                let token = app.get('jwt').sign(
                    {usuario: criterio.email , tiempo: Date.now()/1000},
                    "secreto");
                res.status(200);
                res.json({
                    autenticado : true,
                    token : token
                })
            }
        });
    });
}