const { client, index, type } = require('./connection')

module.exports = {
  /** Query ES index for the provided term */
  queryTerm (term, offset = 0) {
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
  }
}