# NK-MySQL-Builder
SQL String Builder Class to Extend NK-MySQL

## Installation

Install using NPM

```bash
npm i /nk-mysql-builder --save
```

## How to use

This will allow you to use Mongo like calls to MySQL Databases with no additional programming.

---
### Include
```node
const NKSQL = require( 'nk-mysql-builder' )
```

### Get insert query (or queries)

```node
let myQuery = NKSQL.insert( 'users', { username: 'jose', pass: '123', active: false, added: ( new Date() ).getTime() } )
```

### Get update query

```node
let myQuery = NKSQL.update( 'users', { username: 'jose', pass: '123', active: false, added: ( new Date() ).getTime() }, { user_id: 1 } )
```

### Get delete query

```node
let myQuery = NKSQL.delete( 'users', { user_id: 1 } )
```

### Get select queries

```node
let myQuery = NKSQL.query( 'users', 100, { added: -1 }, { user_id: 1 }, [ { from: 'photos', field: 'user_id', fromField: 'user_id', name: 'user_photos' } ] )
```


## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
