$(document).ready(function(){
  var productsDb = [];
  var productsNames = [];
  var getCurrentDate = function() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if(dd < 10) {
        dd = '0' + dd
    }
    if(mm < 10) {
        mm = '0' + mm
    }
    today = mm + '/' + dd + '/' + yyyy;
    return today;
  };

  var checkDate = function(date){
    var date1 = new Date(getCurrentDate());
    var date2 = new Date(date);
    var timeDiff = date2.getTime() - date1.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  var soonToExpire = function(date) {
    return checkDate(date) <= 30 && checkDate(date) > 7;
  };

  var expiring = function(date) {
    return checkDate(date) <= 7 && checkDate(date) >= 0;
  };


  var alreadyExpired = function(date) {
    return checkDate(date) < 0 && checkDate(date) >= -7;
  };

  var expiredLongAgo = function(date) {
    return checkDate(date) < -7;
  };

  var alreadyAddedProductName = function(name){
    if (productsNames !== undefined){
      return productsNames.some(function(product){
        return product === name;
      });
    }
  };

  var updateDatabase = function(){
    localStorage.products = JSON.stringify(productsDb);
  };

  var getProductsNames = function(){
    productsDb.forEach(function(product){
      if(!alreadyAddedProductName(product.productName)){
        productsNames.push(product.productName);
      }
    });
  };

  var optimiseDatabase = function() {
    var expiredIds = [];
    productsDb.forEach(function(product, id){
      if (expiredLongAgo(product.expirationDate)) {
        expiredIds.push(id);
      }
    });
    expiredIds.forEach(function(id){
      productsDb.splice(id, 1);
    });
    updateDatabase();
  };

  var loadDatabase = function() {
    if(localStorage.products !== undefined) {
    productsDb = JSON.parse(localStorage.products);
    };
    optimiseDatabase();
    sortDataBase();
    getProductsNames();
  };

  var sortDataBase = function(){
    productsDb.sort(function(a,b){
      return new Date(a.expirationDate) - new Date(b.expirationDate);
    });
  };

  loadDatabase();

  var addProduct = function(){
    var productName = $("#product-name-box").val();
    var expirationDate = $("#date-box").val();
    var amount = $("#amount-box").val();
    if(!alreadyAddedProductName(productName)){
      productsNames.push(productName);
    };
    productsDb.push ({
      productName: productName,
      expirationDate: expirationDate,
      amount: amount
    });
    updateDatabase();
    sortDataBase();
    $("#products-table").empty();
    generateTable();

  };


  var generateProductRow = function(product){
    var productRowSource;
    if (soonToExpire(product.expirationDate)) {
      productRowSource = $("#soon-to-expire").html();
    } else if (expiring(product.expirationDate)) {
      productRowSource = $("#expiring-table-row").html();
    } else if (alreadyExpired(product.expirationDate)) {
      productRowSource = $("#expired-table-row").html();
    } else {
      productRowSource = $("#table-row-template").html();
    }
    var productRowTemplate = Handlebars.compile(productRowSource);
    return productRowTemplate(product);
  };

  var generateTable = function(){
    var allRows = "";
    productsDb.forEach(function(product){
      allRows = allRows + generateProductRow(product);
    });
    $("#products-table").append(allRows);
  };

  generateTable();

  $("#add").on("click", function() {
    addProduct();
  });

  var substringMatcher = function(strs) {
    return function findMatches(q, cb) {
      var matches, substrRegex;

      // an array that will be populated with substring matches
      matches = [];
      console.log(q);

      // regex used to determine if a string contains the substring `q`
      substrRegex = new RegExp(q, 'i');

      // iterate through the pool of strings and for any string that
      // contains the substring `q`, add it to the `matches` array
      $.each(strs, function(i, str) {
        if (substrRegex.test(str)) {
          // the typeahead jQuery plugin expects suggestions to a
          // JavaScript object, refer to typeahead docs for more info
          matches.push({ value: str });
        }
      });

      cb(matches);
    };
  };

  $('.typeahead').typeahead({
    hint: true,
    highlight: true,
    minLength: 3
  }, {
    name: 'products',
    displayKey: 'value',
    source: substringMatcher(productsNames)
  });
});
