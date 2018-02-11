# yy-orm

# Table of Contents

* [Configure](#configure)
  * [Quick Started](#quick-started)
  * [Create Database Object](#create-database-object)
  * [Define Schema](#define-schema)
* [Type](#type)
  * [Props](#props)
  * [Constraint](#constraint)
* [Cond](#cond)
  * [Simple Cond](#simple-cond)
  * [Combined Cond](#combined-cond)
  * [Decorate Cond](#decorate-cond)
  * [Cond Transform](#cond-transform)
* [Database](#database)

# Configure
### Quick Started
`var orm = require("yy-orm");`

### Create Database Object
    `var opt = { 
	host: 'localhost',
	user: 'root', 
	password: 'root', 
	database: 'test'
    };
    var db = orm.create(opt);`

### Define Schema
    `var def = {
    id: type.id(),
    name: type.varchar(32).unique(),
    alias: type.varchar("Rookie"),
    rank: type.integer().default(0),
    registTime: type.datetime().notNull()
    };
    var User = db.define("User", def);`

# Type
integer
double
varchar
datetime

### Props
default
length

### Constraint
notNull
unique


# Cond
### Simple Cond
eq
ne
gt
lt
gte 
lte 
in
nin 
between 

### Combined Cond
and 
or

### Decorate Cond
asc 
desc
limit 

### Cond Transform
transform

# Database
query  
insert
update
select
delete
count
Transaction Rollback
Transaction CURD


batch update but has delete...

