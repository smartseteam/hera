/*import Vue from 'vue'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'*/

const vm = new Vue ({
  el: '#vue-instance',
  data () {
    return {
      baseUrl: 'http://localhost:3000', // API url
      searchTerm: '', // Default search term
      topicSearch: 'Title Abstract Keywords', // Default search select
      studyType: 'Tertiary Studies', // Default search study
      searchDebounce: null, // Timeout for search bar debounce
      searchResults: [], // Displayed search results
      numHits: null, // Total search results found
      searchOffset: 0, // Search result pagination offset

      selectedKeyword: null, // Selected Keyword object
      studyOffset: 0, // Offset for study keywords being displayed
      keywords: [],// keywords being displayed in study preview window

      table1Page:1,
      table2Page:1,
      code:'table1',
      records:100,
      perpage:10,
      checked: ['Tertiary Studies', 'Secondary Studies']
    }
  },
  async created () {
    this.searchResults = await this.search() // Search for default term
  },
  computed:{
    PerPage: function() {
    return this.perpage?parseInt(this.perpage):25;
    },
    Records: function() {
    return this.records?parseInt(this.records):0;
    },
    totalPages: function() {
    return this.$refs.table.totalPages;
    }
  },
  methods: {
    /** Debounce search input by 100 ms */
    onSearchInput () {
      //showhide("content-results")      
      clearTimeout(this.searchDebounce)
      this.searchDebounce = setTimeout(async () => {
        this.searchOffset = 0
        this.searchResults = await this.search()
      }, 100)
    },
    /** Call API to search for inputted term */
    async search () {
      const response = await axios.get(`${this.baseUrl}/search`, { params: { term: this.searchTerm, offset: this.searchOffset, study: this.studyType, select: this.topicSearch } })
      this.numHits = response.data.hits.total
      console.log(this.studyType)
      this.exp(response);
      return response.data.hits.hits
    },
    /** Get next page of search results */
    async nextResultsPage () {
      if (this.numHits > 10) {
        this.searchOffset += 10
        if (this.searchOffset + 10 > this.numHits) { this.searchOffset = this.numHits - 10}
        this.searchResults = await this.search()
        document.documentElement.scrollTop = 0
      }
    },
    /** Get previous page of search results */
    async prevResultsPage () {
      this.searchOffset -= 10
      if (this.searchOffset < 0) { this.searchOffset = 0 }
      this.searchResults = await this.search()
      document.documentElement.scrollTop = 0
    },

    //export csv
    async exp (response) {
      totReg = this.numHits
      arrayData = response.data.hits.hits
      offsetsearch = this.searchOffset
      bodyData = "";
      countHits = 0;
      countTot = 0;
      while(countTot < totReg){
        if(countHits == 10){
          countHits = 0;
          offsetsearch += 10;
          const response = await axios.get(`${this.baseUrl}/search`, { params: { term: this.searchTerm, offset: offsetsearch, study: this.studyType, select: this.topicSearch } })
          arrayData = response.data.hits.hits
        }
        arrayData.forEach(element => { 
          console.log(element);
          e = element._source;
          authors = "";
          keywords = "";
          e.author.forEach(author => { 
            authors += author + ", ";
          });
          e.text.forEach(keyword => { 
            keywords += keyword + "; ";
          });
          authors = authors.slice(0, -2);
          keywords = keywords.slice(0, -2);
          abstract = e.abstract.replace(/['"]+/g, '')
          abstract = abstract.replace(/,/g, '')
          abstract = abstract.replace(/\n/g, '')
          title = e.title.replace(/,/g, '')
          bodyData += '"' + authors +'", "'+ title.replace(/['"]+/g, '') +'", "'+ e.year +'", "'+ e.doi.slice(16) +'", "'+ e.url +'", "'+ abstract +'", "'+ keywords + '"\n';
          
          countHits ++;
          countTot ++;
        });
      } 
      header = "Authors,Title,Year,DOI,Link,Abstract,Author Keywords\n";
      dataCsv = header + bodyData; 
      //create csv  
      var data = new Blob([dataCsv]);
      var a = document.getElementById("a");
      a.href = URL.createObjectURL(data);

    },


    async showhide(doi) {
      var kds = document.getElementById(doi);
      var btn = document.getElementById("btn"+doi);
      if (kds.className === "mui--show") {
        kds.className = "mui--hide";
        btn.innerText = "Show";
      }else{
        kds.className = "mui--show";
        btn.innerText = "Hide";
      }
    },
    refresh: function() {
      this.$refs.table.setPage(1);
    },
    prev: function() {
      return this.$refs.table.prev();
    },
    next: function() {
      return this.$refs.table.next();
    },
    prevChunk: function() {
      return this.$refs.table.prevChunk();
    },
    nextChunk: function() {
      return this.$refs.table.nextChunk();
    }
/** Call the API to get current page of paragraphs */
  /*  async showstudyModal (searchHit) {
      try {
        document.getElementByID('myDIV').style.display = 'block'
        this.selectedParagraph = searchHit
        //this.paragraphs = await this.getParagraphs(searchHit._source.title, searchHit._source.location - 5)
      } catch (err) {
        console.error(err)
      }
    } */
  },
  
  ready: function() {
    this.$on('vue-pagination::table', function(page) {
      this.table1Page = page; 
    });
  }
}

)


/*
new Vue({
  el:"#pagination",
  data: {
    table1Page:1,
    table2Page:1,
    code:'table1',
    records:100,
    perpage:10
  },
  computed:{
    PerPage: function() {
    return this.perpage?parseInt(this.perpage):25;
    },
    Records: function() {
    return this.records?parseInt(this.records):0;
    },
    totalPages: function() {
    return this.$refs.table.totalPages;
    }
  },
  methods: {
    refresh: function() {
      this.$refs.table.setPage(1);
    },
     prev: function() {
      return this.$refs.table.prev();
    },
    next: function() {
      return this.$refs.table.next();
    },
    prevChunk: function() {
      return this.$refs.table.prevChunk();
    },
    nextChunk: function() {
      return this.$refs.table.nextChunk();
    }
  },
  ready: function() {
    this.$on('vue-pagination::table', function(page) {
      this.table1Page = page; 
    });
  }
})*/