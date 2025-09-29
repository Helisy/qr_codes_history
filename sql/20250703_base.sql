/* CREATE SCHEMA `shp_codes_db` ; */

CREATE TABLE shipping_codes(
id BIGINT NOT NULL AUTO_INCREMENT,

code VARCHAR(255) NOT NULL,
ecommerce_label VARCHAR(255) NOT NULL,
marketplace_id int not null,
batch_id int,
has_entry bool not null default false,
has_exit bool not null default false,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
deleted_at DATETIME DEFAULT NULL,
primary key(id)
);

CREATE TABLE batches(
id BIGINT NOT NULL AUTO_INCREMENT,

marketplace_id int not null,
status_id int not null,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
deleted_at DATETIME DEFAULT NULL,
primary key(id)
);

CREATE TABLE status(
id BIGINT NOT NULL AUTO_INCREMENT,

label VARCHAR(255) NOT NULL,

primary key(id)
);

insert into status(label) values("ABERTO");
insert into status(label) values("ENTRADA");
insert into status(label) values("SAÍDA");
insert into status(label) values("FECHADO");

CREATE TABLE marketplaces(
id BIGINT NOT NULL AUTO_INCREMENT,

label VARCHAR(255) NOT NULL,

primary key(id)
);

insert into marketplaces(label) values("Shopee");
insert into marketplaces(label) values("Shein");
