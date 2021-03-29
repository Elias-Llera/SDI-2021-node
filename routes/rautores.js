module.exports = function(app, swig) {

    app.get("/autores", function(req, res) {

        let autores = [ {
            "nombre" : "Autor 1",
            "grupo" : "Grupo 1",
            "rol" : "cantante"
        }, {
            "nombre" : "Autor 2",
            "grupo" : "Grupo 2",
            "rol" : "guitarrista"
        }, {
            "nombre": "Autor 3",
            "grupo": "Grupo 3",
            "rol" : "bateria"
        } ];

        let respuesta = swig.renderFile('views/autores.html', {
            autores : autores
        });

        res.send(respuesta);
    });

    app.get('/autores/agregar', function (req, res) {
        let respuesta = swig.renderFile('views/autores-agregar.html', {});
        res.send(respuesta);
    })

    app.post('/autores/agregar', function (req, res){
        let respuesta = "Autor agregado <br>";

        respuesta += "Nombre: ";
        if(req.body.nombre.trim() != ""){
            respuesta += req.body.nombre + "<br>";
        }else{
           respuesta += "Nombre no enviado en la peticion <br>";
        }

        respuesta += "Grupo: ";
        if(req.body.grupo.trim() != ""){
            respuesta += req.body.grupo + "<br>";
        }else{
            respuesta += "Grupo no enviado en la peticion <br>";
        }

        respuesta += "Rol: ";
        if(req.body.rol.trim() != ""){
            respuesta += req.body.rol + "<br>";
        }else{
            respuesta += "Rol no enviado en la peticion <br>";
        }

        res.send(respuesta);
    })

    app.get('/autores*', function (req, res) {
        res.redirect("/autores");
    })

};