const replaceAll = ( findThis, replace, string ) => string.split( findThis ).join( replace )
const isDate = stringToCheck => {
	let isDate = false
	try {
		let dateObject = new Date( stringToCheck );
		isDate = ( dateObject instanceof Date && !isNaN( dateObject.valueOf() ) )
	} catch ( e ) {}
	return isDate
}

const sql = {
	type: 'mysql',
	setType: newType => { sql.type = newType },
	wrap: name => ( ( sql.type == 'mysql' )? ( '\`' + name + '\`' ): ( '[' + name + ']' ) ),
	prepare: data => {
		if( typeof( data ) == 'string' )  {
			data = ( '\'' + replaceAll( '\'', '\'\'', data ) + '\'' )
		} else if( !isNaN( parseFloat( data ) ) ) {
			data = parseFloat( data )
		} else if( isDate( data ) ) {
			let thisDate = new Date( data )
			data = ( '\'' + thisDate.toISOString().replace( 'T', ' ' ).replace( 'Z', '' ) + '\'' )
		} else if( ( data === true ) || ( data === false ) )  {
			data = ( ( data === true )? 1: 0 )
		}
		return data
	},
	where: query => {
		let querySQL = ''
		for( let x in query )	{
			if( Array.isArray( query[x] ) )	{
				for( let i = 0; i < query[x].length; i++ )  {
					query[x][i] = sql.prepare( query[x][i] )
				}
				querySQL += ( ( ( querySQL.length > 0 )? ' AND ': '' ) + '( ' + sql.wrap( x ) + ' IN( ' + query[x].join( ',' ) + ' ) )' )
			}	else {
				querySQL += ( ( ( querySQL.length > 0 )? ' AND ': '' ) + '( ' + sql.wrap( x ) + ' = ' + sql.prepare( query[x] ) + ' )' );
			}
		}
		return ( ( querySQL.length > 0 )? ( ' WHERE ' + querySQL ): '' )
	},
	joins: ( tableName, joinList ) => {
		let joinSQL = ''
		if( joinList )  {
			for( let i = 0; i < joinList.length; i++ )  {
				joinSQL += ' LEFT OUTER JOIN ' + sql.wrap( joinList[i].from ) + ' AS ' + sql.wrap( joinList[i].name ) + ' ON ' + sql.wrap( tableName ) + '.' + sql.wrap( joinList[i].field ) + ' = ' + sql.wrap( joinList[i].name ) + '.' + sql.wrap( joinList[i].fromField )
			}
		}
		return joinSQL
	},
	insert: ( tableName, dataToInsert ) => {
		if( tableName && dataToInsert ) {
			let insertFields = []
			let insertRows = []
			if( !Array.isArray( dataToInsert ) )  {
				dataToInsert = [dataToInsert]
			}
			for( let i = 0; i < dataToInsert.length; i++ )  {
				let thisRow = []
				if( insertFields.length == 0 )  {
					for( let x in dataToInsert[i] )	{
						insertFields.push( sql.wrap( x ) )
					}
				}
				for( let x in dataToInsert[i] )	{
					thisRow.push( sql.prepare( dataToInsert[i][x] ) )
				}
				if( thisRow.length > 0 )  {
					insertRows.push( thisRow )
				}
			}
			let sqlInsert = 'INSERT INTO ' + sql.wrap( tableName ) + ' ( ' + insertFields.join( ', ' ) + ' ) VALUES '
			if( sql.type == 'mysql' ) {
				for( let i = 0; i < insertRows.length; i++ )  {
					sqlInsert += ( ( ( i > 0 )? ', ': '' ) + '(' + insertRows[i].join( ', ' ) + ')' )
				}
				sqlInsert += ';'
			} else if( sql.type == 'mssql' ) {
				let baseSQL = sqlInsert
				sqlInsert = ''
				for( let i = 0; i < insertRows.length; i++ )  {
					sqlInsert += ( ( ( i > 0 )? '; ': '' ) + baseSQL + '(' + insertRows[i].join( ', ' ) + ');' )
				}
			}
			return sqlInsert
		}
	},
	update: ( tableName, dataToUpdate, query ) => {
		let querySQL = ''
		for( let x in dataToUpdate )	{
			querySQL += ( ( ( querySQL.length > 0 )? ', ': '' ) + sql.wrap( x ) + '=' + sql.prepare( dataToUpdate[x] ) )
		}
		return ( 'UPDATE ' + sql.wrap( tableName ) + ' SET ' + querySQL + sql.where( query ) + ';' )
	},
	delete: ( tableName, query ) => ( 'DELETE FROM ' + sql.wrap( tableName ) + ' ' + sql.where( query ) + ';' ),
	query: ( tableName, max, sortList, query, joins ) => {
		let sortSQL = ''
		for( let x in sortList )  {
			sortSQL += ( ( ( sortSQL.length > 0 )? ', ': '' ) + sql.wrap( x ) + ' ' + ( ( parseInt( sortList[x] ) == -1 )? 'DESC': 'ASC' ) )
		}
		return ( 'SELECT ' + ( ( ( max !== null ) && ( max > 0 ) && ( sql.type == 'mssql' ) )? ( 'TOP ' + parseInt( max ).toString() + ' ' ): '' ) + '* FROM ' + sql.wrap( tableName ) + sql.joins( tableName, joins ) + sql.where( query ) + ( ( sortSQL.length > 0 )? ( ' ORDER BY ' + sortSQL ): '' ) + ( ( ( max !== null ) && ( max > 0 ) && ( sql.type == 'mysql' ) )? ( ' LIMIT ' + parseInt( max ).toString() ): '' ) )
	}
}

module.exports = sql
