const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const bcrypt = require('bcrypt');
const { authRole, ROLE } = require('../middleware/authRoles');

/**
 * @swagger
 * /api/user/:
 *  get:
 *    description: Retorna todos os usuarios
 *    responses:
 *      '200':
 *          description: 'Usuario retornado'
 *      '404':
 *          description: 'Não foi encontrado nenhum usuario'
 *      '500':
 *          description: 'Internal Error'
 */
router.get('/', authRole(['admin']), (req, res, next) => {
    const usuario = [];
    const endereco = [];

    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error})};

        conn.query(
            'SELECT * FROM usuario u INNER JOIN endereco e ON u.idEndereco = e.idEndereco',
            (error, resultado, field) => {
                conn.release();
                if(error){return res.status(500).send({ error: error})};

                if(resultado.length == 0){
                    return res.status(404).send({
                        error: 'Não foi encontrado nenhum usuario'
                    });
                }
                
                for(var x = 0 in resultado){
                    endereco.push({
                        idEndereco: resultado[x].idEndereco,
                        rua: resultado[x].rua,
                        numero: resultado[x].numero,
                        complemento: resultado[x].complemento,
                        cidade: resultado[x].cidade,
                        estado: resultado[x].estado,
                        pais: resultado[x].pais,
                        CEP: resultado[x].CEP,
                    })

                    usuario.push({
                        idUsuario: resultado[x].idUsuario,
                        nome: resultado[x].nome,
                        documento: resultado[x].documento,
                        email: resultado[x].email,
                        dataNasc: resultado[x].dataNasc,
                        telefone: resultado[x].telefone,
                        endereco: endereco[x],
                        role: resultado[x].role
                    });
                }
                return res.status(200).send({ response: usuario });
            }
        )
    });
});

//RETORNA O USUARIO LOGADO
router.get('/me', authRole([ROLE.ALL]), (req, res, next) => {
    const idUsuario = req.usuario.IdUsuario;

    const usuario = [];
    const endereco = [];

    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error})};

        conn.query(
            'SELECT * FROM usuario u INNER JOIN endereco e ON e.idEndereco = u.idEndereco WHERE u.idUsuario = ?',
            [idUsuario],
            (error, resultado, field) => {
                conn.release();
                if(error){return res.status(500).send({ error: error})};

                if(resultado.length == 0){
                    return res.status(404).send({
                        error: 'Não foi encontrado nenhum usuario com esse ID'
                    });
                }

                for(var x = 0 in resultado){
                    endereco.push({
                        idEndereco: resultado[x].idEndereco,
                        rua: resultado[x].rua,
                        numero: resultado[x].numero,
                        complemento: resultado[x].complemento,
                        cidade: resultado[x].cidade,
                        estado: resultado[x].estado,
                        pais: resultado[x].pais,
                        CEP: resultado[x].CEP,
                    })

                    usuario.push({
                        idUsuario: resultado[x].idUsuario,
                        nome: resultado[x].nome,
                        documento: resultado[x].documento,
                        email: resultado[x].email,
                        dataNasc: resultado[x].dataNasc,
                        telefone: resultado[x].telefone,
                        endereco: endereco[x],
                        role: resultado[x].role
                    });
                }
                return res.status(200).send({ response: usuario });
            }
        )
    });
});

//RETORNA UM USUARIO ESPECIFICO
router.get('/:idUsuario', authRole(['admin']), (req, res, next) => {
    const id = req.params.idUsuario

    const usuario = [];
    const endereco = [];

    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error})};

        conn.query(
            'SELECT * FROM usuario u INNER JOIN endereco e ON e.idEndereco = u.idEndereco WHERE u.idUsuario = ?',
            [id],
            (error, resultado, field) => {
                conn.release();
                if(error){return res.status(500).send({ error: error})};

                if(resultado.length == 0){
                    return res.status(404).send({
                        error: 'Não foi encontrado nenhum usuario com esse ID'
                    });
                }

                for(var x = 0 in resultado){
                    endereco.push({
                        idEndereco: resultado[x].idEndereco,
                        rua: resultado[x].rua,
                        numero: resultado[x].numero,
                        complemento: resultado[x].complemento,
                        cidade: resultado[x].cidade,
                        estado: resultado[x].estado,
                        pais: resultado[x].pais,
                        CEP: resultado[x].CEP,
                    })

                    usuario.push({
                        idUsuario: resultado[x].idUsuario,
                        nome: resultado[x].nome,
                        documento: resultado[x].documento,
                        email: resultado[x].email,
                        dataNasc: resultado[x].dataNasc,
                        telefone: resultado[x].telefone,
                        endereco: endereco[x],
                        role: resultado[x].role
                    });
                }
                return res.status(200).send({ response: usuario });
            }
        )
    });
});

