const fs = require('fs')
const path = require('path')
const esConnection = require('./connection')
const csv = require('csv-parser')

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
      parseStudyFile(filePath, file)
      await insertStudyData(title, author, keywords, abstract, doi, url, year)
    }


    fs.createReadStream('./scopus5.csv')
    .on('error', () => {
      console.log('CSV file import error');
    })
    .pipe(csv())
    .on('data', (row) => {
      //console.log(row["Authors"]);
      var author = row['﻿Authors'].split(',');
      var authorId = row['Author(s) ID'];
      var title = row['Title'];
      var year = row['Year'];
      var sourceTitle= row['Source title'];
      var volume = row['Volume'];
      var issue = row['Issue'];
      var artNo = row['Art. No.'];
      var pageStart = row['Page start'];
      var pageEnd = row['Page end'];
      var doi = "https://doi.org/" + row['DOI'];
      var url = row['Link'];
      var abstract = row['Abstract'];
      var keywords = row['Author Keywords'].split(',');
      //keywords = keywords.replace(/[;]/g, '');
      var documentType = row['Document Type'];
      insertStudyData(title, author, keywords, abstract, doi, url, year);
    })
    .on('end', () => {
      console.log('CSV file successfully processed');
    });
  } catch (err) {
    console.error(err)
  }
}

readAndInsertStudys()

/** Read an individual Study text file, and extract the title, author, and keywords */
function parseStudyFile (filePath, file) {
  // Read text file
  const study = fs.readFileSync(filePath, 'utf8')
  if(study.match(/^title?/m) != null){
    title = study.match(/^title\s?=\s?"(.+)[\"]/m) != null ? study.match(/^title\s?=\s?"(.+)[\"]/m)[1] : study.match(/^title\s?=\s?{(.+)[\}]/m) == null ? "" : study.match(/^title\s?=\s?{(.+)[\}]/m)[1];
  }else{
    title = " "
  }

  if(authorMatch = study.match(/^author?/m) != null){
    author = study.match(/^author\s?=\s?"(.+)[\"]/m) != null ? study.match(/^author\s?=\s?"(.+)[\"]/m)[1] : study.match(/^author\s?=\s?{(.+)[\}]/m) == null ? "" : study.match(/^author\s?=\s?{(.+)[\}]/m)[1];
    author = author.replace(/[&\/\\,#-+()$~%'":*?<>{}]/g, '')
    author = author
      .split(',').join(', ').split(';').join(', ').split(', ').join(', ').split(' and ') // Split each paragraph into it's own array entry
      .map(line => line.replace(/\r\n/g, ' ').trim()) // Remove paragraph line breaks and whitespace
      .filter((line) => (line && line !== '')) // Remove empty lines

  }else{
    author = "Unknown Author"
  }

  if(keyword = study.match(/^keywords?/m) != null){
    //console.log("keyOn")
    keyword = study.match(/^keywords\s?=\s?"(.+)[\"]/m) != null ? study.match(/^keywords\s?=\s?"(.+)[\"]/m)[1] : study.match(/^keywords\s?=\s?{(.+)[\}]/m) == null ? "" : study.match(/^keywords\s?=\s?{(.+)[\}]/m)[1];  
    keywords = keyword
      .split(',').join(', ').split(';').join(', ').split(', ') // Split each paragraph into it's own array entry
      .map(line => line.replace(/\r\n/g, ' ').trim()) // Remove paragraph line breaks and whitespace
      .filter((line) => (line && line !== '')) // Remove empty lines
  }else{
    keywords = " "
  }

  if(study.match(/^abstract?/m) != null){
    abstract = study.match(/^abstract\s?=\s?"(.*?)"/sm) != null ? study.match(/^abstract\s?=\s?"(.*?)"/sm)[1] : study.match(/^abstract\s?=\s?{(.*?)}/sm) == null ? "" : study.match(/^abstract\s?=\s?{(.*?)}/sm)[1];
  }else{
    abstract = " "
  }

  if(study.match(/^doi?/m) != null){
    doi = study.match(/^doi\s?=\s?"(.+)[\"]/m) != null ? study.match(/^doi\s?=\s?"(.+)[\"]/m)[1] : study.match(/^doi\s?=\s?{(.+)[\}]/m) == null ? "" : study.match(/^doi\s?=\s?{(.+)[\}]/m)[1];
  }else{
    doi = " "
  }

  if(study.match(/^url?/m) != null){
    url = study.match(/^url\s?=\s?"(.+)[\"]/m) != null ? study.match(/^url\s?=\s?"(.+)[\"]/m)[1] : study.match(/^url\s?=\s?{(.+)[\}]/m) == null ? "" : study.match(/^url\s?=\s?{(.+)[\}]/m)[1];
  }else{
    url = " "
  }

  if(study.match(/^year?/m) != null){
    year = study.match(/^year\s?=\s?"(.+)[\"]/m) != null ? study.match(/^year\s?=\s?"(.+)[\"]/m)[1] : study.match(/^year\s?=\s?{(.+)[\}]/m) == null ? "" : study.match(/^year\s?=\s?{(.+)[\}]/m)[1];
  }else{
    year = " "
  }

  if (doi.match(/^https:\/\/doi\.org\/?/m) == null) {
    doi = "https://doi.org/" + doi
  }

  //test informations 
  
  if(title == ""){
    console.log('titulo vazio\n') 
  }

  if(author == ""){
    console.log('author vazio\n')
  }
  console.log(author)
  if(keyword == ""){
    console.log('keywords vazio\n')
  }

  if(abstract == ""){
    console.log('abstract vazio\n')
  }


  if(study.match(/^title?/m) == null){
    console.log('nao tem titulo\n') 
  }

  if(study.match(/^author?/m) == null){
    console.log('nao tem author\n')
  }

  if(keyword = study.match(/^keywords?/m) == null){
    console.log('nao tem keywords\n')
  }

  if(study.match(/^abstract?/m) == null){
    console.log('nao tem abstract\n')
  }

  if(study.match(/^doi?/m) == null){
    console.log('nao tem DOI\n')
  }
  if(study.match(/^year?/m) == null){
    console.log('nao tem year\n')
  }
  if(study.match(/^journal?/m) == null){
    if(study.match(/^publisher?/m) == null){
      if(study.match(/^booktitle?/m) == null){
        console.log('nao tem Venue\n')
      }
    }
  } 
  
  //console.log(`Parsed ${keywords.length} Keywords\n`)

  //console.log(`Reading Study - ${title} By ${author}`)

  //console.log("p = "+keywords+" / t = "+title+" / a = "+author)

  return { title, author, keywords, abstract, doi, url, year }
}

/* Bulk index the Study data in Elasticsearch */
async function insertStudyData (title, author, keywords, abstract, doi, url, year) {
  let bulkOps = [] // Array to store bulk operations
  //console.log(keywords)

  //console.log(author)
  // Describe action
  bulkOps.push({ index: { _index: esConnection.index, _type: esConnection.type } })
  
  // Add document
  bulkOps.push({
    author: author,
    title,
    abstract, 
    doi,
    url,
    year,
    //location: i,
    text: keywords
  })


  // Insert remainder of bulk ops array
  await esConnection.client.bulk({ body: bulkOps })
  console.log(`Indexed keywords ${keywords.length - (bulkOps.length / 2)} - ${keywords.length}\n\n\n`)
}