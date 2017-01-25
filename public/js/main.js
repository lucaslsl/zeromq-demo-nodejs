function previewFile() {
  var preview = document.querySelector('img');
  var file    = document.querySelector('input[type=file]').files[0];
  var reader  = new FileReader();

  reader.addEventListener("load", function () {
    preview.src = reader.result;
  }, false);

  if (file) {
    reader.readAsDataURL(file);
  }
}

function uploadFile(){
  var file    = document.querySelector('input[type=file]').files[0];
  var reader  = new FileReader();

  if (file) {
    var oReq = new XMLHttpRequest();
    oReq.open("PUT", '/upload-image', true);
    oReq.setRequestHeader('Content-Type', 'application/octet-stream');
    oReq.setRequestHeader('Accept', '*/*');
    oReq.onload = function (oEvent) {
      let res = JSON.parse(oReq.response);
      let imageUrl = window.location.origin + '/processed_images/' + res.contextId + '.png';
      $('#image-url').attr('href', imageUrl);
      $('#image-url').text(imageUrl);
      console.log(JSON.parse(oReq.response));
    };
    oReq.send(file);
  }
}

$(() => {
  // function previewFile() {
  //   var preview = document.querySelector('img');
  //   var file    = document.querySelector('input[type=file]').files[0];
  //   var reader  = new FileReader();

  //   reader.addEventListener("load", function () {
  //     preview.src = reader.result;
  //   }, false);

  //   if (file) {
  //     reader.readAsDataURL(file);
  //   }
  // }

  // var oReq = new XMLHttpRequest();
  // oReq.open("PUT", "/upload-image");
  // oReq.setRequestHeader('Content-Type', 'application/octet-stream');
  // oReq.setRequestHeader('Accept', '*/*');
  // oReq.responseType = "blob";
  // oReq.onload = function(oEvent) {
  //   var blob = oReq.response;
  //   console.log(blob);
  //   var urlCreator = window.URL || window.webkitURL;
  //   var imageUrl = urlCreator.createObjectURL(blob);
  //   $('#checkers').attr('src',imageUrl);
  // };
  // oReq.send();

});

