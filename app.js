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

  var updateDatabase = function(newData, callback) {
    $.ajax({
      url: "http://localhost:3030/product",
      type: "POST",
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify(newData)
    }).done(function(data){
      callback(data);
    });
  };

  var getProductsNames = function(){
    productsDb.forEach(function(product){
      if(!alreadyAddedProductName(product.productName)){
        productsNames.push(product.productName);
      }
    });
  };

  var deleteProduct = function(product, callback) {
    $.ajax({
      url: "http://localhost:3030/product/delete",
      type: "DELETE",
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify(product)
    }).done(function(data){
      callback(data);
    });
  };
  var optimiseDatabase = function() {
    var expiredIds = [];
    productsDb.forEach(function(product, id){
      if (expiredLongAgo(product.expirationDate)) {
        deleteProduct(product, function(){
          console.log(product.productName + "has been deleted!")
        });
        expiredIds.push(id);
      }
    });
    expiredIds.forEach(function(id){
      productsDb.splice(id, 1);
    });
  };

  var getProducts = function(callback) {
    $.ajax({
        url: "http://localhost:3030/products",
        type: "GET",
        contentType: "application/json"
    }).done(function(data, textStatus){
      callback(data, textStatus);
    });
  };

  var getDatabase = function(){
    getProducts(function(products, textStatus) {
      productsDb = products;
      sortDataBase();
      generateTable();
      getProductsNames();
      optimiseDatabase();
    });
  };

  var sortDataBase = function(){
    productsDb.sort(function(a,b){
      return new Date(a.expirationDate) - new Date(b.expirationDate);
    });
  };

  getDatabase();

  var addProduct = function(){
    var productName = $("#product-name-box").val();
    var expirationDate = $("#date-box").val();
    var amount = parseInt($("#amount-box").val(),10);
    if (expirationDate !== "" && !expiredLongAgo(expirationDate)) {
      if(!alreadyAddedProductName(productName)){
        productsNames.push(productName);
      };
      productsDb.push({
        productName: productName,
        expirationDate: expirationDate,
        amount: amount
      });
      updateDatabase({
        productName: productName,
        expirationDate: expirationDate,
        amount: amount
      }, function(data, textStatus){
        console.log("Updated");
        $("#product-name-box").val("");
        $("#date-box").val("");
        $("#amount-box").val("");
        sortDataBase();
        $("#products-table").empty();
        generateTable();
      });

    };
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

  $("#add").on("click", function() {
    addProduct();
  });

  var substringMatcher = function(strs) {
    return function findMatches(q, cb) {
      var matches, substrRegex;
      matches = [];
      substrRegex = new RegExp(q, 'i');
      $.each(strs, function(i, str) {
        if (substrRegex.test(str)) {
          matches.push({ value: str });
        }
      });

      cb(matches);
    };
  };

  $(document).on("click", ".delete", function(){
    var productId = $(this).parent().parent().data("id");
    var sureness = confirm("Are you sure that you want to delete this product?");
    if(sureness){
      deleteProduct(productsDb.filter(function(product){
        return productId === product._id;
      })[0], function(){
        $("#products-table").empty();
        getDatabase();
      });
    }
  });

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
