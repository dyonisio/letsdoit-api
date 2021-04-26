-- -----------------------------------------------------
-- Schema LetsDoIt
-- -----------------------------------------------------

CREATE DATABASE LetsDoIt;
USE LetsDoIt;

-- -----------------------------------------------------
-- Table Endereco
-- -----------------------------------------------------
CREATE TABLE endereco (
idEndereco INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
rua VARCHAR(45) NOT NULL,
numero VARCHAR(45) NOT NULL,
complemento VARCHAR(45) NULL,
cidade VARCHAR(45) NOT NULL,
estado VARCHAR(45) NOT NULL,
pais VARCHAR(45) NOT NULL,
CEP VARCHAR(10) NULL
)


-- -----------------------------------------------------
-- Table Usuario
-- -----------------------------------------------------
CREATE TABLE usuario (
idUsuario INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
nome VARCHAR(45) NOT NULL,
documento VARCHAR(17) UNIQUE NOT NULL,
email VARCHAR(99) UNIQUE NOT NULL,
senha VARCHAR(200) NOT NULL,
dataNasc DATE NOT NULL,
telefone VARCHAR(45) NOT NULL,
idEndereco INT NOT NULL,
role VARCHAR(15) DEFAULT 'padrao',
CONSTRAINT FK_Usuario_Endereco FOREIGN KEY (idEndereco) REFERENCES endereco (idEndereco)
)


-- -----------------------------------------------------
-- Table Projeto
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS projeto (
idProjeto INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
nome VARCHAR(45) NOT NULL,
descricao VARCHAR(500) NULL,
idUsuario INT NOT NULL,
doacoes DOUBLE NOT NULL,
CONSTRAINT FK_Projeto_Usuario FOREIGN KEY (IdUsuario) REFERENCES usuario (IdUsuario)
)