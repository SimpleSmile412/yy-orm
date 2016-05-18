# yy-orm
# Getting Started
var orm = require("yy-orm");

## Create Database Object
var opt = { 
    host: 'localhost',  
    user: 'root', 
    password: 'root', 
    database: 'test'  
};  
var db = orm.create(opt);

## Define Schema

# Cond
## Simple Cond
eq  
ne  
gt  
lt  
gte   
lte   
in  
nin   
between   

##Combined Cond
and   
or    

##Decorate Cond
asc   
desc    
limit   