//CADASTRA UM USUARIO DEFAULT
router.post('/', (req, res, next) => {
    const endereco = {
        idEndereco: null,
        rua: req.body.rua, 
        numero: req.body.numero, 
        complemento: req.body.complemento, 
        cidade: req.body.cidade,
        estado: req.body.estado,
        pais: req.body.pais,
        CEP: req.body.CEP
    };

    const usuario = []
    usuario.push({
        idUsuario: null,
        nome: req.body.nome,
        documento: req.body.documento,
        email: req.body.email,
        dataNasc: req.body.dataNasc,
        telefone: req.body.telefone,
        endereco: endereco,
        role: 'padrao'
    });
    
    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error})};

        conn.query('SELECT * FROM usuario WHERE documento = ? OR email = ?',[usuario[0].documento, usuario[0].email], (error, resultado) => {
            if(error){return res.status(500).send({ error: error})};

            if(resultado.length > 0){
                res.status(409).send({ error: 'CPF já utilizado ou Email já utilizado'})
            } else {
                conn.query(
                    'INSERT INTO `endereco` (`idEndereco`, `rua`, `numero`, `complemento`, `cidade`, `estado`, `pais`, `CEP`) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?);',
                    [endereco.rua, endereco.numero, endereco.complemento, endereco.cidade, endereco.estado, endereco.pais, endereco.CEP],
                    (error, resultado, field) => {
                        if(error){return res.status(500).send({ error: error})};
                        endereco.idEndereco = resultado.insertId;   
                        
                        bcrypt.hash(req.body.senha, 10, (errBcrypt, hash) => {
                            if(errBcrypt){return res.status(500).send({ error: `${errBcrypt}` })}
            
                            conn.query(
                                `INSERT INTO usuario (idUsuario, nome, documento, email, senha, dataNasc, telefone, idEndereco) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?);`,
                                [usuario[0].nome, usuario[0].documento, usuario[0].email, hash, usuario[0].dataNasc, usuario[0].telefone, endereco.idEndereco],
                                (error, resultado, field) => {
                                    conn.release();
                                    if(error){return res.status(500).send({ error: error})};
            
                                    usuario[0].idUsuario = resultado.insertId;
                                        
                                    res.status(201).send({
                                        message: 'Usuario cadastrado com sucesso!',
                                        items: usuario
                                    });
                                }
                            )
                        });
                    }
                )
            }
        });
    });
});

//CADASTRA UM USUARIO INSTITUIÇÃO
router.post('/instituicao', (req, res, next) => {
    const endereco = {
        idEndereco: null,
        rua: req.body.rua, 
        numero: req.body.numero, 
        complemento: req.body.complemento, 
        cidade: req.body.cidade,
        estado: req.body.estado,
        pais: req.body.pais,
        CEP: req.body.CEP
    };

    const usuario = []
    usuario.push({
        idUsuario: null,
        nome: req.body.nome,
        documento: req.body.documento,
        email: req.body.email,
        dataNasc: req.body.dataNasc,
        telefone: req.body.telefone,
        endereco: endereco,
        role: 'instituicao'
    });
    
    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error})};

        conn.query('SELECT * FROM usuario WHERE documento = ? OR email = ?',[usuario[0].documento, usuario[0].email], (error, resultado) => {
            if(error){return res.status(500).send({ error: error})};

            if(resultado.length > 0){
                res.status(409).send({ error: 'CNPJ já utilizado ou Email já utilizado'})
            } else {
                conn.query(
                    'INSERT INTO `endereco` (`idEndereco`, `rua`, `numero`, `complemento`, `cidade`, `estado`, `pais`, `CEP`) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?);',
                    [endereco.rua, endereco.numero, endereco.complemento, endereco.cidade, endereco.estado, endereco.pais, endereco.CEP],
                    (error, resultado, field) => {
                        if(error){return res.status(500).send({ error: error})};
                        endereco.idEndereco = resultado.insertId;   
                        
                        bcrypt.hash(req.body.senha, 10, (errBcrypt, hash) => {
                            if(errBcrypt){return res.status(500).send({ error: `${errBcrypt}` })}
            
                            conn.query(
                                `INSERT INTO usuario (idUsuario, nome, documento, email, senha, dataNasc, telefone, idEndereco, role) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?);`,
                                [usuario[0].nome, usuario[0].documento, usuario[0].email, hash, usuario[0].dataNasc, usuario[0].telefone, endereco.idEndereco, 'instituicao'],
                                (error, resultado, field) => {
                                    conn.release();
                                    if(error){return res.status(500).send({ error: error})};
            
                                    usuario[0].idUsuario = resultado.insertId;
                                        
                                    res.status(201).send({
                                        message: 'Usuario cadastrado com sucesso!',
                                        items: usuario
                                    });
                                }
                            )
                        });
                    }
                )
            }
        });
    });
});

//DELETA UM USUARIO
router.delete('/:idUsuario', authRole(['admin']), (req, res, next) => {
    const id = req.params.idUsuario

    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error})};

        conn.query(
            'DELETE u.*, e.* FROM usuario u INNER JOIN endereco e ON u.idEndereco = e.idEndereco WHERE u.idUsuario = ?;',
            [id],
            (error, resultado, field) => {
                conn.release();
                if(error){return res.status(500).send({ error: error})};
    
                return res.status(201).send({
                    message: 'Usuario deletado com sucesso!',
                });
            }
        )
    });
});

module.exports = router;