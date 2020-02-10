const fs = require('fs')
const path = require('path')
const esConnection = require('./connection')

/** Clear ES index, parse and index all files from the studys directory */
async function readAndInsertStudys () {
  try {
    // Clear previous ES index
    await esConnection.resetIndex()
    
    let files = fs.readdirSync('./BIBTertiarystudies').filter(file => file.slice(-4) === '.txt')
    console.log(`Found ${files.length} Files`)

    // Read each Study file, and index each paragraph in elasticsearch
    for (let file of files) {
      console.log(`Reading File - ${file}`)
      const filePath = path.join('./BIBTertiarystudies', file)
      const { title, author, keywords, abstract } = parseStudyFile(filePath)
      await insertStudyData(title, author, keywords, abstract)
    }
  } catch (err) {
    console.error(err)
  }
}

readAndInsertStudys()

/** Read an individual Study text file, and extract the title, author, and keywords */
function parseStudyFile (filePath) {
  // Read text file
  const study = fs.readFileSync(filePath, 'utf8')
  if(study.match(/^title?/m) != null){
    title = study.match(/^title\s?=\s?"(.+)[\"]/m) != null ? study.match(/^title\s?=\s?"(.+)[\"]/m)[1] : study.match(/^title\s?=\s?{(.+)[\}]/m) == null ? "" : study.match(/^title\s?=\s?{(.+)[\}]/m)[1];
  }else{
    title = " "
  }

  if(authorMatch = study.match(/^author?/m) != null){
    author = study.match(/^author\s?=\s?"(.+)[\"]/m) != null ? study.match(/^author\s?=\s?"(.+)[\"]/m)[1] : study.match(/^author\s?=\s?{(.+)[\}]/m) == null ? "" : study.match(/^author\s?=\s?{(.+)[\}]/m)[1];
    author = author
      .split(',').join(', ').split(';').join(', ').split(', ').join(', ').split(' and ') // Split each paragraph into it's own array entry
      .map(line => line.replace(/\r\n/g, ' ').trim()) // Remove paragraph line breaks and whitespace
      .filter((line) => (line && line !== '')) // Remove empty lines
  }else{
    author = "Unknown Author"
  }

  if(keyword = study.match(/^keywords?/m) != null){
    console.log("keyOn")
    keyword = study.match(/^keywords\s?=\s?"(.+)[\"]/m) != null ? study.match(/^keywords\s?=\s?"(.+)[\"]/m)[1] : study.match(/^keywords\s?=\s?{(.+)[\}]/m) == null ? "" : study.match(/^keywords\s?=\s?{(.+)[\}]/m)[1];  
    keywords = keyword
      .split(',').join(', ').split(';').join(', ').split(', ') // Split each paragraph into it's own array entry
      .map(line => line.replace(/\r\n/g, ' ').trim()) // Remove paragraph line breaks and whitespace
      .filter((line) => (line && line !== '')) // Remove empty lines
  }else{
    keywords = " "
  }

  if(study.match(/^abstract?/m) != null){
    abstract = study.match(/^abstract\s?=\s?"(.+)[\"]/m) != null ? study.match(/^abstract\s?=\s?"(.+)[\"]/m)[1] : study.match(/^abstract\s?=\s?{(.+)[\}]/m) == null ? "" : study.match(/^abstract\s?=\s?{(.+)[\}]/m)[1];
  }else{
    abstract = " "
  }

  console.log(`Parsed ${keywords.length} Keywords\n`)

  console.log(`Reading Study - ${title} By ${author}`)

  console.log("p = "+keywords+" / t = "+title+" / a = "+author)

  return { title, author, keywords, abstract }
}

/* Bulk index the Study data in Elasticsearch */
async function insertStudyData (title, author, keywords, abstract) {
  let bulkOps = [] // Array to store bulk operations
  console.log(keywords)

  console.log(author)
  // Describe action
  bulkOps.push({ index: { _index: esConnection.index, _type: esConnection.type } })
  
  // Add document
  bulkOps.push({
    author: author,
    title,
    abstract, 
    //location: i,
    text: keywords
  })


  // Insert remainder of bulk ops array
  await esConnection.client.bulk({ body: bulkOps })
  console.log(`Indexed keywords ${keywords.length - (bulkOps.length / 2)} - ${keywords.length}\n\n\n`)
}