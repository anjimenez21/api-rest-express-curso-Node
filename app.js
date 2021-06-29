const inicioDebug = require('debug')('app:inicio');
//const dbDegub = require('debug')('app:db');
const express = require('express');
const config = require('config');
//const logger = require('./logger');
const morgan = require('morgan');
const Joi = require('@hapi/joi');
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
// app.use(logger);

//Configuracion de entorno
console.log('Aplicacion:' + config.get('nombre') );
console.log('DB Server: '+ config.get('configDB.host'));

//Uso de un middleware de terceros - Morgan
if(app.get('env') === 'development')
{
    app.use(morgan('tiny'));
    //console.log('Morgan habilitado');
    inicioDebug('Morgan esta habilitado...');
}

///Trabajos con la base de datos
inicioDebug('Conectando con la db....');

const usuarios = [
    {id:1, nombre:'Ana'},
    {id:2, nombre:'Julissa'},
    {id:3, nombre:'Jimenez'}
]

app.get('/', (req, res) => {
    res.send('Hola mundo desde express');
});

app.get('/api/usuarios', (req, res) => {
    // res.send(['grover', 'luis', 'ana  julissa']);
    res.send(usuarios);
});


app.get('/api/usuarios/:id', (req, res) => {
    // let usuario = usuarios.find(u => u.id === parseInt(req.params.id));
    let usuario = ExisteUsuario(req.params.id);
    
    if(!usuario) 
      res.status(404).send('El usuario no fue encontrado');
      res.send(usuario);
});


app.post('/api/usuarios', (req, res) => {
    
    // const schema = Joi.object({
    //     nombre: Joi.string().min(3).required()
    // });

    const {error, value} =  ValidarUsuario(req.body.nombre);
    
    if(!error){
        const usuario = {
        id: usuarios.length + 1,
        nombre: value.nombre
        };

        usuarios.push(usuario);
        res.send(usuario);
    }
    else{
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
    }
});



app.put('/api/usuarios/:id', (req,res) => {
    //Buscar si existe el usuario
    // let usuario = usuarios.find(u => u.id === parseInt(req.params.id));
    let usuario = ExisteUsuario(req.params.id);
   
    if(!usuario) 
    {
        res.status(404).send('El usuario no fue encontrado');
        return;
    }

    const {error, value} = ValidarUsuario(req.body.nombre);
    
    if(error){
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
        return;
    }
    
    usuario.nombre = value.nombre;
    res.send(usuario);

});

app.delete('/api/usuarios/:id', (req,res) => {
    let usuario = ExisteUsuario(req.params.id);
   
    if(!usuario) 
    {
        res.status(404).send('El usuario no fue encontrado');
        return;
    }

    const index = usuarios.indexOf(usuario);
    usuario.splice(index, 1);
    res.send(usuarios);

});

const port = process.env.port || 3001;

app.listen(port, () => {
    console.log(`El servidor en el puerto ${port}`);
});


function ExisteUsuario(id){
    return(usuarios.find(u => u.id === parseInt(id)));
}

function ValidarUsuario(nombre){
    const schema = Joi.object({
        nombre: Joi.string().min(3).required()
    });

    return(schema.validate({ nombre: nombre}));
}