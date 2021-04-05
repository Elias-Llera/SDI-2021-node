module.exports = function(app, swig, gestorBD) {

    app.post('/comentarios/:cancion_id', function (req, res){
        let id_cancion = req.params.cancion_id;
        let comentario = {
            autor : req.session.usuario,
            texto : req.body.texto,
            cancion_id : gestorBD.mongo.ObjectID(id_cancion)
        }
        gestorBD.insertarComentario(comentario, function(id){
            if (id == null) {
                res.send("Error al insertar comentario");
            } else {
                res.redirect("/cancion/" + id_cancion);
            }
        });
    });

}