const { client, index, type } = require('./connection')
/*const csv = require('csv-parser')
const fs = require('fs')*/

function teste(term, offset, select, study){
  switch(select) {
    case "Title": 
      body = {  from: offset, query: { match: { title: { query: term, fuzziness: 'auto' } } } , highlight: { fields: { title: {} } } }  
      break;
    case "Abstract": 
      body = {  from: offset, query: { match: { abstract: { query: term, fuzziness: 'auto' } } } , highlight: { fields: { abstract: {} } } }  
      break;
    case "Keywords": 
      body = {  from: offset, query: { match: { text: { query: term, fuzziness: 'auto' } } } , highlight: { fields: { text: {} } } }  
      break;
    case "Author": 
      body = {  from: offset, query: { match: { author: { query: term, fuzziness: 'auto' } } } , highlight: { fields: { author: {} } } }  
      break;
    case "DOI": 
      body = {  from: offset, query: { match: { doi: { query: term, fuzziness: 'auto' } } } , highlight: { fields: { doi: {} } } }  
      break;   
    case "Title Abstract Keywords": 
      //body = { from: offset, query: { bool: { must: { multi_match: { query: term, fields: [ "text", "title", "abstract"], type: "most_fields", operator: 'or', fuzziness: 'auto' } }, "term" : { "type": study }}, highlight: { fields: { text: {}, title: {}, abstract: {} } } }}  
      body = { from: offset, query: { multi_match: { query: term, fields: [ "text", "title", "abstract"], type: "most_fields", operator: 'or', fuzziness: 'auto' } } , highlight: { fields: { text: {}, title: {}, abstract: {} } } }  
      break;  
  }
}


module.exports = {
  /** Query ES index for the provided term */
  //if (select == "title") {
  queryTerm (term, offset = 0, select, study) {  
    teste(term, offset, select, study)
    /*
    const body = {
      from: offset,
      query: { 
        match: {
          title: {
            query: term,
            fuzziness: 'auto'
          } 
        } 
      } ,
      highlight: { fields: { title: {} } }
    }
*/
    return client.search({ index, type, body })
  //}
  }/*
  queryTerm (term, offset = 0) {
    const body = {
      from: offset,
      query: { match: {
          text: term
        } } ,
      highlight: { fields: { "text": {} } }
    }

    return client.search({ index, type, body })
  }
  */
/*
  queryTerms (term, offset = 0, select) {
    const body = {
      from: offset,
      query: { multi_match: {
          query: term,
          fields: [ "text", "title", "author", "abstract"],
          type: "most_fields",
          operator: 'or',
          fuzziness: 'auto'
        } } ,
      highlight: { fields: { text: {}, title: {}, author: {}, abstract: {} } }
    }

    return client.search({ index, type, body })
  }*/
}

/*

fs.createReadStream('scopus-5.csv')
  .pipe(csv())
  .on('data', (row) => {
    console.log(row);
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  });*/